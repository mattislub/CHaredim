export default function PopularList({ items }) {
  return (
    <section className="section">
      <div className="section__header">
        <h2>נקראות ביותר</h2>
        <span className="section__hint">מעודכן לפי צפיות ותגובות</span>
      </div>
      <ol className="popular-list">
        {items.map((item) => (
          <li className="popular-list__item" key={item.slug ?? item.title}>
            <a
              className="popular-list__link headline-link"
              href={`#/post/${item.slug}`}
            >
              <img
                className="popular-list__image"
                src={item.image}
                alt={item.title}
                loading="lazy"
              />
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
