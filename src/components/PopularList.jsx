import { popularPosts } from "../data/mockData";

export default function PopularList() {
  return (
    <section className="section">
      <div className="section__header">
        <h2>נקראות ביותר</h2>
        <span className="section__hint">מעודכן לפי צפיות ותגובות</span>
      </div>
      <ol className="popular-list">
        {popularPosts.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
