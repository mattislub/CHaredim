import { useEffect, useMemo, useState } from "react";
import AdminPage from "./components/AdminPage";
import AdminPostEditPage from "./components/AdminPostEditPage";
import AdminPostsPage from "./components/AdminPostsPage";
import Communities from "./components/Communities";
import ExtraContent from "./components/ExtraContent";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewsGrid from "./components/NewsGrid";
import OpinionColumns from "./components/OpinionColumns";
import PostPage from "./components/PostPage";
import PopularList from "./components/PopularList";
import SponsoredArea from "./components/SponsoredArea";
import Ticker from "./components/Ticker";
import { fetchPosts } from "./api/posts";
import {
  heroMain as fallbackHeroMain,
  heroSide as fallbackHeroSide,
  newsCards as fallbackNewsCards,
  tickerItems as fallbackTickerItems,
} from "./data/mockData";

const ADMIN_USERNAME = "מתתיהו";
const ADMIN_PASSWORD = "613613";

const createSeededRandom = (seed) => {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleArray = (items, seed) => {
  const random = createSeededRandom(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem("admin-authenticated") === "true"
  );
  const [authError, setAuthError] = useState("");
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1_000_000));

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        setIsPostsLoading(true);
        setPostsError("");
        const data = await fetchPosts({ limit: 12, signal: controller.signal });
        setPosts(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setPostsError("failed");
        }
      } finally {
        setIsPostsLoading(false);
      }
    };

    loadPosts();

    return () => controller.abort();
  }, []);

  const handleAdminLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("admin-authenticated", "true");
      setAuthError("");
      event.currentTarget.reset();
      return;
    }

    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("admin-authenticated");
    setAuthError("שם המשתמש או הסיסמה שגויים. נסו שוב.");
  };

  const fallbackImage = fallbackHeroMain.image;
  const shuffledPosts = useMemo(
    () => shuffleArray(posts, randomSeed),
    [posts, randomSeed]
  );
  const shuffledFallbackNewsCards = useMemo(
    () => shuffleArray(fallbackNewsCards, randomSeed),
    [randomSeed]
  );

  const slugify = (value) =>
    value
      ? value
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\p{L}\p{N}-]+/gu, "")
      : "";

  const formatPostTime = (value) => {
    if (!value) {
      return "ללא תאריך";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "ללא תאריך";
    }
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPostSlug = (post) => String(post.id ?? slugify(post.title));

  const resolvedHeroMain = posts.length
    ? {
        title: shuffledPosts[0].title,
        summary: shuffledPosts[0].excerpt || "אין תקציר זמין לפוסט זה.",
        image: shuffledPosts[0].featured_image_url || fallbackImage,
        tag: "חדש",
        slug: getPostSlug(shuffledPosts[0]),
      }
    : {
        ...fallbackHeroMain,
        slug: slugify(fallbackHeroMain.title),
      };

  const resolvedHeroSide = posts.length
    ? shuffledPosts.slice(1, 4).map((post) => ({
        title: post.title,
        tag: "עדכון",
        slug: getPostSlug(post),
      }))
    : fallbackHeroSide.map((item) => ({
        ...item,
        slug: slugify(item.title),
      }));

  const resolvedTickerItems = posts.length
    ? shuffledPosts.slice(0, 6).map((post) => ({
        label: `⚡ ${post.title}`,
        slug: getPostSlug(post),
      }))
    : fallbackTickerItems.map((item) => ({
        label: item,
        slug: slugify(item),
      }));

  const resolvedNewsCards = posts.length
    ? shuffledPosts.map((post) => ({
        id: post.id,
        slug: getPostSlug(post),
        title: post.title,
        time: formatPostTime(post.published_at),
        image: post.featured_image_url || fallbackImage,
      }))
    : shuffledFallbackNewsCards.map((item) => ({
        ...item,
        slug: slugify(item.title),
      }));

  const resolvedPopularPosts = posts.length
    ? shuffledPosts.slice(0, 5).map((post) => ({
        title: post.title,
        slug: getPostSlug(post),
        image: post.featured_image_url || fallbackImage,
      }))
    : shuffledFallbackNewsCards.slice(0, 5).map((item) => ({
        title: item.title,
        slug: slugify(item.title),
        image: item.image || fallbackImage,
      }));

  const postHashMatch = useMemo(
    () => currentHash.match(/^#\/post\/?(.*)$/),
    [currentHash]
  );
  const postSlug = postHashMatch?.[1]
    ? decodeURIComponent(postHashMatch[1])
    : "";
  const postLookupKey = postSlug || resolvedNewsCards[0]?.slug;
  const resolvedPost = posts.find((post) => {
    const slug = getPostSlug(post);
    return slug === postLookupKey;
  });
  const resolvedRecentPosts = posts.length
    ? posts
        .filter((post) => getPostSlug(post) !== postLookupKey)
        .slice(0, 4)
        .map((post) => ({
          title: post.title,
          slug: getPostSlug(post),
          image: post.featured_image_url || fallbackImage,
          published_at: post.published_at,
        }))
    : fallbackNewsCards.slice(0, 4).map((item) => ({
        title: item.title,
        slug: slugify(item.title),
        image: item.image,
        published_at: new Date().toISOString(),
      }));

  const fallbackPost = {
    title: fallbackHeroMain.title,
    excerpt: fallbackHeroMain.summary,
    featured_image_url: fallbackHeroMain.image,
    published_at: new Date().toISOString(),
    content: null,
    body: [
      "הקהילות המקומיות מתכנסות כדי לדון בסוגיות הבוערות שעל סדר היום הציבורי.",
      "במרכז הכתבה עומדות הקריאות לאחדות, חיזוק עולם התורה ושיתוף פעולה בין המוסדות.",
      "המשיכו לעקוב אחר העדכונים השוטפים כדי להישאר מעודכנים בהחלטות החשובות.",
    ],
    summary: fallbackHeroMain.summary,
  };

  const isAdminRoute = currentHash.startsWith("#/admin");
  const isAdminView = currentHash === "#/admin";
  const isAdminPostsView = currentHash === "#/admin/posts";
  const adminEditMatch = useMemo(
    () => currentHash.match(/^#\/admin\/posts\/edit\/?(.*)$/),
    [currentHash]
  );
  const adminEditSlug = adminEditMatch?.[1]
    ? decodeURIComponent(adminEditMatch[1])
    : "";
  const isAdminPostEditView = Boolean(adminEditMatch);
  const adminEditPost =
    adminEditSlug && adminEditSlug !== "new"
      ? posts.find((post) => getPostSlug(post) === adminEditSlug)
      : null;
  const isPostView = Boolean(postHashMatch);

  return (
    <div className="app">
      <Header />
      <main>
        {isAdminRoute ? (
          !isAdminAuthenticated ? (
            <section className="admin-login">
              <div className="admin-login__card">
                <p className="admin-login__badge">גישה מאובטחת</p>
                <h1>כניסה ללוח הניהול</h1>
                <p className="admin-login__subtitle">
                  כדי להיכנס לדף הניהול יש להתחבר עם שם משתמש וסיסמה.
                </p>
                <form className="admin-login__form" onSubmit={handleAdminLogin}>
                  <label className="admin-login__field">
                    <span>שם משתמש</span>
                    <input
                      autoComplete="username"
                      name="username"
                      type="text"
                      required
                    />
                  </label>
                  <label className="admin-login__field">
                    <span>סיסמה</span>
                    <input
                      autoComplete="current-password"
                      name="password"
                      type="password"
                      required
                    />
                  </label>
                  {authError ? (
                    <p className="admin-login__error" role="alert">
                      {authError}
                    </p>
                  ) : null}
                  <button className="admin-login__button" type="submit">
                    כניסה ללוח הניהול
                  </button>
                </form>
              </div>
            </section>
          ) : isAdminPostsView ? (
            <AdminPostsPage
              posts={posts}
              isLoading={isPostsLoading}
              error={postsError}
              onEdit={(post) => {
                const slug = getPostSlug(post);
                window.location.hash = `#/admin/posts/edit/${encodeURIComponent(
                  slug
                )}`;
              }}
              onCreate={() => {
                window.location.hash = "#/admin/posts/edit/new";
              }}
            />
          ) : isAdminPostEditView ? (
            <AdminPostEditPage
              post={adminEditPost}
              isLoading={isPostsLoading}
              mode={adminEditSlug === "new" ? "create" : "edit"}
              onBack={() => {
                window.location.hash = "#/admin/posts";
              }}
            />
          ) : (
            <AdminPage />
          )
        ) : isPostView ? (
          <PostPage
            post={resolvedPost}
            fallback={fallbackPost}
            slug={postSlug}
            recentPosts={resolvedRecentPosts}
          />
        ) : (
          <>
            <Hero mainPost={resolvedHeroMain} sidePosts={resolvedHeroSide} />
            <Ticker items={resolvedTickerItems} />
            <NewsGrid
              items={resolvedNewsCards}
              isLoading={isPostsLoading}
              error={postsError}
            />
            <Communities />
            <OpinionColumns />
            <PopularList items={resolvedPopularPosts} />
            <ExtraContent />
            <SponsoredArea />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
