import { useState } from "react";
import { normalizeEntities } from "../utils/text";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 6;

export default function BriefsPage({
  items,
  isLoading = false,
  error = "",
  badge = "מבזקים",
  title = "מבזקים",
  subtitle = "",
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
          <p className="briefs-page__badge">{normalizeEntities(badge)}</p>
          <h1>{normalizeEntities(title)}</h1>
        </div>
        <p className="briefs-page__subtitle">{normalizeEntities(subtitle)}</p>
      </header>
      {isLoading ? (
        <p className="briefs-page__status">טוען מבזקים מהשרת...</p>
      ) : null}
      {error ? (
        <p className="briefs-page__status briefs-page__status--error" role="alert">
          לא הצלחנו לטעון את המבזקים כרגע. נסו שוב מאוחר יותר.
        </p>
      ) : null}
      {!isLoading && !error ? (
        hasItems ? (
          <>
            <div className="briefs-page__list">
              {visibleItems.map((item) => (
                <article className="briefs-page__item" key={item.id ?? item.title}>
                  <div className="briefs-page__meta">
                    <h2>{normalizeEntities(item.title)}</h2>
                    <p>{normalizeEntities(item.subtitle)}</p>
                  </div>
                  <div className="briefs-page__footer">
                    <span className="briefs-page__time">
                      {normalizeEntities(item.time)}
                    </span>
                    <span className="briefs-page__source">
                      מקור:{" "}
                      <a href={item.sourceUrl || "https://charedim.co.il"}>
                        {normalizeEntities(item.source)}
                      </a>
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
          <p className="briefs-page__status">{emptyMessage}</p>
        )
      ) : null}
    </section>
  );
}
