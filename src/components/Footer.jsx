import { footerLinks } from "../data/mockData";
import logo from "../assets/charedim-logo.svg";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__logo">
        <img src={logo} alt="חרדים" />
      </div>
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
