import { communityTabs } from "../data/mockData";

export default function Communities() {
  return (
    <section className="section section--light">
      <div className="section__header">
        <h2>קהילות</h2>
        <span className="section__hint">חיבור לקהילה המקומית</span>
      </div>
      <div className="community-tabs">
        {communityTabs.map((tab) => (
          <div key={tab.name} className="community-card">
            <h3>{tab.name}</h3>
            <ul>
              {tab.articles.map((article) => (
                <li key={article}>{article}</li>
              ))}
            </ul>
            <button type="button" className="community-link">
              לכל הכתבות מהקהילה
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
