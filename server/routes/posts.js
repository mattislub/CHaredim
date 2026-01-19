import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const MAX_LIMIT = 100;
const RELATED_LIMIT = 6;

const POST_WITH_TERMS_SELECT = `
  SELECT
    p.id,
    p.slug,
    p.title,
    p.html,
    p.excerpt,
    p.published_at,
    p.modified_at,
    p.featured_image_url,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        )
      ) FILTER (WHERE t.taxonomy = 'category'),
      '[]'::jsonb
    ) AS categories,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        )
      ) FILTER (WHERE t.taxonomy = 'post_tag'),
      '[]'::jsonb
    ) AS tags
  FROM posts p
  LEFT JOIN post_terms pt ON pt.post_id = p.id
  LEFT JOIN terms t ON t.id = pt.term_id
`;

const normalizeTermIds = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => Number.parseInt(item?.id, 10))
    .filter((value) => Number.isInteger(value));

const fetchRelatedPosts = async (postId, termIds, taxonomy) => {
  if (!termIds.length) return [];

  const result = await query(
    `SELECT id, slug, title
     FROM (
       SELECT DISTINCT ON (p.id)
         p.id, p.slug, p.title, p.published_at
       FROM posts p
       INNER JOIN post_terms pt ON pt.post_id = p.id
       INNER JOIN terms t ON t.id = pt.term_id
       WHERE p.id <> $1
         AND t.taxonomy = $2
         AND t.id = ANY($3::int[])
       ORDER BY p.id, p.published_at DESC NULLS LAST
     ) AS related
     ORDER BY published_at DESC NULLS LAST, id DESC
     LIMIT $4`,
    [postId, taxonomy, termIds, RELATED_LIMIT]
  );

  return result.rows;
};

const attachRelatedPosts = async (post) => {
  if (!post) return post;

  const categoryIds = normalizeTermIds(post.categories);
  const tagIds = normalizeTermIds(post.tags);

  const [relatedByCategory, relatedByTags] = await Promise.all([
    fetchRelatedPosts(post.id, categoryIds, "category"),
    fetchRelatedPosts(post.id, tagIds, "post_tag"),
  ]);

  return {
    ...post,
    relatedByCategory,
    relatedByTags,
  };
};

router.get("/posts", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      MAX_LIMIT
    );
    const q = req.query.q?.trim();
    const status = req.query.status?.trim();

    const conditions = [];
    const values = [];

    if (q) {
      values.push(`%${q}%`);
      values.push(`%${q}%`);
      conditions.push(
        `(title ILIKE $${values.length - 1} OR excerpt ILIKE $${values.length})`
      );
    }

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const totalResult = await query(
      `SELECT COUNT(*)::bigint AS total FROM posts ${whereClause}`,
      values
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const offset = (page - 1) * limit;

    const itemsResult = await query(
      `SELECT id, slug, title, excerpt, published_at, featured_image_url
       FROM posts
       ${whereClause}
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=30");
    }

    res.json({
      page,
      limit,
      total,
      totalPages,
      items: itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/galleries", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      MAX_LIMIT
    );
    const term = req.query.term?.trim() || "גלריות";
    const offset = (page - 1) * limit;

    const totalResult = await query(
      `SELECT COUNT(DISTINCT posts.id)::bigint AS total
       FROM posts
       INNER JOIN post_terms ON post_terms.post_id = posts.id
       INNER JOIN terms ON terms.id = post_terms.term_id
       WHERE terms.taxonomy = 'category'
         AND (terms.name = $1 OR terms.slug = $1)`,
      [term]
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const itemsResult = await query(
      `SELECT id, slug, title, excerpt, published_at, featured_image_url
       FROM posts
       WHERE id IN (
         SELECT post_terms.post_id
         FROM post_terms
         INNER JOIN terms ON terms.id = post_terms.term_id
         WHERE terms.taxonomy = 'category'
           AND (terms.name = $1 OR terms.slug = $1)
       )
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT $2 OFFSET $3`,
      [term, limit, offset]
    );

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=30");
    }

    res.json({
      page,
      limit,
      total,
      totalPages,
      items: itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/posts/by-wp/:wp_id", async (req, res, next) => {
  try {
    const wpId = Number.parseInt(req.params.wp_id, 10);
    if (Number.isNaN(wpId)) {
      return res.status(400).json({ error: "invalid_wp_id" });
    }

    const result = await query(
      `${POST_WITH_TERMS_SELECT}
       WHERE p.wp_id = $1
       GROUP BY p.id
       LIMIT 1`,
      [wpId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "not_found" });
    }

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=60");
    }

    const resolvedPost = await attachRelatedPosts(result.rows[0]);

    return res.json(resolvedPost);
  } catch (err) {
    return next(err);
  }
});

router.get("/posts/by-id/:id", async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const result = await query(
      `${POST_WITH_TERMS_SELECT}
       WHERE p.id = $1
       GROUP BY p.id
       LIMIT 1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "not_found" });
    }

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=60");
    }

    const resolvedPost = await attachRelatedPosts(result.rows[0]);

    return res.json(resolvedPost);
  } catch (err) {
    return next(err);
  }
});

router.get("/posts/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `${POST_WITH_TERMS_SELECT}
       WHERE p.slug = $1
       GROUP BY p.id
       LIMIT 1`,
      [slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "not_found" });
    }

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=60");
    }

    const resolvedPost = await attachRelatedPosts(result.rows[0]);

    return res.json(resolvedPost);
  } catch (err) {
    return next(err);
  }
});

export default router;
