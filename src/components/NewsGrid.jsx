import { newsCards } from "../data/mockData";

export default function NewsGrid() {
  return (
    <section className="section">
      <div className="section__header">
        <h2>חדשות כלליות</h2>
        <span className="section__hint">עדכונים אחרונים</span>
      </div>
      <div className="grid">
        {newsCards.map((item) => (
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
