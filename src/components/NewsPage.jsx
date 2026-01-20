export default function NewsPage({
  items,
  isLoading,
  error,
  emptyMessage = "עדיין אין חדשות להצגה.",
}) {
  const hasItems = items.length > 0;

  return (
    <section className="news-page">
      <header className="news-page__header">
        <div>
          <p className="news-page__badge">חדשות</p>
          <h1>כל החדשות</h1>
        </div>
        <p className="news-page__subtitle">כל העדכונים במקום אחד.</p>
      </header>
      {isLoading ? (
        <p className="news-page__status">טוען פוסטים מהשרת...</p>
      ) : null}
      {error ? (
        <p className="news-page__status news-page__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      {!isLoading && !error && !hasItems ? (
        <p className="news-page__status">{emptyMessage}</p>
      ) : null}
      {hasItems ? (
        <div className="news-page__list">
          {items.map((item) => (
            <article className="news-page__item" key={item.id ?? item.title}>
              <img
                className="news-page__image"
                src={item.image}
                alt={item.title}
              />
              <div className="news-page__content">
                <div className="news-page__meta">
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                  {item.time ? (
                    <span className="news-page__time">{item.time}</span>
                  ) : null}
                </div>
                <a className="news-page__button" href={`#/post/${item.slug}`}>
                  לפתיחת הפוסט המלא
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
