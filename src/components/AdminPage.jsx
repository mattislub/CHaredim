
const adminActions = [
  { label: "סטטוס ביקורים", icon: "📊" },
  { label: "הוסף פוסט חדש", icon: "📝" },
  { label: "הוסף תמונות לגלריה", icon: "🖼️" },
  { label: "הוסף קטגוריה חדשה", icon: "➕" },
  { label: "הגדרות כלליות", icon: "⚙️" },
  { label: "ניהול משתמשים", icon: "👥" },
];

export default function AdminPage() {
  const notice = "כלי הניהול זמינים כאן לפעולות מערכת מהירות.";

  return (
    <section className="admin-page">
      <div className="admin-page__layout">
        <div className="admin-page__panel">
          <div className="admin-page__header">
            <p className="admin-page__badge">כלי ניהול</p>
            <h1>לוח ניהול פנימי</h1>
            <p className="admin-page__subtitle">
              כאן תוכלו לבחור פעולות ניהול ולנהל את המערכת בצורה ממוקדת ובטוחה.
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
          {notice ? (
            <p className="admin-page__notice" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
