import { useCallback, useEffect, useMemo, useState } from "react";
import GalleryCard from "./GalleryCard";
import { extractPostImages, isInGalleryCategory } from "../utils/gallery";
import { fetchGalleryPosts } from "../api/posts";

export default function GalleryPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGalleryPosts = useCallback(async ({ pageToLoad, append, signal } = {}) => {
    try {
      setIsLoading(true);
      setError("");
      const data = await fetchGalleryPosts({ page: pageToLoad, limit: 12, signal });
      const items = Array.isArray(data.items) ? data.items : [];

      setPosts((prev) => (append ? [...prev, ...items] : items));
      setPage(Number(data.page) || pageToLoad);
      setTotalPages(Number(data.totalPages) || 1);
    } catch (fetchError) {
      if (fetchError?.name !== "AbortError") {
        setError("failed");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadGalleryPosts({ pageToLoad: 1, append: false, signal: controller.signal });
    return () => controller.abort();
  }, [loadGalleryPosts]);

  const handleLoadMore = () => {
    if (isLoading || page >= totalPages) return;
    loadGalleryPosts({ pageToLoad: page + 1, append: true });
  };

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
  const hasMore = page < totalPages;

  return (
    <section className="gallery-page" dir="rtl">
      <div className="gallery-page__header">
        <p className="gallery-page__badge">גלריות</p>
        <h1>גלריות תמונות מהקהילות</h1>
        <p className="gallery-page__subtitle">
          כאן תוכלו למצוא פוסטים עתירי תמונות. בכל כרטיס מוצגות 2-3 תמונות שמתחלפות כל כמה
          שניות.
        </p>
      </div>

      {isLoading ? <p className="gallery-page__status">טוען גלריות...</p> : null}

      {error ? (
        <p className="gallery-page__status" role="alert">
          לא הצלחנו לטעון את הגלריות כרגע.
        </p>
      ) : null}

      {!isLoading && !error ? (
        galleryPosts.length ? (
          <div className="gallery-page__grid">
            {galleryPosts.map(({ post, images }) => {
              const slug = String(post?.id ?? post?.slug ?? "");
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
        ) : (
          <p className="gallery-page__empty">
            עדיין אין פוסטים בקטגוריית גלריות עם 5 תמונות ומעלה להצגה.
          </p>
        )
      ) : null}

      {!error && hasMore ? (
        <div className="gallery-page__actions">
          <button
            className="gallery-page__more"
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            טען עוד גלריות
          </button>
        </div>
      ) : null}
    </section>
  );
}
