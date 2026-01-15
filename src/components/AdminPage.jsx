const adminActions = [
  {
    title: "סטטוס ביקורים",
    description: "צפייה בדוחות ביקור יומיים ומדדי מעורבות.",
  },
  {
    title: "הוסף פוסט חדש",
    description: "כתיבה ופרסום של כתבה או עדכון מערכת.",
  },
  {
    title: "הוסף תמונות לגלריה",
    description: "ניהול ספריות התמונות והעלאת מדיה חדשה.",
  },
  {
    title: "הוסף קטגוריה חדשה",
    description: "פתיחת מדור חדש לתכנים וקידום נושאים.",
  },
  {
    title: "ההגדרות כלליות",
    description: "עדכון פרטי מערכת, הרשאות ותבניות תצוגה.",
  },
];

export default function AdminPage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__badge">לוח מנהל</p>
        <h1>ניהול אתר חדשות חרדי</h1>
        <p className="admin-page__subtitle">
          ריכוז פעולות מערכת מרכזיות במקום אחד.
        </p>
      </header>

      <div className="admin-page__grid">
        {adminActions.map((action) => (
          <div className="admin-card" key={action.title}>
            <div>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
            </div>
            <button className="admin-card__button" type="button">
              פתיחה
            </button>
          </div>
        ))}
      </div>

      <div className="admin-credentials section--light">
        <h2>פרטי כניסה למערכת</h2>
        <div className="admin-credentials__grid">
          <div>
            <span className="admin-credentials__label">שם משתמש</span>
            <strong>מתתי</strong>
          </div>
          <div>
            <span className="admin-credentials__label">סיסמה</span>
            <strong>613613</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
