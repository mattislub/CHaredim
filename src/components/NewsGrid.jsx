export default function NewsGrid({
  items,
  isLoading,
  error,
  title = "חדשות כלליות",
  hint = "עדכונים אחרונים",
  emptyMessage = "",
  moreLink,
}) {
  const visibleItems = items.slice(0, 8);
  const hasItems = visibleItems.length > 0;

  return (
    <section className="section">
      <div className="section__header">
        <h2>{title}</h2>
        <span className="section__hint">{hint}</span>
      </div>
      {isLoading ? (
        <p className="section__status">טוען פוסטים מהשרת...</p>
      ) : null}
      {error ? (
        <p className="section__status section__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      {!isLoading && !error && !hasItems && emptyMessage ? (
        <p className="section__status">{emptyMessage}</p>
      ) : null}
      {hasItems ? (
        <>
          <div className="grid grid--news">
            {visibleItems.map((item) => (
              <a
                key={item.id ?? item.title}
                className="card card--link card--news"
                href={`#/post/${item.slug}`}
              >
                <img src={item.image} alt={item.title} />
                <div className="card__content">
                  <h3>{item.title}</h3>
                  <span className="card__time">{item.time}</span>
                </div>
              </a>
            ))}
          </div>
          {moreLink ? (
            <div className="section__footer">
              <a className="section__more" href={moreLink.href}>
                {moreLink.label}
              </a>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
