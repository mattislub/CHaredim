import { useState } from "react";

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
  const [importState, setImportState] = useState({
    isLoading: false,
    message: "",
    tone: "info",
  });
  const notice =
    "כלי הניהול זמינים כאן לפעולות מערכת מהירות, כולל יבוא פוסטים מהאתר החיצוני.";

  const handleImportPosts = async () => {
    try {
      setImportState({
        isLoading: true,
        message: "מייבא פוסטים מהאתר charedim.co.il...",
        tone: "info",
      });

      const response = await fetch("/api/posts/import-charedim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });

      if (!response.ok) {
        throw new Error("import_failed");
      }

      const data = await response.json();
      const inserted = Number(data?.inserted ?? 0);
      const skipped = Number(data?.skipped ?? 0);

      setImportState({
        isLoading: false,
        message: `ייבוא הושלם: נוספו ${inserted} פוסטים, ${skipped} דולגו כדי למנוע כפילויות.`,
        tone: "success",
      });
    } catch (error) {
      setImportState({
        isLoading: false,
        message: "הייבוא נכשל. נסו שוב בעוד כמה דקות.",
        tone: "error",
      });
    }
  };

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
            <button
              className="admin-page__button"
              type="button"
              onClick={handleImportPosts}
              disabled={importState.isLoading}
            >
              {importState.isLoading
                ? "מייבא פוסטים..."
                : "ייבוא פוסטים מ-charedim.co.il"}
            </button>
          </div>
          {notice ? (
            <p className="admin-page__notice" role="status">
              {notice}
            </p>
          ) : null}
          {importState.message ? (
            <p
              className={`admin-page__notice admin-page__notice--${importState.tone}`}
              role="status"
            >
              {importState.message}
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
