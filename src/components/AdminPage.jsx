import { useMemo, useState } from "react";
import { clearWpImport, loadWpImport, saveWpImport } from "../data/wpImport";

const adminActions = [
  { label: "סטטוס ביקורים", icon: "📊" },
  { label: "הוסף פוסט חדש", icon: "📝" },
  { label: "הוסף תמונות לגלריה", icon: "🖼️" },
  { label: "הוסף קטגוריה חדשה", icon: "➕" },
  { label: "הגדרות כלליות", icon: "⚙️" },
  { label: "ניהול משתמשים", icon: "👥" },
];

const formatWpDate = (rawDate) => {
  if (!rawDate) {
    return "";
  }
  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const stripHtml = (value) => {
  if (!value) {
    return "";
  }
  return value.replace(/<[^>]*>/g, "").trim();
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";

const buildAuthHeader = (username, password) => {
  if (!username || !password) {
    return null;
  }

  return `Basic ${btoa(`${username}:${password}`)}`;
};

export default function AdminPage() {
  const storedImport = useMemo(() => loadWpImport(), []);
  const [wordpressUrl, setWordpressUrl] = useState(storedImport?.baseUrl ?? "");
  const [wpUsername, setWpUsername] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [importDraft, setImportDraft] = useState(null);
  const [activeImport, setActiveImport] = useState(storedImport);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const handleFetchImport = async () => {
    if (!wordpressUrl.trim()) {
      setErrorMessage("יש להזין כתובת אתר וורדפרס תקינה.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setNotice("");

    try {
      const baseUrl = wordpressUrl.trim().replace(/\/$/, "");
      const authHeader = buildAuthHeader(wpUsername.trim(), wpPassword.trim());
      const requestOptions = authHeader
        ? {
            headers: {
              Authorization: authHeader,
            },
          }
        : undefined;

      const postsResponse = await fetch(
        `${baseUrl}/wp-json/wp/v2/posts?per_page=6&_embed=1`,
        requestOptions
      );
      const mediaResponse = await fetch(
        `${baseUrl}/wp-json/wp/v2/media?per_page=8`,
        requestOptions
      );

      if (!postsResponse.ok) {
        throw new Error("לא ניתן לשלוף פוסטים מהאתר.");
      }
      if (!mediaResponse.ok) {
        throw new Error("לא ניתן לשלוף מדיה מהאתר.");
      }

      const postsPayload = await postsResponse.json();
      const mediaPayload = await mediaResponse.json();
      const mediaMap = new Map(
        mediaPayload.map((item) => [item.id, item.source_url])
      );

      const normalizedPosts = postsPayload.map((post) => {
        const featuredMedia =
          post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
          mediaMap.get(post.featured_media) ??
          DEFAULT_IMAGE;

        return {
          id: post.id,
          title: stripHtml(post.title?.rendered),
          summary: stripHtml(post.excerpt?.rendered),
          image: featuredMedia,
          time: formatWpDate(post.date) || "עודכן לאחרונה",
          link: post.link,
        };
      });

      const normalizedMedia = mediaPayload.map((item) => ({
        id: item.id,
        title: stripHtml(item.title?.rendered),
        image: item.source_url,
        date: formatWpDate(item.date),
      }));

      setImportDraft({
        baseUrl,
        importedAt: new Date().toISOString(),
        posts: normalizedPosts,
        media: normalizedMedia,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "אירעה שגיאה בזמן הייבוא.");
    }
  };

  const handleApplyImport = () => {
    if (!importDraft) {
      setErrorMessage("אין נתונים לשמור עדיין.");
      return;
    }

    saveWpImport(importDraft);
    setActiveImport(importDraft);
    setImportDraft(null);
    setNotice("הנתונים עודכנו בפרויקט בהצלחה.");
  };

  const handleClearImport = () => {
    clearWpImport();
    setActiveImport(null);
    setImportDraft(null);
    setNotice("הייבוא הוסר והפרויקט חזר לברירת המחדל.");
  };

  const latestPosts = (importDraft ?? activeImport)?.posts ?? [];
  const latestMedia = (importDraft ?? activeImport)?.media ?? [];

  return (
    <section className="admin-page">
      <div className="admin-page__layout">
        <div className="admin-page__panel">
          <div className="admin-page__header">
            <p className="admin-page__badge">כלי ניהול</p>
            <h1>לוח ניהול פנימי</h1>
            <p className="admin-page__subtitle">
              כאן תוכלו לבחור פעולות ניהול ולהזרים תוכן חדש מתוך אתר הוורדפרס
              הישן.
            </p>
          </div>
          <div className="admin-page__buttons">
            {adminActions.map((action) => (
              <button
                className="admin-page__button"
                key={action.label}
                type="button"
              >
                <span className="button-icon" aria-hidden="true">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <aside className="admin-page__import">
          <div className="admin-page__import-card">
            <h2>ייבוא נתונים מאתר וורדפרס</h2>
            <p className="admin-page__import-text">
              הזינו את כתובת האתר הישן כדי למשוך פוסטים ותמונות דרך ממשק ה-API של
              וורדפרס. אם האתר מוגן, הזינו שם משתמש וסיסמה (או סיסמת אפליקציה).
            </p>
            <label className="admin-page__field">
              <span>כתובת אתר וורדפרס</span>
              <input
                type="url"
                placeholder="https://example.com"
                value={wordpressUrl}
                onChange={(event) => setWordpressUrl(event.target.value)}
              />
            </label>
            <label className="admin-page__field">
              <span>שם משתמש בוורדפרס</span>
              <input
                type="text"
                placeholder="admin"
                autoComplete="username"
                value={wpUsername}
                onChange={(event) => setWpUsername(event.target.value)}
              />
            </label>
            <label className="admin-page__field">
              <span>סיסמה / סיסמת אפליקציה</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={wpPassword}
                onChange={(event) => setWpPassword(event.target.value)}
              />
            </label>
            <p className="admin-page__import-hint">
              הטיפ: אם הייבוא נכשל בגלל CORS, אפשר לבצע את הייבוא משרת באותו דומיין
              או להפעיל הרשאות CORS באתר הוורדפרס.
            </p>
            <div className="admin-page__import-actions">
              <button
                className="admin-page__import-button"
                type="button"
                onClick={handleFetchImport}
                disabled={status === "loading"}
              >
                <span className="button-icon" aria-hidden="true">
                  ⬇️
                </span>
                {status === "loading" ? "מייבא נתונים..." : "שאיבת נתונים"}
              </button>
              <button
                className="admin-page__import-button admin-page__import-button--ghost"
                type="button"
                onClick={handleApplyImport}
                disabled={!importDraft}
              >
                <span className="button-icon" aria-hidden="true">
                  ✅
                </span>
                עדכון בפרויקט
              </button>
              <button
                className="admin-page__import-button admin-page__import-button--link"
                type="button"
                onClick={handleClearImport}
                disabled={!activeImport}
              >
                <span className="button-icon" aria-hidden="true">
                  🧹
                </span>
                מחיקת ייבוא
              </button>
            </div>
            {errorMessage ? (
              <p className="admin-page__import-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
            {notice ? (
              <p className="admin-page__import-success" role="status">
                {notice}
              </p>
            ) : null}
            <div className="admin-page__import-meta">
              <div>
                <strong>פוסטים שנמצאו:</strong> {latestPosts.length}
              </div>
              <div>
                <strong>תמונות שנמצאו:</strong> {latestMedia.length}
              </div>
              {activeImport?.importedAt ? (
                <div>
                  <strong>ייבוא אחרון:</strong>{" "}
                  {formatWpDate(activeImport.importedAt)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="admin-page__preview">
            <h3>תצוגה מקדימה</h3>
            <div className="admin-page__preview-list">
              {latestPosts.slice(0, 3).map((post) => (
                <article className="admin-page__preview-item" key={post.id}>
                  <img src={post.image} alt={post.title} />
                  <div>
                    <h4>{post.title}</h4>
                    <p>{post.summary || "ללא תקציר"}</p>
                  </div>
                </article>
              ))}
              {latestPosts.length === 0 ? (
                <p className="admin-page__preview-empty">
                  טרם נטענו פוסטים. התחילו שאיבה כדי לראות תצוגה מקדימה.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
