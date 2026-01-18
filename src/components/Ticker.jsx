export default function Ticker({ items }) {
  const limitedItems = items.slice(0, 10);

  const renderItems = (entries, keySuffix = "") =>
    entries.map((item, index) => (
      <span className="ticker__entry" key={`${item.slug ?? item.label}-${index}${keySuffix}`}>
        <a className="ticker__item" href={`#/post/${item.slug}`}>
          {item.label}
        </a>
        {index < entries.length - 1 ? (
          <span className="ticker__separator" aria-hidden="true">
            |
          </span>
        ) : null}
      </span>
    ));

  return (
    <section className="ticker">
      <div className="ticker__label">מבזקים</div>
      <div className="ticker__viewport">
        <div className="ticker__marquee">
          <div className="ticker__list">{renderItems(limitedItems)}</div>
          <div className="ticker__list" aria-hidden="true">
            {renderItems(limitedItems, "-duplicate")}
          </div>
        </div>
      </div>
    </section>
  );
}
