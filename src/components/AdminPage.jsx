
const adminActions = [
  "סטטוס ביקורים",
  "הוסף פוסט חדש",
  "הוסף תמונות לגלריה",
  "הוסף קטגוריה חדשה",
  "הגדרות כלליות",
  "ניהול משתמשים",
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
              <button className="admin-page__button" key={action} type="button">
                {action}
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
