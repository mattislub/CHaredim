import { footerLinks } from "../data/mockData";

export default function Footer() {
  const linkIcons = {
    אודות: "ℹ️",
    "צור קשר": "📬",
    תקנון: "📜",
    פרטיות: "🔒",
    "זכויות יוצרים": "©️",
    "קרדיט מערכת": "🏷️",
  };

  return (
    <footer className="footer">
      <div className="footer__logo">חרדים</div>
      <div className="footer__links">
        {footerLinks.map((link) => (
          <button key={link} type="button" className="footer__link">
            <span className="button-icon" aria-hidden="true">
              {linkIcons[link] ?? "🔗"}
            </span>
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
