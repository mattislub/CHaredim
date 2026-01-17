import { formatDateWithHebrew } from "../utils/date";

const formatPostDate = (value) => formatDateWithHebrew(value);

export default function AdminPostsPage({
  posts,
  isLoading,
  error,
  onEdit,
  onCreate,
}) {
  const hasPosts = posts.length > 0;

  return (
    <section className="admin-posts">
      <div className="admin-posts__layout">
        <header className="admin-posts__header">
          <div>
            <p className="admin-posts__badge">ניהול פוסטים</p>
            <h1>רשימת הפוסטים במערכת</h1>
            <p className="admin-posts__subtitle">
              כאן ניתן לעקוב אחרי כל הפוסטים שפורסמו באתר ולפתוח פוסט חדש בלחיצה.
            </p>
          </div>
          <div className="admin-posts__actions">
            <button
              className="admin-posts__new"
              type="button"
              onClick={onCreate}
            >
              + יצירת פוסט חדש
            </button>
            <button
              className="admin-posts__back"
              type="button"
              onClick={() => {
                window.location.hash = "#/admin";
              }}
            >
              חזרה ללוח הניהול
            </button>
          </div>
        </header>

        <div className="admin-posts__content">
          {isLoading ? (
            <p className="admin-posts__status">טוען את רשימת הפוסטים...</p>
          ) : error ? (
            <p className="admin-posts__status admin-posts__status--error">
              לא הצלחנו לטעון את הפוסטים. נסו שוב מאוחר יותר.
            </p>
          ) : hasPosts ? (
            <ul className="admin-posts__list">
              {posts.map((post) => (
                <li className="admin-posts__item" key={post.id ?? post.title}>
                  <div>
                    <h3>{post.title}</h3>
                    <p className="admin-posts__meta">
                      {formatPostDate(post.published_at)}
                    </p>
                    <p className="admin-posts__excerpt">
                      {post.excerpt || "אין תקציר זמין לפוסט זה."}
                    </p>
                  </div>
                  <button
                    className="admin-posts__edit"
                    type="button"
                    onClick={() => onEdit?.(post)}
                  >
                    עריכת פוסט
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-posts__empty">
              <p>עדיין לא נוספו פוסטים. התחילו ביצירת פוסט חדש.</p>
              <button
                className="admin-posts__new"
                type="button"
                onClick={onCreate}
              >
                + יצירת פוסט חדש
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
