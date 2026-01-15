export default function NewsGrid({ items, isLoading, error }) {
  return (
    <section className="section">
      <div className="section__header">
        <h2>חדשות כלליות</h2>
        <span className="section__hint">עדכונים אחרונים</span>
      </div>
      {isLoading ? (
        <p className="section__status">טוען פוסטים מהשרת...</p>
      ) : null}
      {error ? (
        <p className="section__status section__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      <div className="grid">
        {items.map((item) => (
          <article key={item.id ?? item.title} className="card">
            <img src={item.image} alt={item.title} />
            <div className="card__content">
              <h3>{item.title}</h3>
              <span className="card__time">{item.time}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
