import logo from "../assets/charedim-logo.svg";

export default function Footer() {
  const siteLinks = [
    "חדשות רבנים",
    "פנים וקהילות",
    "כלכלה ונדל\"ן",
    "תורה והלכה",
  ];
  const serviceLinks = [
    "זמני היום",
    "לוח אירועים",
    "מדור דרושים",
    "פרסום באתר",
  ];

  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src={logo} alt="חרדים" />
            <span className="footer__brand-title headline-font">
              פורטל החדשות
            </span>
          </div>
          <p className="footer__description">
            מקור המידע האמין והמעודכן ביותר עבור הציבור החרדי. חדשות, תורה,
            חצרות קודש ועדכוני כלכלה וטכנולוגיה כשרה.
          </p>
          <div className="footer__social">
            <button type="button" aria-label="דואר">
              ✉️
            </button>
            <button type="button" aria-label="RSS">
              📡
            </button>
          </div>
        </div>
        <div className="footer__column">
          <h4>מבנה האתר</h4>
          <ul>
            {siteLinks.map((link) => (
              <li key={link}>
                <button type="button">{link}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__column">
          <h4>שירותים נוספים</h4>
          <ul>
            {serviceLinks.map((link) => (
              <li key={link}>
                <button type="button">{link}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__column footer__column--newsletter">
          <h4>ניוזלטר יומי</h4>
          <p>כל מה שקרה ב-24 השעות האחרונות ישירות למייל שלכם</p>
          <form>
            <input type="email" placeholder="כתובת אימייל" />
            <button type="submit">הרשמה</button>
          </form>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© כל הזכויות שמורות לפורטל החדשות החרדי - ה'תשפ\"ד</p>
        <div className="footer__legal">
          <button type="button">תנאי שימוש</button>
          <button type="button">הצהרת נגישות</button>
        </div>
      </div>
    </footer>
  );
}
