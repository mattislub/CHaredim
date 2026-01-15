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

  const isNotFound = error === "not-found";
  const hasError = Boolean(error && error !== "not-found");
  const resolvedPost = !isNotFound ? fetchedPost || post || fallback : fallback;
  const title = resolvedPost.title || fallback.title;
  const image = resolvedPost.featured_image_url || fallback.featured_image_url;
  const paragraphs = buildParagraphs(resolvedPost.content, fallback.body);
  const summary = resolvedPost.excerpt || fallback.summary;
  const htmlContent = resolvedPost.html;
  const fixedHtml = useMemo(
    () => (htmlContent ? htmlContent.replace(/data-src=/g, "src=") : ""),
    [htmlContent]
  );
  const canRenderContent = !isLoading && (resolvedPost || !hasError);

  if (isNotFound) {
    return (
      <section className="post-page" dir="rtl">
        <div className="post-page__layout">
          <a className="post-page__back" href="#/">
            חזרה לעמוד הראשי
          </a>
          <div className="post-page__hero">
            <div className="post-page__meta">
              <span className="post-page__tag">כתבה</span>
            </div>
            <h1>הכתבה לא נמצאה</h1>
            <p className="post-page__summary">
              לא הצלחנו למצוא את הכתבה שביקשתם. אפשר לחזור לדף הבית ולהמשיך
              לקרוא את שאר העדכונים.
            </p>
          </div>
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

  return (
    <section className="post-page" dir="rtl">
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
          {isLoading && !fetchedPost ? (
            <p className="post-page__status">טוען את הכתבה...</p>
          ) : null}
          {hasError ? (
            <p className="post-page__status" role="alert">
              לא הצלחנו לטעון את הכתבה.
            </p>
          ) : null}
          {canRenderContent && fixedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: fixedHtml }} />
          ) : canRenderContent ? (
            paragraphs.map((paragraph, index) => (
              <p key={`${title}-${index}`}>{paragraph}</p>
            ))
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
