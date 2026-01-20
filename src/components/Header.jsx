import logo from "../assets/charedim-logo.png";

const navItems = [
  { label: "דף הבית", href: "#/" },
  { label: "גלריות", href: "#/galleries" },
  { label: "חדשות", href: "#/news" },
  { label: "קהילות", href: "#/communities" },
  { label: "טורי דעה" },
  { label: "מבזקים" },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="חרדים" />
      </div>
      <nav className="header__nav">
        {navItems.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="header__nav-item header__nav-item--link"
            >
              {item.label}
            </a>
          ) : (
            <button key={item.label} type="button" className="header__nav-item">
              {item.label}
            </button>
          )
        )}
      </nav>
      <div className="header__actions">
        <button type="button" className="header__icon" aria-label="חיפוש">
          🔍
        </button>
        <button type="button" className="header__icon" aria-label="תפריט">
          ☰
        </button>
      </div>
    </header>
  );
}
