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
  const hasPosts = Array.isArray(posts) && posts.length > 0;

  return (
    <section className="admin-posts">
      <div className="admin-posts__header">
        <div>
          <p className="admin-posts__badge">ניהול תוכן</p>
          <h1>רשימת פוסטים</h1>
          <p className="admin-posts__subtitle">
            כאן תוכלו לנהל את הפוסטים, לעדכן תכנים, ולהוסיף פריטים חדשים למערכת.
          </p>
        </div>
        <div className="admin-posts__actions">
          <a className="admin-posts__link" href="#/admin">
            חזרה ללוח הניהול
          </a>
          <button className="admin-posts__new" type="button">
            יצירת פוסט חדש
          </button>
        </div>
      </div>
      <div className="admin-posts__content">
        {isLoading ? (
          <p className="admin-posts__status" role="status">
            טוען פוסטים...
          </p>
        ) : error ? (
          <p className="admin-posts__status admin-posts__status--error">
            לא הצלחנו לטעון את רשימת הפוסטים. נסו שוב מאוחר יותר.
          </p>
        ) : hasPosts ? (
          <ul className="admin-posts__list">
            {posts.map((post) => (
              <li className="admin-posts__item" key={post.id}>
                <div>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt || "אין תקציר זמין לפוסט זה."}</p>
                </div>
                <span className="admin-posts__date">
                  {formatPostDate(post.published_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-posts__status" role="status">
            עדיין לא קיימים פוסטים. זה זמן מצוין ליצור את הפוסט הראשון!
          </p>
        )}
      </div>
    </section>
  );
}
