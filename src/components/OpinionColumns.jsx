import { opinionColumns } from "../data/mockData";

export default function OpinionColumns() {
  return (
    <section className="section section--muted">
      <div className="section__header">
        <h2>טורי דעה</h2>
        <span className="section__hint">טורים נבחרים מהמערכת</span>
      </div>
      <div className="opinions">
        {opinionColumns.map((item) => (
          <article key={item.title} className="opinion-card">
            <img src={item.avatar} alt={item.name} className="opinion-card__avatar" />
            <div>
              {item.highlight && <span className="tag">{item.highlight}</span>}
              <h3>{item.title}</h3>
              <p>{item.name}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
