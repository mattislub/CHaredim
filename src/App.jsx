import { useEffect, useState } from "react";
import AdminPage from "./components/AdminPage";
import Communities from "./components/Communities";
import ExtraContent from "./components/ExtraContent";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewsGrid from "./components/NewsGrid";
import OpinionColumns from "./components/OpinionColumns";
import PopularList from "./components/PopularList";
import SponsoredArea from "./components/SponsoredArea";
import Ticker from "./components/Ticker";
import { fetchPosts } from "./api/posts";
import {
  heroMain as fallbackHeroMain,
  heroSide as fallbackHeroSide,
  newsCards as fallbackNewsCards,
  popularPosts as fallbackPopularPosts,
  tickerItems as fallbackTickerItems,
} from "./data/mockData";

const ADMIN_USERNAME = "מתתיהו";
const ADMIN_PASSWORD = "613613";

export default function App() {
  const [isAdminView, setIsAdminView] = useState(
    window.location.hash === "#/admin"
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem("admin-authenticated") === "true"
  );
  const [authError, setAuthError] = useState("");
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === "#/admin");
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

  const resolvedHeroMain = posts.length
    ? {
        title: posts[0].title,
        summary: posts[0].excerpt || "אין תקציר זמין לפוסט זה.",
        image: posts[0].featured_image_url || fallbackImage,
        tag: "חדש",
      }
    : fallbackHeroMain;

  const resolvedHeroSide = posts.length
    ? posts.slice(1, 4).map((post) => ({
        title: post.title,
        tag: "עדכון",
      }))
    : fallbackHeroSide;

  const resolvedTickerItems = posts.length
    ? posts.slice(0, 6).map((post) => `⚡ ${post.title}`)
    : fallbackTickerItems;

  const resolvedNewsCards = posts.length
    ? posts.map((post) => ({
        id: post.id,
        title: post.title,
        time: formatPostTime(post.published_at),
        image: post.featured_image_url || fallbackImage,
      }))
    : fallbackNewsCards;

  const resolvedPopularPosts = posts.length
    ? posts.slice(0, 5).map((post) => post.title)
    : fallbackPopularPosts;

  return (
    <div className="app">
      <Header />
      <main>
        {isAdminView ? (
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
          ) : (
            <AdminPage />
          )
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
