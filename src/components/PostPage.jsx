import { useEffect, useMemo, useState } from "react";

const buildParagraphs = (content, fallback) => {
  if (typeof content === "string") {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length) {
      return lines;
    }
  }
  return fallback;
};

const formatPostTime = (value) => {
  if (!value) {
    return "ללא תאריך";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "ללא תאריך";
  }
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PostPage({ post, fallback, slug }) {
  const [fetchedPost, setFetchedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const postId = useMemo(() => {
    if (post?.id) {
      return post.id;
    }
    if (fallback?.id) {
      return fallback.id;
    }
    if (slug && /^\d+$/.test(slug)) {
      return Number(slug);
    }
    return null;
  }, [post, fallback, slug]);

  useEffect(() => {
    if (!postId) {
      return undefined;
    }

    const controller = new AbortController();

    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(`/api/posts/${postId}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          setError("not-found");
          setFetchedPost(null);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setFetchedPost(data);
      } catch (fetchError) {
        if (fetchError?.name !== "AbortError") {
          setError("failed");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();

    return () => controller.abort();
  }, [postId]);

  const resolvedPost = fetchedPost || post || fallback;
  const title = resolvedPost.title || fallback.title;
  const image = resolvedPost.featured_image_url || fallback.featured_image_url;
  const paragraphs = buildParagraphs(resolvedPost.content, fallback.body);
  const summary = resolvedPost.excerpt || fallback.summary;
  const htmlContent = resolvedPost.html;
  const fixedHtml = useMemo(
    () => (htmlContent ? htmlContent.replace(/data-src=/g, "src=") : ""),
    [htmlContent]
  );

  return (
    <section className="post-page">
      <div className="post-page__layout">
        <a className="post-page__back" href="#/">
          חזרה לעמוד הראשי
        </a>
        <div className="post-page__hero">
          <div className="post-page__meta">
            <span className="post-page__tag">כתבה</span>
            <span>{formatPostTime(resolvedPost.published_at)}</span>
          </div>
          <h1>{title}</h1>
          <p className="post-page__summary">{summary}</p>
        </div>
        <img
          className="post-page__image"
          src={image}
          alt={title}
        />
        <article className="post-page__content">
          {fixedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: fixedHtml }} />
          ) : (
            paragraphs.map((paragraph, index) => (
              <p key={`${title}-${index}`}>{paragraph}</p>
            ))
          )}
          {isLoading ? <p>טוען את הכתבה...</p> : null}
          {error ? (
            <p role="alert">לא הצלחנו לטעון את הכתבה.</p>
          ) : null}
        </article>
        <div className="post-page__footer">
          <span>עוד כתבות לקהל הקהילתי מחכות בעמוד הראשי.</span>
          <a href="#/" className="post-page__cta">
            חזרה לחדשות
          </a>
        </div>
      </div>
    </section>
  );
}
