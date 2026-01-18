export default function Ticker({ items }) {
  return (
    <section className="ticker">
      <div className="ticker__label">מבזקים</div>
      <div className="ticker__viewport">
        <div className="ticker__marquee">
          <div className="ticker__list">
            {items.map((item) => (
              <a
                key={item.slug ?? item.label}
                className="ticker__item"
                href={`#/post/${item.slug}`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="ticker__list" aria-hidden="true">
            {items.map((item) => (
              <a
                key={`${item.slug ?? item.label}-duplicate`}
                className="ticker__item"
                href={`#/post/${item.slug}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
