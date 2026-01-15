export default function Ticker({ items }) {
  return (
    <section className="ticker">
      <div className="ticker__label">מבזקים</div>
      <div className="ticker__track">
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
    </section>
  );
}
