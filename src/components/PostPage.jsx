import { useEffect, useMemo, useState } from "react";

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getYouTubeId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    if (hostname === "youtu.be") {
      return parsedUrl.pathname.replace("/", "") || null;
    }
    if (hostname.endsWith("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2] || null;
      }
      return parsedUrl.searchParams.get("v");
    }
  } catch (error) {
    return null;
  }
  return null;
};

const applyFormatting = (value) => {
  const embeds = [];
  let embedIndex = 0;
  const textWithTokens = value.replace(
    /\[youtube\]([\s\S]*?)\[\/youtube\]/gi,
    (match, url) => {
      const token = `__YOUTUBE_EMBED_${embedIndex}__`;
      embeds.push({ token, url: url.trim() });
      embedIndex += 1;
      return token;
    }
  );

  let escaped = escapeHtml(textWithTokens);
  escaped = escaped
    .replace(/\[big\]([\s\S]*?)\[\/big\]/gi, '<span class="post-page__text--big">$1</span>')
    .replace(/\[small\]([\s\S]*?)\[\/small\]/gi, '<span class="post-page__text--small">$1</span>')
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<span class="post-page__text--underline">$1</span>');

  embeds.forEach(({ token, url }) => {
    const videoId = getYouTubeId(url);
    const safeUrl = escapeHtml(url);
    const embedMarkup = videoId
      ? `<div class="post-page__embed"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : `<a class="post-page__link" href="${safeUrl}" target="_blank" rel="noreferrer">${safeUrl}</a>`;
    escaped = escaped.replace(token, embedMarkup);
  });

  return escaped;
};

const buildFormattedContent = (content, fallback) => {
  const rawContent = typeof content === "string" ? content : "";
  const fallbackText = Array.isArray(fallback) ? fallback.join("\n\n") : fallback;
  const source = rawContent || fallbackText || "";
  const blocks = source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return "";
  }

  return blocks
    .map((block) => {
      const formatted = applyFormatting(block).replace(/\n/g, "<br />");
      if (formatted.includes("post-page__embed")) {
        return `<div class="post-page__embed-block">${formatted}</div>`;
      }
      return `<p>${formatted}</p>`;
    })
    .join("");
};

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
  const formattedContent = useMemo(
    () => buildFormattedContent(resolvedPost.content, fallback.body),
    [resolvedPost.content, fallback.body]
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
          ) : formattedContent ? (
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
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
