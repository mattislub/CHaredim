const DEFAULT_API_BASE_URL = "https://123.70-60.com/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export async function fetchPosts({
  page = 1,
  limit = 20,
  sort = "latest",
  signal,
} = {}) {
  const url = new URL(`${API_BASE_URL}/posts`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", sort);

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchPostsByCategory({
  name,
  slug,
  limit = 8,
  signal,
} = {}) {
  const url = new URL(`${API_BASE_URL}/posts/by-category`);
  if (name) {
    url.searchParams.set("name", name);
  }
  if (slug) {
    url.searchParams.set("slug", slug);
  }
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchCommunityPosts({
  page = 1,
  limit = 20,
  term,
  signal,
} = {}) {
  const url = new URL(`${API_BASE_URL}/communities`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (term) {
    url.searchParams.set("term", term);
  }

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchCommunityHighlights({ limit = 8, signal } = {}) {
  const url = new URL(`${API_BASE_URL}/posts/communities`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchBriefs({ page = 1, limit = 20, signal } = {}) {
  const url = new URL(`${API_BASE_URL}/briefs`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
