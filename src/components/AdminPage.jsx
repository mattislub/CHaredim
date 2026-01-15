const adminActions = [
  "סטטוס ביקורים",
  "הוסף פוסט חדש",
  "הוסף תמונות לגלריה",
  "הוסף קטגוריה חדשה",
  "הגדרות כלליות",
  "ניהול משתמשים",
];

export default function AdminPage() {
  return (
    <section className="admin-page">
      <div className="admin-page__buttons">
        {adminActions.map((action) => (
          <button className="admin-page__button" key={action} type="button">
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
