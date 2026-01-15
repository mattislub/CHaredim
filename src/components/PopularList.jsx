export default function PopularList({ items }) {
  return (
    <section className="section">
      <div className="section__header">
        <h2>נקראות ביותר</h2>
        <span className="section__hint">מעודכן לפי צפיות ותגובות</span>
      </div>
      <ol className="popular-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
