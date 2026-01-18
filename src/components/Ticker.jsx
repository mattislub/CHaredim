export default function Ticker({ items }) {
  const baseItems = items ?? [];
  const minItems = 12;
  const loops = baseItems.length ? Math.ceil(minItems / baseItems.length) : 1;
  const repeatedItems = Array.from({ length: loops }, (_, loopIndex) =>
    baseItems.map((item, index) => ({
      item,
      key: `${item.slug ?? item.label}-${loopIndex}-${index}`,
    })),
  ).flat();

  const renderItems = (entries, keySuffix = "") =>
    entries.map(({ item, key }, index) => (
      <span className="ticker__entry" key={`${key}${keySuffix}`}>
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
          <div className="ticker__list">{renderItems(repeatedItems)}</div>
          <div className="ticker__list" aria-hidden="true">
            {renderItems(repeatedItems, "-duplicate")}
          </div>
        </div>
      </div>
    </section>
  );
}
