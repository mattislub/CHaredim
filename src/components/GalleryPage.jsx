import { useEffect, useMemo, useState } from "react";
import GalleryCard from "./GalleryCard";
import { fetchGalleryPosts } from "../api/posts";
import { extractPostImages, isInGalleryCategory } from "../utils/gallery";

export default function GalleryPage({ getPostSlug }) {
  const PAGE_SIZE = 9;
  const [rawPosts, setRawPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const galleryPosts = useMemo(
    () =>
      rawPosts
        .filter((post) => isInGalleryCategory(post) ?? false)
        .map((post) => ({
          post,
          images: extractPostImages(post),
        }))
        .filter(({ images }) => images.length >= 5),
    [rawPosts]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadGalleries = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchGalleryPosts({
          page,
          limit: PAGE_SIZE,
          signal: controller.signal,
        });
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        setRawPosts((current) => (page === 1 ? nextItems : [...current, ...nextItems]));
        setTotalPages(Number(data?.totalPages) || 1);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "fetch_failed");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadGalleries();

    return () => controller.abort();
  }, [page]);

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
        {!isLoading && !error && galleryPosts.length ? (
          <p className="gallery-page__count">
            מציגים {galleryPosts.length} גלריות.
          </p>
        ) : null}
      </div>

      {isLoading && !rawPosts.length ? (
        <p className="gallery-page__status">טוען גלריות...</p>
      ) : null}

      {error ? (
        <p className="gallery-page__status" role="alert">
          לא הצלחנו לטעון את הגלריות כרגע.
        </p>
      ) : null}

      {!error ? (
        galleryPosts.length ? (
          <>
            <div className="gallery-page__grid">
              {galleryPosts.map(({ post, images }) => {
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
                  onClick={() => setPage((current) => current + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? "טוען..." : "טען עוד"}
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
