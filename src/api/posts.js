const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export async function fetchPosts({ page = 1, limit = 20, signal } = {}) {
  const url = new URL(`${API_BASE_URL}/posts`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
