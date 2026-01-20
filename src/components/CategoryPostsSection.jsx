export default function CategoryPostsSection({
  title,
  hint,
  items = [],
  isLoading,
  error,
  moreLink,
  variant = "default",
  emptyMessage = "עדיין אין פוסטים בקטגוריה הזו.",
}) {
  const hasItems = items.length > 0;
  const sectionClassName = `section section--category section--category-${variant}`;

  return (
    <section className={sectionClassName}>
      <div className="section__header section__header--split">
        <div className="section__title-group">
          <h2>{title}</h2>
          {hint ? <span className="section__hint">{hint}</span> : null}
        </div>
        {moreLink ? (
          <a className="section__more section__more--ghost" href={moreLink.href}>
            {moreLink.label}
          </a>
        ) : null}
      </div>
      {isLoading ? <p className="section__status">טוען פוסטים מהשרת...</p> : null}
      {error ? (
        <p className="section__status section__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      {!isLoading && !error && !hasItems ? (
        <p className="section__status">{emptyMessage}</p>
      ) : null}
      {hasItems ? (
        <div className="grid grid--category">
          {items.map((item) => (
            <a
              key={item.id ?? item.title}
              className="card card--link card--category"
              href={`#/post/${item.slug}`}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="card__content">
                <h3>{item.title}</h3>
                <span className="card__time">{item.time}</span>
              </div>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
