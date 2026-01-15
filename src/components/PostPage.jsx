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

export default function PostPage({ post, fallback }) {
  const resolvedPost = post || fallback;
  const title = resolvedPost.title || fallback.title;
  const image = resolvedPost.featured_image_url || fallback.featured_image_url;
  const paragraphs = buildParagraphs(resolvedPost.content, fallback.body);
  const summary = resolvedPost.excerpt || fallback.summary;

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
          {paragraphs.map((paragraph, index) => (
            <p key={`${title}-${index}`}>{paragraph}</p>
          ))}
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
