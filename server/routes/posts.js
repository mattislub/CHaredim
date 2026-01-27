import { Router } from "express";
import { getClient, query } from "../db.js";

const router = Router();

const MAX_LIMIT = 100;
const RELATED_LIMIT = 6;
const COMMUNITY_GENERAL_CATEGORIES = [
  "Uncategorized",
  "חדשות",
  "בארץ",
  "וידאו",
  "גלריות",
  "טורי דעה",
  "כלכלה",
  "פוליטיקה",
  "משפטי",
  "היסטוריה",
  "העולם היהודי",
  "מקומי",
  "דיור",
  "הציבור הליטאי",
  "עדות המזרח",
  "בחצרות האדמורי\"ם",
  "בנלאומי",
];
const CHAREDIM_POSTS_URL = "https://www.charedim.co.il/wp-json/wp/v2/posts";

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

const normalizeEntities = (value = "") =>
  value
    .toString()
    .replace(/&#8211;/g, "–")
    .replace(/\[&hellip;\]/g, "…")
    .replace(/&quot;?/g, "\"");

const stripHtml = (value = "") =>
  normalizeEntities(
    value
      .toString()
      .replace(/&quot;/g, "\"")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const normalizeCharedimPost = (post) => {
  if (!post) return null;

  const wpId = Number.parseInt(post.id, 10);
  const slug = post.slug || (Number.isInteger(wpId) ? `charedim-${wpId}` : "");

  if (!slug) return null;

  const featuredMedia = post?._embedded?.["wp:featuredmedia"]?.[0];

  const terms = Array.isArray(post?._embedded?.["wp:term"])
    ? post._embedded["wp:term"].flat()
    : [];
  const categories = terms.filter((term) => term?.taxonomy === "category");
  const tags = terms.filter((term) => term?.taxonomy === "post_tag");

  return {
    wp_id: Number.isInteger(wpId) ? wpId : null,
    slug,
    title: stripHtml(post?.title?.rendered ?? ""),
    html: normalizeEntities(post?.content?.rendered ?? ""),
    excerpt: stripHtml(post?.excerpt?.rendered ?? ""),
    published_at: post?.date ?? null,
    modified_at: post?.modified ?? null,
    featured_image_url: featuredMedia?.source_url ?? null,
    categories: categories.map((term) => ({
      name: normalizeEntities(term?.name ?? ""),
      slug: term?.slug ?? "",
      taxonomy: "category",
    })),
    tags: tags.map((term) => ({
      name: normalizeEntities(term?.name ?? ""),
      slug: term?.slug ?? "",
      taxonomy: "post_tag",
    })),
  };
};

const ensureTerm = async (client, term) => {
  if (!term?.taxonomy || (!term?.slug && !term?.name)) {
    return null;
  }

  const existing = await client.query(
    `SELECT id, name
     FROM terms
     WHERE taxonomy = $1 AND (slug = $2 OR name = $3)
     LIMIT 1`,
    [term.taxonomy, term.slug, term.name]
  );

  if (existing.rows.length) {
    const existingRow = existing.rows[0];
    const normalizedName = normalizeEntities(term.name ?? "");
    if (normalizedName && existingRow.name !== normalizedName) {
      await client.query(
        `UPDATE terms
         SET name = $1
         WHERE id = $2`,
        [normalizedName, existingRow.id]
      );
    }
    return existingRow.id;
  }

  const inserted = await client.query(
    `INSERT INTO terms (name, slug, taxonomy)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [term.name, term.slug, term.taxonomy]
  );

  return inserted.rows[0]?.id ?? null;
};

const fetchRelatedPosts = async (postId, termIds, taxonomy) => {
  if (!termIds.length) return [];

  const result = await query(
    `SELECT id, slug, title, featured_image_url, published_at
     FROM (
       SELECT DISTINCT ON (p.id)
         p.id, p.slug, p.title, p.published_at, p.featured_image_url
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

  return result.rows.map(({ published_at, ...rest }) => rest);
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
        `(p.title ILIKE $${values.length - 1} OR p.excerpt ILIKE $${values.length})`
      );
    }

    if (status) {
      values.push(status);
      conditions.push(`p.status = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const totalResult = await query(
      `SELECT COUNT(*)::bigint AS total FROM posts p ${whereClause}`,
      values
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const offset = (page - 1) * limit;

    const itemsResult = await query(
      `${POST_WITH_TERMS_SELECT}
       ${whereClause}
       GROUP BY p.id
       ORDER BY p.published_at DESC NULLS LAST, p.id DESC
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

router.get("/posts/by-category", async (req, res, next) => {
  try {
    const name = req.query.name?.trim();
    const slug = req.query.slug?.trim();
    const filterValue = name || slug;

    if (!filterValue) {
      return res.status(400).json({ error: "missing_category" });
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 8, 1),
      MAX_LIMIT
    );

    const filterColumn = name ? "tc.name" : "tc.slug";
    const result = await query(
      `${POST_WITH_TERMS_SELECT}
       INNER JOIN post_terms ptc ON ptc.post_id = p.id
       INNER JOIN terms tc ON tc.id = ptc.term_id
       WHERE tc.taxonomy = 'category'
         AND ${filterColumn} = $1
       GROUP BY p.id
       ORDER BY p.published_at DESC NULLS LAST, p.id DESC
       LIMIT $2`,
      [filterValue, limit]
    );

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=30");
    }

    return res.json({
      category: filterValue,
      limit,
      items: result.rows,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/posts/communities", async (req, res, next) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 8, 1),
      MAX_LIMIT
    );

    const filterValues = [COMMUNITY_GENERAL_CATEGORIES];
    const result = await query(
      `${POST_WITH_TERMS_SELECT}
       INNER JOIN post_terms ptc ON ptc.post_id = p.id
       INNER JOIN terms tc ON tc.id = ptc.term_id
       WHERE tc.taxonomy = 'category'
         AND tc.name <> ALL($1::text[])
       GROUP BY p.id
       ORDER BY p.published_at DESC NULLS LAST, p.id DESC
       LIMIT $2`,
      [...filterValues, limit]
    );

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=30");
    }

    return res.json({
      limit,
      items: result.rows,
    });
  } catch (err) {
    return next(err);
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

router.post("/posts/import-charedim", async (req, res, next) => {
  const client = await getClient();

  try {
    const limit = Math.min(
      Math.max(parseInt(req.body?.limit, 10) || 20, 1),
      MAX_LIMIT
    );

    const response = await fetch(
      `${CHAREDIM_POSTS_URL}?per_page=${limit}&_embed=1`
    );

    if (!response.ok) {
      return res.status(502).json({ error: "source_unavailable" });
    }

    const sourcePosts = await response.json();
    const normalizedPosts = sourcePosts
      .map(normalizeCharedimPost)
      .filter(Boolean);

    if (!normalizedPosts.length) {
      return res.json({ inserted: 0, skipped: 0 });
    }

    const wpIds = normalizedPosts
      .map((post) => post.wp_id)
      .filter((value) => Number.isInteger(value));

    const existing = wpIds.length
      ? await client.query(
          "SELECT id, wp_id FROM posts WHERE wp_id = ANY($1::int[])",
          [wpIds]
        )
      : { rows: [] };

    const existingByWpId = new Map(
      existing.rows
        .map((row) => [Number.parseInt(row.wp_id, 10), row.id])
        .filter(([wpId]) => Number.isInteger(wpId))
    );

    let inserted = 0;
    let updated = 0;

    await client.query("BEGIN");

    for (const post of normalizedPosts) {
      if (!post.wp_id) continue;

      let postId = existingByWpId.get(post.wp_id);

      if (!postId) {
        const insertedPost = await client.query(
          `INSERT INTO posts
            (wp_id, slug, title, html, excerpt, published_at, modified_at, featured_image_url)
           VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (wp_id) DO NOTHING
           RETURNING id`,
          [
            post.wp_id,
            post.slug,
            post.title,
            post.html,
            post.excerpt,
            post.published_at,
            post.modified_at,
            post.featured_image_url,
          ]
        );

        postId = insertedPost.rows[0]?.id ?? null;
        if (postId) {
          inserted += 1;
        }
      } else {
        await client.query(
          `UPDATE posts
           SET slug = $2,
               title = $3,
               html = $4,
               excerpt = $5,
               published_at = $6,
               modified_at = $7,
               featured_image_url = $8
           WHERE id = $1`,
          [
            postId,
            post.slug,
            post.title,
            post.html,
            post.excerpt,
            post.published_at,
            post.modified_at,
            post.featured_image_url,
          ]
        );
        updated += 1;
      }

      if (!postId) continue;

      const terms = [
        ...(Array.isArray(post.categories) ? post.categories : []),
        ...(Array.isArray(post.tags) ? post.tags : []),
      ];

      for (const term of terms) {
        const termId = await ensureTerm(client, term);
        if (!termId) continue;

        await client.query(
          `INSERT INTO post_terms (post_id, term_id)
           SELECT $1, $2
           WHERE NOT EXISTS (
             SELECT 1 FROM post_terms WHERE post_id = $1 AND term_id = $2
           )`,
          [postId, termId]
        );
      }

    }

    await client.query("COMMIT");

    return res.json({
      inserted,
      updated,
      skipped: normalizedPosts.length - inserted - updated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
});

export default router;
