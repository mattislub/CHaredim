import { useState } from "react";
import RecentPostsSidebar from "./RecentPostsSidebar";

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function NewsPage({
  items,
  isLoading,
  error,
  recentPosts = [],
  badge = "חדשות",
  title = "כל החדשות",
  subtitle = "כל העדכונים במקום אחד.",
  loadMoreLabel = "הצג עוד חדשות",
  emptyMessage = "עדיין אין חדשות להצגה.",
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleItems = items.slice(0, visibleCount);
  const hasItems = visibleItems.length > 0;
  const canLoadMore = items.length > visibleItems.length;

  return (
    <section className="news-page" dir="rtl">
      <header className="news-page__header">
        <div>
          <p className="news-page__badge">{badge}</p>
          <h1>{title}</h1>
        </div>
        <p className="news-page__subtitle">{subtitle}</p>
      </header>
      {isLoading ? (
        <p className="news-page__status">טוען פוסטים מהשרת...</p>
      ) : null}
      {error ? (
        <p className="news-page__status news-page__status--error" role="alert">
          לא הצלחנו לטעון את הפוסטים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      {!isLoading && !error ? (
        <div className="news-page__grid post-page__grid">
          <div className="news-page__main post-page__main">
            {hasItems ? (
              <>
                <div className="news-page__list">
                  {visibleItems.map((item) => (
                    <article className="news-page__item" key={item.id ?? item.title}>
                      <img
                        className="news-page__image"
                        src={item.image}
                        alt={item.title}
                      />
                      <div className="news-page__content">
                        <div className="news-page__meta">
                          <h2>{item.title}</h2>
                          <p>{item.subtitle}</p>
                          {item.time ? (
                            <span className="news-page__time">{item.time}</span>
                          ) : null}
                        </div>
                        <a className="news-page__button" href={`#/post/${item.slug}`}>
                          לפתיחת הפוסט המלא
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
                {canLoadMore ? (
                  <div className="news-page__more">
                    <button
                      type="button"
                      className="news-page__more-button"
                      onClick={() =>
                        setVisibleCount((count) => count + LOAD_MORE_COUNT)
                      }
                    >
                      {loadMoreLabel}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="news-page__status">{emptyMessage}</p>
            )}
          </div>
          <RecentPostsSidebar items={recentPosts} />
        </div>
      ) : null}
    </section>
  );
}
