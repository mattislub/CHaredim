import { useEffect, useMemo, useState } from "react";
import GalleryCard from "./GalleryCard";
import { extractPostImages, isInGalleryCategory } from "../utils/gallery";

export default function GalleryPage({ posts = [], isLoading, error, getPostSlug }) {
  const PAGE_SIZE = 9;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const galleryPosts = useMemo(() => {
    if (!posts.length) return [];

    return posts
      .filter((post) => isInGalleryCategory(post) ?? false)
      .map((post) => ({
        post,
        images: extractPostImages(post),
      }))
      .filter(({ images }) => images.length >= 5);
  }, [posts]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [galleryPosts.length]);

  const visiblePosts = useMemo(
    () => galleryPosts.slice(0, visibleCount),
    [galleryPosts, visibleCount]
  );
  const hasMore = visibleCount < galleryPosts.length;

  return (
    <section className="gallery-page" dir="rtl">
      <div className="gallery-page__header">
        <p className="gallery-page__badge">גלריות</p>
        <h1>גלריות תמונות מהקהילות</h1>
        <p className="gallery-page__subtitle">
          כאן תוכלו למצוא פוסטים עתירי תמונות. בכל כרטיס מוצגות 2-3 תמונות שמתחלפות כל כמה
          שניות.
        </p>
        {!isLoading && !error && galleryPosts.length ? (
          <p className="gallery-page__count">
            מציגים {Math.min(visibleCount, galleryPosts.length)} מתוך {galleryPosts.length} גלריות.
          </p>
        ) : null}
      </div>

      {isLoading ? <p className="gallery-page__status">טוען גלריות...</p> : null}

      {error ? (
        <p className="gallery-page__status" role="alert">
          לא הצלחנו לטעון את הגלריות כרגע.
        </p>
      ) : null}

      {!isLoading && !error ? (
        galleryPosts.length ? (
          <>
            <div className="gallery-page__grid">
              {visiblePosts.map(({ post, images }) => {
                const slug = getPostSlug ? getPostSlug(post) : String(post.id ?? "");
                return (
                  <GalleryCard
                    key={slug || post.id}
                    post={post}
                    images={images}
                    slug={encodeURIComponent(slug)}
                  />
                );
              })}
            </div>
            {hasMore ? (
              <div className="gallery-page__actions">
                <button
                  className="gallery-page__load-more"
                  type="button"
                  onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                >
                  טען עוד
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="gallery-page__empty">
            עדיין אין פוסטים בקטגוריית גלריות עם 5 תמונות ומעלה להצגה.
          </p>
        )
      ) : null}
    </section>
  );
}
