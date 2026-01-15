import { footerLinks } from "../data/mockData";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__logo">חרדים</div>
      <div className="footer__links">
        {footerLinks.map((link) => (
          <button key={link} type="button" className="footer__link">
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
