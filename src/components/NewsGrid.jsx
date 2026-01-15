import { useMemo } from "react";
import { newsCards } from "../data/mockData";
import { getStoredPosts } from "../data/wpImport";

export default function NewsGrid() {
  const cards = useMemo(() => {
    const importedPosts = getStoredPosts();
    if (importedPosts?.length) {
      return importedPosts;
    }
    return newsCards;
  }, []);

  return (
    <section className="section">
      <div className="section__header">
        <h2>חדשות כלליות</h2>
        <span className="section__hint">עדכונים אחרונים</span>
      </div>
      <div className="grid">
        {cards.map((item) => (
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
