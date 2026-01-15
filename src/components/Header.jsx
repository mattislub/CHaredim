const navItems = [
  { label: "דף הבית", icon: "🏠" },
  { label: "חדשות", icon: "📰" },
  { label: "קהילות", icon: "🏘️" },
  { label: "טורי דעה", icon: "✍️" },
  { label: "מבזקים", icon: "⚡" },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">חרדים</div>
      <nav className="header__nav">
        {navItems.map((item) => (
          <button key={item.label} type="button" className="header__nav-item">
            <span className="button-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
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
