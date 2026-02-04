export default function CategoryShowcaseSection({
  title,
  hint,
  items = [],
  isLoading,
  error,
  moreLink,
  layout = "list",
  emptyMessage = "עדיין אין פוסטים להצגה.",
}) {
  const hasItems = items.length > 0;
  const sectionClassName = `section category-showcase category-showcase--${layout}`;

  return (
    <section className={sectionClassName}>
      <div className="section__header section__header--split">
        <div className="section__title-group">
          <h3>{title}</h3>
          {hint ? <span className="section__hint">{hint}</span> : null}
        </div>
        {moreLink ? (
          <a className="section__more section__more--ghost" href={moreLink.href}>
            {moreLink.label}
          </a>
        ) : null}
      </div>

      {isLoading ? <p className="section__status">טוען פוסטים...</p> : null}
      {error ? (
        <p className="section__status section__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע.
        </p>
      ) : null}
      {!isLoading && !error && !hasItems ? (
        <p className="section__status">{emptyMessage}</p>
      ) : null}

      {hasItems ? (
        <div className={`category-showcase__items category-showcase__items--${layout}`}>
          {items.map((item) => (
            <a
              key={item.id ?? item.title}
              className={`category-showcase__item category-showcase__item--${layout}`}
              href={`#/post/${item.slug}`}
            >
              <div className="category-showcase__media">
                <img src={item.image} alt={item.title} loading="lazy" />
                {layout === "video" ? (
                  <span className="category-showcase__play" aria-hidden="true">
                    ▶
                  </span>
                ) : null}
                {layout === "gallery" ? (
                  <span className="category-showcase__badge">גלריה</span>
                ) : null}
              </div>
              <div className="category-showcase__content">
                <h4>{item.title}</h4>
                <span className="category-showcase__meta">{item.time}</span>
              </div>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
