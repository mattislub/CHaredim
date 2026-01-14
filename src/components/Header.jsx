const navItems = ["דף הבית", "חדשות", "קהילות", "טורי דעה", "מבזקים"];

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">חרדים</div>
      <nav className="header__nav">
        {navItems.map((item) => (
          <button key={item} type="button" className="header__nav-item">
            {item}
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
