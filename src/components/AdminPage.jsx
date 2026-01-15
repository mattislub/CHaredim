const adminActions = [
  { label: "ניהול פוסטים", hash: "#/admin/posts" },
  { label: "סטטוס ביקורים" },
  { label: "הוסף פוסט חדש" },
  { label: "הוסף תמונות לגלריה" },
  { label: "הוסף קטגוריה חדשה" },
  { label: "הגדרות כלליות" },
  { label: "ניהול משתמשים" },
  { label: "הודעות אורחים" },
];

const guestMessages = [
  {
    id: "msg-001",
    name: "רות כהן",
    email: "rut@example.com",
    subject: "תיאום ביקור",
    message:
      "שלום, נשמח להגיע לביקור ביום ראשון הקרוב. האם אפשר לקבוע שעה נוחה?",
    receivedAt: "12.03.2024 | 09:42",
    status: { key: "new", label: "חדש" },
  },
  {
    id: "msg-002",
    name: "משפחת לוי",
    email: "levi.family@example.com",
    subject: "שאלה על פעילות לנוער",
    message:
      "רצינו לברר אילו פעילויות מתקיימות לנוער בשבועות הקרובים והאם צריך הרשמה מראש.",
    receivedAt: "11.03.2024 | 18:15",
    status: { key: "in-progress", label: "בטיפול" },
  },
  {
    id: "msg-003",
    name: "אורח אנונימי",
    email: "guest@example.com",
    subject: "בקשה לעזרה",
    message:
      "ראיתי את האתר ורציתי לדעת למי אפשר לפנות לגבי סיוע למשפחה חדשה בעיר.",
    receivedAt: "10.03.2024 | 14:08",
    status: { key: "done", label: "טופל" },
  },
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
                onClick={
                  action.hash
                    ? () => {
                        window.location.hash = action.hash;
                      }
                    : undefined
                }
              >
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
        <div className="admin-page__panel admin-page__messages">
          <div className="admin-page__header">
            <p className="admin-page__badge">הודעות אורחים</p>
            <h2>דף הודעות מאורחי האתר</h2>
            <p className="admin-page__subtitle">
              כאן מרוכזות הפניות שהתקבלו מהטופס הציבורי באתר, כולל סטטוס טיפול.
            </p>
          </div>
          <div className="admin-page__messages-list">
            {guestMessages.map((message) => (
              <article className="admin-page__message-card" key={message.id}>
                <div className="admin-page__message-header">
                  <div>
                    <h3>{message.subject}</h3>
                    <p className="admin-page__message-meta">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <span
                    className={`admin-page__status admin-page__status--${message.status.key}`}
                  >
                    {message.status.label}
                  </span>
                </div>
                <p className="admin-page__message-body">{message.message}</p>
                <div className="admin-page__message-footer">
                  <span>{message.receivedAt}</span>
                  <button type="button">פתח הודעה</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
