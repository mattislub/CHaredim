import { useEffect, useMemo, useState } from "react";
import { formatDateWithHebrew } from "../utils/date";

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

const formatPostTime = (value) => formatDateWithHebrew(value);

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

const getTaxonomyKey = (item) =>
  String(item?.id ?? item?.slug ?? item?.name ?? "")
    .trim()
    .toLowerCase();

export default function PostPage({
  post,
  fallback,
  slug,
  recentPosts = [],
  allPosts = [],
  getPostSlug,
}) {
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

        const response = await fetch(
          `/api/posts/by-id/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn("Post not found for slug.", {
              slug,
              status: response.status,
            });
            throw new Error("not_found");
          }
          console.warn("Post fetch failed.", {
            slug,
            status: response.status,
          });
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
  const categories = Array.isArray(resolvedPost.categories) ? resolvedPost.categories : [];
  const tags = Array.isArray(resolvedPost.tags) ? resolvedPost.tags : [];

  const subtitle = resolvedPost.summary || "";
  const htmlContent = resolvedPost.html || resolvedPost.HTML || "";
  const fixedHtml = useMemo(() => fixWpHtml(htmlContent), [htmlContent]);
  const paragraphs = buildParagraphs(resolvedPost.content, fallback?.body);
  const recentItems = useMemo(
    () => recentPosts.filter((item) => item?.slug && item.slug !== slug),
    [recentPosts, slug]
  );

  const resolveSlug = (item) => {
    if (typeof getPostSlug === "function") {
      return getPostSlug(item);
    }
    return String(item?.slug ?? item?.id ?? item?.title ?? "");
  };

  const categoryKeys = useMemo(
    () => new Set(categories.map(getTaxonomyKey).filter(Boolean)),
    [categories]
  );

  const tagKeys = useMemo(
    () => new Set(tags.map(getTaxonomyKey).filter(Boolean)),
    [tags]
  );

  const computedRelatedByCategory = useMemo(() => {
    if (!allPosts.length || !categoryKeys.size) return [];

    return allPosts
      .filter((item) => {
        const itemSlug = resolveSlug(item);
        if (!itemSlug || itemSlug === slug) return false;
        const itemCategories = Array.isArray(item?.categories) ? item.categories : [];
        return itemCategories.some((category) => categoryKeys.has(getTaxonomyKey(category)));
      })
      .map((item) => ({
        title: item?.title,
        slug: resolveSlug(item),
      }))
      .filter((item) => item.title && item.slug);
  }, [allPosts, categoryKeys, slug, getPostSlug]);

  const computedRelatedByTags = useMemo(() => {
    if (!allPosts.length || !tagKeys.size) return [];

    return allPosts
      .filter((item) => {
        const itemSlug = resolveSlug(item);
        if (!itemSlug || itemSlug === slug) return false;
        const itemTags = Array.isArray(item?.tags) ? item.tags : [];
        return itemTags.some((tag) => tagKeys.has(getTaxonomyKey(tag)));
      })
      .map((item) => ({
        title: item?.title,
        slug: resolveSlug(item),
      }))
      .filter((item) => item.title && item.slug);
  }, [allPosts, tagKeys, slug, getPostSlug]);

  const relatedByCategory = Array.isArray(resolvedPost.relatedByCategory)
    ? resolvedPost.relatedByCategory
    : computedRelatedByCategory;
  const relatedByTags = Array.isArray(resolvedPost.relatedByTags)
    ? resolvedPost.relatedByTags
    : computedRelatedByTags;

  return (
    <section className="post-page" dir="rtl">
      <div className="post-page__layout">
        <a className="post-page__back" href="#/">
          חזרה לעמוד הראשי
        </a>

        <div className="post-page__grid">
          <div className="post-page__main">
            <div className="post-page__hero">
              <div className="post-page__meta">
                <span className="post-page__tag">כתבה</span>
                <span>{formatPostTime(publishedAt)}</span>
              </div>

              <h1>{title}</h1>

              {subtitle ? <p className="post-page__subtitle">{subtitle}</p> : null}

              {categories.length || tags.length ? (
                <div className="post-page__taxonomies">
                  {categories.length ? (
                    <div className="post-page__taxonomy-group">
                      <span className="post-page__taxonomy-label">קטגוריות:</span>
                      <ul className="post-page__taxonomy-list" aria-label="קטגוריות">
                        {categories.map((category) => (
                          <li
                            className="post-page__taxonomy-chip post-page__taxonomy-chip--category"
                            key={category.id ?? category.slug ?? category.name}
                          >
                            {category.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {tags.length ? (
                    <div className="post-page__taxonomy-group">
                      <span className="post-page__taxonomy-label">תגיות:</span>
                      <ul className="post-page__taxonomy-list" aria-label="תגיות">
                        {tags.map((tag) => (
                          <li
                            className="post-page__taxonomy-chip post-page__taxonomy-chip--tag"
                            key={tag.id ?? tag.slug ?? tag.name}
                          >
                            {tag.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
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
                  {error === "not_found"
                    ? "הכתבה לא נמצאה."
                    : "לא הצלחנו לטעון את הכתבה."}
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

            <div className="post-page__related">
              <div className="post-page__related-group">
                <h2 className="post-page__related-title">עוד באותה קטגוריה</h2>
                {relatedByCategory.length ? (
                  <ul className="post-page__related-list">
                    {relatedByCategory.map((item) => (
                      <li className="post-page__related-item" key={item.slug}>
                        <a href={`#/post/${item.slug}`} className="post-page__related-link">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="post-page__related-empty">
                    אין פוסטים נוספים באותה קטגוריה.
                  </p>
                )}
              </div>

              <div className="post-page__related-group">
                <h2 className="post-page__related-title">עוד עם אותם תגיות</h2>
                {relatedByTags.length ? (
                  <ul className="post-page__related-list">
                    {relatedByTags.map((item) => (
                      <li className="post-page__related-item" key={item.slug}>
                        <a href={`#/post/${item.slug}`} className="post-page__related-link">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="post-page__related-empty">
                    אין פוסטים נוספים עם תגיות דומות.
                  </p>
                )}
              </div>
            </div>

            <div className="post-page__footer">
              <span>עוד כתבות מחכות בעמוד הראשי.</span>
              <a href="#/" className="post-page__cta">
                חזרה לחדשות
              </a>
            </div>
          </div>

          <aside className="post-page__sidebar">
            <h2 className="post-page__sidebar-title">פוסטים אחרונים</h2>
            {recentItems.length ? (
              <ul className="post-page__recent-list">
                {recentItems.map((item) => (
                  <li className="post-page__recent-item" key={item.slug}>
                    <a href={`#/post/${item.slug}`} className="post-page__recent-link">
                      {item.image ? (
                        <img
                          className="post-page__recent-image"
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : null}
                      <span className="post-page__recent-text">{item.title}</span>
                    </a>
                    {item.publishedAt ? (
                      <span className="post-page__recent-time">
                        {formatPostTime(item.publishedAt)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="post-page__recent-empty">אין פוסטים אחרונים להצגה.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
