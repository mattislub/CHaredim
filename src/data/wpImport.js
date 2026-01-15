const STORAGE_KEY = "wp-import";

export const loadWpImport = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read WordPress import data", error);
    return null;
  }
};

export const saveWpImport = (payload) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const clearWpImport = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const getStoredPosts = () => {
  const data = loadWpImport();
  if (!data?.posts?.length) {
    return null;
  }
  return data.posts;
};

export const getStoredMedia = () => {
  const data = loadWpImport();
  if (!data?.media?.length) {
    return null;
  }
  return data.media;
};
