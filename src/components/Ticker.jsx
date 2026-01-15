export default function Ticker({ items }) {
  return (
    <section className="ticker">
      <div className="ticker__label">מבזקים</div>
      <div className="ticker__track">
        {items.map((item) => (
          <span key={item} className="ticker__item">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
