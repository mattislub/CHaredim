import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const MAX_LIMIT = 100;

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

    return res.json(result.rows[0]);
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

    return res.json(result.rows[0]);
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

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;
