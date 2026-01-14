import { extraContent } from "../data/mockData";

export default function ExtraContent() {
  return (
    <section className="section section--light">
      <div className="section__header">
        <h2>עוד תוכן בשבילכם</h2>
        <span className="section__hint">כתבות עומק ומהפספסתם</span>
      </div>
      <div className="extra-grid">
        {extraContent.map((item) => (
          <article key={item.title} className="extra-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
