const formatPostDate = (value) => {
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

export default function AdminPostsPage({ posts, isLoading, error }) {
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
            <button className="admin-posts__new" type="button">
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
                  <button className="admin-posts__edit" type="button">
                    עריכת פוסט
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-posts__empty">
              <p>עדיין לא נוספו פוסטים. התחילו ביצירת פוסט חדש.</p>
              <button className="admin-posts__new" type="button">
                + יצירת פוסט חדש
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
