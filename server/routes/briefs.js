import { Router } from "express";
import { getClient, query } from "../db.js";

const router = Router();

const MAX_LIMIT = 100;
const DEFAULT_SOURCE = "charedim.co.il";
const CHAREDIM_POSTS_URL = "https://www.charedim.co.il/wp-json/wp/v2/posts";
const CHAREDIM_BRIEFS_URL =
  process.env.CHAREDIM_BRIEFS_URL ||
  "https://www.charedim.co.il/wp-json/wp/v2/briefs";
const FALLBACK_SOURCES = [
  CHAREDIM_BRIEFS_URL,
  "https://www.charedim.co.il/wp-json/wp/v2/breaking-news",
  "https://www.charedim.co.il/wp-json/wp/v2/breaking_news",
  "https://www.charedim.co.il/wp-json/wp/v2/flash",
];

const stripHtml = (value = "") =>
  value
    .toString()
    .replace(/&quot;/g, "\"")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeCharedimBrief = (brief) => {
  if (!brief) return null;

  const wpId = Number.parseInt(brief.id, 10);
  const slug = brief.slug || (Number.isInteger(wpId) ? `brief-${wpId}` : "");

  if (!slug) return null;

  const subtitle =
    stripHtml(brief?.excerpt?.rendered ?? "") ||
    stripHtml(brief?.acf?.subtitle ?? "") ||
    stripHtml(brief?.yoast_headline ?? "") ||
    "אין תקציר זמין למבזק זה.";

  return {
    wp_id: Number.isInteger(wpId) ? wpId : null,
    slug,
    title: stripHtml(brief?.title?.rendered ?? ""),
    subtitle,
    published_at: brief?.date ?? null,
    modified_at: brief?.modified ?? null,
    source: DEFAULT_SOURCE,
    source_url: brief?.link ?? "https://www.charedim.co.il",
  };
};

const fetchBriefsFromSource = async (sourceUrl, limit) => {
  const url = new URL(sourceUrl);
  url.searchParams.set("per_page", String(limit));
  url.searchParams.set("_embed", "1");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Source failed with status ${response.status}`);
  }

  return response.json();
};

router.get("/briefs", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    const totalResult = await query(
      "SELECT COUNT(*)::bigint AS total FROM briefs"
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const itemsResult = await query(
      `SELECT id, slug, title, subtitle, published_at, source, source_url
       FROM briefs
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    if (process.env.NODE_ENV === "production") {
      res.set("Cache-Control", "public, max-age=30");
    }

    return res.json({
      page,
      limit,
      total,
      totalPages,
      items: itemsResult.rows,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/briefs/import-charedim", async (req, res, next) => {
  const client = await getClient();

  try {
    const limit = Math.min(
      Math.max(parseInt(req.body?.limit, 10) || 20, 1),
      MAX_LIMIT
    );
    const requestedSource = req.body?.sourceUrl?.toString().trim();
    const sourcesToTry = [
      ...(requestedSource ? [requestedSource] : []),
      ...FALLBACK_SOURCES,
      `${CHAREDIM_POSTS_URL}?search=מבזק`,
    ];

    let sourceBriefs = [];
    let sourceUsed = null;

    for (const source of sourcesToTry) {
      try {
        const response = await fetchBriefsFromSource(source, limit);
        if (Array.isArray(response) && response.length) {
          sourceBriefs = response;
          sourceUsed = source;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!sourceBriefs.length) {
      return res.status(502).json({ error: "source_unavailable" });
    }

    const normalizedBriefs = sourceBriefs
      .map(normalizeCharedimBrief)
      .filter(Boolean);

    if (!normalizedBriefs.length) {
      return res.json({ inserted: 0, skipped: 0, source: sourceUsed });
    }

    const wpIds = normalizedBriefs
      .map((brief) => brief.wp_id)
      .filter((value) => Number.isInteger(value));

    const existing = wpIds.length
      ? await client.query(
          "SELECT wp_id FROM briefs WHERE wp_id = ANY($1::int[])",
          [wpIds]
        )
      : { rows: [] };

    const existingIds = new Set(
      existing.rows
        .map((row) => Number.parseInt(row.wp_id, 10))
        .filter((value) => Number.isInteger(value))
    );

    const toInsert = normalizedBriefs.filter(
      (brief) => brief.wp_id && !existingIds.has(brief.wp_id)
    );

    let inserted = 0;

    await client.query("BEGIN");

    for (const brief of toInsert) {
      const insertedBrief = await client.query(
        `INSERT INTO briefs
          (wp_id, slug, title, subtitle, published_at, modified_at, source, source_url)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (wp_id) DO NOTHING
         RETURNING id`,
        [
          brief.wp_id,
          brief.slug,
          brief.title,
          brief.subtitle,
          brief.published_at,
          brief.modified_at,
          brief.source,
          brief.source_url,
        ]
      );

      if (insertedBrief.rows[0]?.id) {
        inserted += 1;
      }
    }

    await client.query("COMMIT");

    return res.json({
      inserted,
      skipped: normalizedBriefs.length - inserted,
      source: sourceUsed,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
});

export default router;
