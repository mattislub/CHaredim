export default function OpinionColumns({
  items = [],
  isLoading = false,
  error = "",
  emptyMessage = "עדיין אין טורי דעה זמינים.",
}) {
  return (
    <section className="section section--muted">
      <div className="section__header">
        <h2>טורי דעה</h2>
        <span className="section__hint">טורים נבחרים מהמערכת</span>
      </div>
      {isLoading ? <p className="section__status">טוען טורי דעה...</p> : null}
      {error ? (
        <p className="section__status section__status--error">
          לא הצלחנו לטעון את טורי הדעה כרגע.
        </p>
      ) : null}
      {!isLoading && !error ? (
        items.length ? (
          <div className="opinions">
            {items.map((item) => (
              <article key={item.slug ?? item.title} className="opinion-card">
                <a
                  className="opinion-card__link"
                  href={`#/post/${item.slug}`}
                >
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="opinion-card__avatar"
                  />
                  <div>
                    {item.highlight && <span className="tag">{item.highlight}</span>}
                    <h3>{item.title}</h3>
                    <p>{item.name}</p>
                  </div>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="section__status">{emptyMessage}</p>
        )
      ) : null}
    </section>
  );
}
