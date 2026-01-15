import { useEffect, useMemo, useState } from "react";

const buildParagraphs = (content, fallback) => {
  if (typeof content === "string") {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length) return lines;
  }
  return Array.isArray(fallback) ? fallback : [];
};

const formatPostTime = (value) => {
  if (!value) return "ללא תאריך";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ללא תאריך";
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fixWpHtml = (html) => {
  if (!html) return "";

  return (
    html
      // lazyload iframes/images
      .replace(/data-src=/g, "src=")
      .replace(/data-srcset=/g, "srcset=")
      .replace(/data-sizes=/g, "sizes=")
      // add loading=lazy to images if missing
      .replace(/<img(?![^>]*\sloading=)/g, '<img loading="lazy"')
  );
};

export default function PostPage({ post, fallback, slug }) {
  const [fetchedPost, setFetchedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return undefined;

    const controller = new AbortController();

    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("not_found");
          throw new Error("fetch_failed");
        }

        const data = await response.json();
        setFetchedPost(data);
      } catch (fetchError) {
        if (fetchError?.name !== "AbortError") {
          setError(fetchError?.message === "not_found" ? "not_found" : "failed");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
    return () => controller.abort();
  }, [slug]);

  const resolvedPost = fetchedPost || post || fallback || {};
  const title = resolvedPost.title || fallback?.title || "";
  const image = resolvedPost.featured_image_url || fallback?.featured_image_url || "";
  const publishedAt = resolvedPost.published_at || fallback?.published_at;

  const excerptHtml = resolvedPost.excerpt || fallback?.summary || "";
  const htmlContent = resolvedPost.html || "";
  const fixedHtml = useMemo(() => fixWpHtml(htmlContent), [htmlContent]);
  const paragraphs = buildParagraphs(resolvedPost.content, fallback?.body);

  return (
    <section className="post-page" dir="rtl">
      <div className="post-page__layout">
        <a className="post-page__back" href="#/">
          חזרה לעמוד הראשי
        </a>

        <div className="post-page__hero">
          <div className="post-page__meta">
            <span className="post-page__tag">כתבה</span>
            <span>{formatPostTime(publishedAt)}</span>
          </div>

          <h1>{title}</h1>

          {excerptHtml ? (
            <div
              className="post-page__summary"
              dangerouslySetInnerHTML={{ __html: fixWpHtml(excerptHtml) }}
            />
          ) : null}
        </div>

        {image ? (
          <img
            className="post-page__image"
            src={image}
            alt={title}
            loading="lazy"
          />
        ) : null}

        <article className="post-page__content">
          {isLoading ? <p>טוען את הכתבה...</p> : null}

          {error ? (
            <p role="alert">
              {error === "not_found" ? "הכתבה לא נמצאה." : "לא הצלחנו לטעון את הכתבה."}
            </p>
          ) : null}

          {!isLoading && !error ? (
            fixedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: fixedHtml }} />
            ) : (
              paragraphs.map((paragraph, index) => (
                <p key={`${title}-${index}`}>{paragraph}</p>
              ))
            )
          ) : null}
        </article>

        <div className="post-page__footer">
          <span>עוד כתבות מחכות בעמוד הראשי.</span>
          <a href="#/" className="post-page__cta">
            חזרה לחדשות
          </a>
        </div>
      </div>
    </section>
  );
}
