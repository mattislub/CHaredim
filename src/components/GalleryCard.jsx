import { useEffect, useMemo, useState } from "react";
import {
  buildPreviewImages,
  IMAGE_ROTATION_INTERVAL,
  PREVIEW_IMAGE_COUNT,
} from "../utils/gallery";

export default function GalleryCard({ post, images, slug }) {
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
}
