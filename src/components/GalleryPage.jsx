import { useEffect, useMemo, useState } from "react";

const IMAGE_ROTATION_INTERVAL = 4000;
const PREVIEW_IMAGE_COUNT = 3;

const addImage = (set, value) => {
  if (typeof value === "string" && value.trim()) {
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith("data:image/svg+xml")) return;
    set.add(trimmedValue);
  }
};

const addSrcsetImages = (set, srcset) => {
  if (typeof srcset !== "string") return;
  srcset.split(",").forEach((candidate) => {
    const url = candidate.trim().split(/\s+/)[0];
    if (url) {
      addImage(set, url);
    }
  });
};

const collectImagesFromArray = (set, values) => {
  if (!Array.isArray(values)) return;

  values.forEach((item) => {
    if (typeof item === "string") {
      addImage(set, item);
      return;
    }

    if (item && typeof item === "object") {
      addImage(set, item.url);
      addImage(set, item.src);
      addImage(set, item.image);
    }
  });
};

const collectImagesFromHtml = (set, html) => {
  if (typeof html !== "string") return;
  const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["']/gi;
  const srcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const dataSrcsetRegex = /<img[^>]+data-srcset=["']([^"']+)["']/gi;
  const srcsetRegex = /<img[^>]+srcset=["']([^"']+)["']/gi;
  const linkRegex =
    /<a[^>]+href=["']([^"']+\.(?:png|jpe?g|gif|webp|svg))["']/gi;
  let match;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    addImage(set, match[1]);
  }
  while ((match = dataSrcsetRegex.exec(html)) !== null) {
    addSrcsetImages(set, match[1]);
  }
  while ((match = srcRegex.exec(html)) !== null) {
    addImage(set, match[1]);
  }
  while ((match = srcsetRegex.exec(html)) !== null) {
    addSrcsetImages(set, match[1]);
  }
  while ((match = linkRegex.exec(html)) !== null) {
    addImage(set, match[1]);
  }
};

const extractPostImages = (post) => {
  const images = new Set();
  if (!post) return [];

  addImage(images, post.featured_image_url);

  collectImagesFromArray(images, post.images);
  collectImagesFromArray(images, post.gallery);
  collectImagesFromArray(images, post.gallery_images);
  collectImagesFromArray(images, post.image_urls);
  collectImagesFromArray(images, post.media);

  collectImagesFromHtml(images, post.html);
  collectImagesFromHtml(images, post.HTML);
  collectImagesFromHtml(images, post.content);

  return Array.from(images);
};

const buildPreviewImages = (images, startIndex, count) => {
  if (!images.length) return [];

  const safeCount = Math.min(count, images.length);
  return Array.from({ length: safeCount }, (_, index) => {
    const imageIndex = (startIndex + index) % images.length;
    return images[imageIndex];
  });
};

const isInGalleryCategory = (post) =>
  post?.categories?.some((category) => category?.name?.trim() === "גלריות");

const GalleryCard = ({ post, images, slug }) => {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (images.length <= PREVIEW_IMAGE_COUNT) return undefined;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % images.length);
    }, IMAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [images.length]);

  const previewImages = useMemo(
    () => buildPreviewImages(images, startIndex, PREVIEW_IMAGE_COUNT),
    [images, startIndex]
  );

  return (
    <article className="gallery-card" dir="rtl">
      <div className="gallery-card__header">
        <h2>{post.title}</h2>
        <span className="gallery-card__count">{images.length} תמונות</span>
      </div>
      <div className="gallery-card__images">
        {previewImages.map((image, index) => (
          <img
            key={`${post.id ?? post.title}-${image}-${index}`}
            src={image}
            alt={`${post.title} - תמונה ${index + 1}`}
            loading="lazy"
          />
        ))}
      </div>
      <div className="gallery-card__footer">
        <a className="gallery-card__link" href={`#/post/${slug}`}>
          לצפייה בפוסט המלא
        </a>
      </div>
    </article>
  );
};

export default function GalleryPage({ posts = [], isLoading, error, getPostSlug }) {
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
          <p className="gallery-page__empty">
            עדיין אין פוסטים בקטגוריית גלריות עם 5 תמונות ומעלה להצגה.
          </p>
        )
      ) : null}
    </section>
  );
}
