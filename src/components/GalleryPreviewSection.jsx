import { useMemo } from "react";
import GalleryCard from "./GalleryCard";
import { extractPostImages, isInGalleryCategory } from "../utils/gallery";

const getPostTimestamp = (post) => {
  const timestamp = new Date(post?.published_at ?? 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function GalleryPreviewSection({
  posts = [],
  isLoading,
  error,
  getPostSlug,
}) {
  const galleryPosts = useMemo(() => {
    if (!posts.length) return [];

    return posts
      .filter((post) => isInGalleryCategory(post) ?? false)
      .map((post) => ({
        post,
        images: extractPostImages(post),
      }))
      .filter(({ images }) => images.length >= 5)
      .sort((a, b) => getPostTimestamp(b.post) - getPostTimestamp(a.post))
      .slice(0, 3);
  }, [posts]);

  return (
    <section className="section section--light gallery-preview" dir="rtl">
      <div className="gallery-preview__header">
        <div className="gallery-preview__title">
          <p className="gallery-page__badge">גלריות</p>
          <h2>גלריות אחרונות</h2>
        </div>
        <a className="gallery-preview__link" href="#/galleries">
          לכל הגלריות
        </a>
      </div>

      {isLoading ? (
        <p className="section__status">טוען גלריות...</p>
      ) : null}

      {error ? (
        <p className="section__status section__status--error" role="alert">
          לא הצלחנו לטעון את הגלריות כרגע.
        </p>
      ) : null}

      {!isLoading && !error ? (
        galleryPosts.length ? (
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
        ) : (
          <p className="section__status">
            עדיין אין פוסטים אחרונים בקטגוריית גלריות עם 5 תמונות ומעלה להצגה.
          </p>
        )
      ) : null}
    </section>
  );
}
