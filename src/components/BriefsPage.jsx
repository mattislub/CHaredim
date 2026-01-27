import { useState } from "react";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 6;

export default function BriefsPage({
  items,
  badge = "מבזקים",
  title = "מבזקים מהירים מהמערכת",
  subtitle = "עדכונים קצרים ומורחבים שנאספו מאתר charedim.co.il.",
  loadMoreLabel = "הצג עוד מבזקים",
  emptyMessage = "עדיין אין מבזקים להצגה.",
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleItems = items.slice(0, visibleCount);
  const hasItems = visibleItems.length > 0;
  const canLoadMore = items.length > visibleItems.length;

  return (
    <section className="briefs-page" dir="rtl">
      <header className="briefs-page__header">
        <div>
          <p className="briefs-page__badge">{badge}</p>
          <h1>{title}</h1>
        </div>
        <p className="briefs-page__subtitle">{subtitle}</p>
      </header>
      {hasItems ? (
        <>
          <div className="briefs-page__list">
            {visibleItems.map((item) => (
              <article className="briefs-page__item" key={item.id ?? item.title}>
                <div className="briefs-page__meta">
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                </div>
                <div className="briefs-page__footer">
                  <span className="briefs-page__time">{item.time}</span>
                  <span className="briefs-page__source">
                    מקור: <a href="https://charedim.co.il">{item.source}</a>
                  </span>
                </div>
              </article>
            ))}
          </div>
          {canLoadMore ? (
            <div className="briefs-page__more">
              <button
                type="button"
                className="briefs-page__more-button"
                onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
              >
                {loadMoreLabel}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="briefs-page__status">{emptyMessage}</p>
      )}
    </section>
  );
}
