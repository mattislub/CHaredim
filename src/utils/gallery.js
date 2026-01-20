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

export {
  buildPreviewImages,
  extractPostImages,
  IMAGE_ROTATION_INTERVAL,
  isInGalleryCategory,
  PREVIEW_IMAGE_COUNT,
};
