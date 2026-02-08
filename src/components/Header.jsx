import logo from "../assets/charedim-logo.svg";

const navItems = [
  { label: "ראשי", href: "#/" },
  { label: "חצרות קודש", href: "#/communities" },
  { label: "חדשות", href: "#/news" },
  { label: "גלריות", href: "#/galleries" },
  { label: "כלכלה" },
  { label: "עולם" },
  { label: "מבזקים", href: "#/briefs" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__meta">
            <span className="topbar__icon" aria-hidden="true">
              📅
            </span>
            יום שלישי, י"ב באדר ה'תשפ"ד | 12 במרץ 2024
          </div>
          <div className="topbar__links">
            <a href="#/">מזג אוויר: ירושלים 14°C</a>
            <a href="#/">פרסום באתר</a>
            <a className="topbar__link--highlight" href="#/">
              מהדורת דפוס
            </a>
          </div>
        </div>
      </div>
      <div className="header-main">
        <div className="container header-main__inner">
          <div className="header-brand">
            <img src={logo} alt="חרדים" className="header-brand__logo" />
            <div>
              <h1 className="header-brand__title headline-font">פורטל החדשות</h1>
              <p className="header-brand__tagline">הבית של הציבור החרדי</p>
            </div>
          </div>
          <div className="header-ad" aria-hidden="true">
            מרחב פרסום מוגן
          </div>
          <div className="header-search">
            <input type="search" placeholder="חיפוש..." aria-label="חיפוש" />
            <span className="header-search__icon" aria-hidden="true">
              🔍
            </span>
          </div>
        </div>
      </div>
      <nav className="main-nav">
        <div className="container main-nav__inner">
          <ul className="main-nav__list">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a className="main-nav__link" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <button type="button" className="main-nav__link">
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="main-nav__actions">
            <button
              type="button"
              className="main-nav__icon"
              aria-label="התראות"
            >
              🔔
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
