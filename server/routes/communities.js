import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const MAX_LIMIT = 100;

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      MAX_LIMIT
    );
    const term = req.query.term?.trim() || "קהילות";
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

export default router;
