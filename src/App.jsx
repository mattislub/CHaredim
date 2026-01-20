import { useEffect, useMemo, useState } from "react";
import AdminPage from "./components/AdminPage";
import AdminPostEditPage from "./components/AdminPostEditPage";
import AdminPostsPage from "./components/AdminPostsPage";
import CategoryPostsSection from "./components/CategoryPostsSection";
import ExtraContent from "./components/ExtraContent";
import Footer from "./components/Footer";
import GalleryPreviewSection from "./components/GalleryPreviewSection";
import GalleryPage from "./components/GalleryPage";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewsGrid from "./components/NewsGrid";
import NewsPage from "./components/NewsPage";
import OpinionColumns from "./components/OpinionColumns";
import PostPage from "./components/PostPage";
import PopularList from "./components/PopularList";
import SponsoredArea from "./components/SponsoredArea";
import Ticker from "./components/Ticker";
import {
  fetchCommunityHighlights,
  fetchCommunityPosts,
  fetchPosts,
  fetchPostsByCategory,
} from "./api/posts";
import { formatDateWithHebrew } from "./utils/date";
import {
  heroMain as fallbackHeroMain,
  heroSide as fallbackHeroSide,
  newsCards as fallbackNewsCards,
  opinionColumns as fallbackOpinionColumns,
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
  const [categoryPosts, setCategoryPosts] = useState({
    communities: [],
    history: [],
  });
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [communityPagePosts, setCommunityPagePosts] = useState([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState("");
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
        const data = await fetchPosts({ limit: 100, signal: controller.signal });
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

  useEffect(() => {
    const controller = new AbortController();

    const loadCommunityPosts = async () => {
      try {
        setIsCommunityLoading(true);
        setCommunityError("");
        const data = await fetchCommunityPosts({
          limit: 40,
          signal: controller.signal,
        });
        setCommunityPagePosts(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setCommunityError("failed");
        }
      } finally {
        setIsCommunityLoading(false);
      }
    };

    loadCommunityPosts();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategoryPosts = async () => {
      try {
        setIsCategoryLoading(true);
        setCategoryError("");
        const [communitiesResponse, historyResponse] = await Promise.all([
          fetchCommunityHighlights({
            limit: 8,
            signal: controller.signal,
          }),
          fetchPostsByCategory({
            name: "היסטוריה",
            limit: 8,
            signal: controller.signal,
          }),
        ]);

        setCategoryPosts({
          communities: Array.isArray(communitiesResponse.items)
            ? communitiesResponse.items
            : [],
          history: Array.isArray(historyResponse.items) ? historyResponse.items : [],
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          setCategoryError("failed");
        }
      } finally {
        setIsCategoryLoading(false);
      }
    };

    loadCategoryPosts();

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

  const formatPostTime = (value) => formatDateWithHebrew(value);

  const getPostSlug = (post) => String(post.id ?? slugify(post.title));
  const getPostTimestamp = (post) => {
    const timestamp = new Date(post?.published_at ?? 0).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };
  const normalizeCategoryValue = (value) =>
    value?.toString().trim().toLowerCase() ?? "";
  const isOpinionCategory = (value) => {
    const normalized = normalizeCategoryValue(value);
    return ["דעות", "טורי דעה", "טור דעה", "דעה"].includes(normalized);
  };
  const getPostCategoryValues = (post) => {
    const values = [];
    if (post?.category) {
      values.push(post.category);
    }
    if (Array.isArray(post?.categories)) {
      post.categories.forEach((category) => {
        if (category?.name) values.push(category.name);
        if (category?.slug) values.push(category.slug);
      });
    }
    return values;
  };
  const getOpinionAuthor = (post) =>
    post?.author_name || post?.author || post?.author?.name || "מערכת";
  const getOpinionAvatar = (post, fallbackAvatar) =>
    post?.author_avatar_url ||
    post?.author?.avatar_url ||
    post?.featured_image_url ||
    fallbackAvatar;

  const latestPost = useMemo(() => {
    if (!posts.length) {
      return null;
    }

    return posts.reduce((latest, post) =>
      getPostTimestamp(post) >= getPostTimestamp(latest) ? post : latest
    );
  }, [posts]);

  const resolvedHeroMain = posts.length
    ? {
        title: latestPost.title,
        summary: latestPost.excerpt || "אין תקציר זמין לפוסט זה.",
        image: latestPost.featured_image_url || fallbackImage,
        tag: "חדש",
        slug: getPostSlug(latestPost),
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

  const resolvedNewsPageItems = posts.length
    ? [...posts]
        .sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
        .map((post) => ({
          id: post.id,
          slug: getPostSlug(post),
          title: post.title,
          subtitle: post.excerpt || post.summary || "אין תקציר זמין לפוסט זה.",
          time: formatPostTime(post.published_at),
          image: post.featured_image_url || fallbackImage,
        }))
    : shuffledFallbackNewsCards.map((item) => ({
        ...item,
        slug: slugify(item.title),
        subtitle: "אין תקציר זמין לפוסט זה.",
      }));

  const resolvedCommunityPageItems = useMemo(() => {
    if (!communityPagePosts.length) return [];

    return communityPagePosts.map((post) => ({
      id: post.id,
      slug: getPostSlug(post),
      title: post.title,
      subtitle: post.excerpt || post.summary || "אין תקציר זמין לפוסט זה.",
      time: formatPostTime(post.published_at),
      image: post.featured_image_url || fallbackImage,
    }));
  }, [communityPagePosts, fallbackImage, getPostSlug]);

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

  const resolvedOpinionColumns = useMemo(() => {
    const fallbackItems = fallbackOpinionColumns.map((item) => ({
      ...item,
      slug: slugify(item.title),
    }));

    if (!posts.length) {
      return fallbackItems;
    }

    const opinionPosts = posts.filter((post) =>
      getPostCategoryValues(post).some(isOpinionCategory)
    );

    if (!opinionPosts.length) {
      return fallbackItems;
    }

    return [...opinionPosts]
      .sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
      .slice(0, 3)
      .map((post, index) => ({
        title: post.title,
        name: getOpinionAuthor(post),
        avatar: getOpinionAvatar(post, fallbackItems[index]?.avatar || fallbackImage),
        slug: getPostSlug(post),
        highlight: index === 0 ? "טור השבוע" : undefined,
      }));
  }, [posts, fallbackImage]);

  const resolvedRecentPosts = useMemo(() => {
    if (!posts.length) return [];

    return [...posts]
      .sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
      .slice(0, 6)
      .map((post) => ({
        title: post.title,
        slug: getPostSlug(post),
        publishedAt: post.published_at,
        image: post.featured_image_url || fallbackImage,
      }));
  }, [posts]);

  const mapCategoryCards = (items) =>
    (Array.isArray(items) ? items : []).slice(0, 10).map((post) => ({
      id: post.id,
      slug: getPostSlug(post),
      title: post.title,
      time: formatPostTime(post.published_at),
      image: post.featured_image_url || fallbackImage,
    }));

  const resolvedCommunityCards = useMemo(
    () => mapCategoryCards(categoryPosts.communities),
    [categoryPosts.communities]
  );
  const resolvedHistoryCards = useMemo(
    () => mapCategoryCards(categoryPosts.history),
    [categoryPosts.history]
  );

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
  const isGalleryView = currentHash === "#/galleries";
  const isCommunityView = currentHash === "#/communities";
  const isNewsView = currentHash === "#/news";
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
            allPosts={posts}
            getPostSlug={getPostSlug}
          />
        ) : isNewsView ? (
          <NewsPage
            items={resolvedNewsPageItems}
            isLoading={isPostsLoading}
            error={postsError}
            recentPosts={resolvedRecentPosts}
          />
        ) : isGalleryView ? (
          <GalleryPage
            posts={Array.isArray(posts?.items) ? posts.items : posts}
            recentPosts={resolvedRecentPosts}
            isLoading={isPostsLoading}
            error={postsError}
            getPostSlug={getPostSlug}
          />
        ) : isCommunityView ? (
          <NewsPage
            items={resolvedCommunityPageItems}
            isLoading={isCommunityLoading}
            error={communityError}
            recentPosts={resolvedRecentPosts}
            badge="קהילות"
            title="חדשות הקהילה"
            subtitle="העדכונים האחרונים מהקהילות החרדיות."
            loadMoreLabel="הצג עוד מהקהילה"
            emptyMessage="עדיין אין פוסטים בקטגוריית קהילות."
          />
        ) : (
          <>
            <section className="home-section home-section--hero">
              <Hero mainPost={resolvedHeroMain} sidePosts={resolvedHeroSide} />
            </section>
            <section className="home-section home-section--ticker">
              <Ticker items={resolvedTickerItems} />
            </section>
            <section className="home-section home-section--news">
              <NewsGrid
                items={resolvedNewsCards}
                isLoading={isPostsLoading}
                error={postsError}
                moreLink={{ href: "#/news", label: "חדשות נוספות" }}
              />
            </section>
            <section className="home-section home-section--gallery">
              <GalleryPreviewSection
                posts={posts}
                isLoading={isPostsLoading}
                error={postsError}
                getPostSlug={getPostSlug}
              />
            </section>
            <section className="home-section home-section--communities">
              <CategoryPostsSection
                title="קהילות"
                hint="חיבור לקהילה המקומית"
                items={resolvedCommunityCards}
                isLoading={isCategoryLoading}
                error={categoryError}
                variant="communities"
                emptyMessage="עדיין אין פוסטים מקטגוריית קהילות."
                moreLink={{ href: "#/category/קהילות", label: "עוד" }}
              />
            </section>
            <section className="home-section home-section--history">
              <CategoryPostsSection
                title="היסטוריה"
                hint="מהארכיון הקהילתי"
                items={resolvedHistoryCards}
                isLoading={isCategoryLoading}
                error={categoryError}
                variant="history"
                emptyMessage="עדיין אין פוסטים מקטגוריית היסטוריה."
                moreLink={{ href: "#/category/היסטוריה", label: "עוד" }}
              />
            </section>
            <section className="home-section home-section--opinion">
              <OpinionColumns />
            </section>
            <section className="home-section home-section--popular">
              <PopularList items={resolvedPopularPosts} />
            </section>
            <section className="home-section home-section--extra">
              <ExtraContent />
            </section>
            <section className="home-section home-section--sponsored">
              <SponsoredArea />
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
