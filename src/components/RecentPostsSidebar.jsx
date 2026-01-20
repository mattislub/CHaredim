import { formatDateWithHebrew } from "../utils/date";

export default function RecentPostsSidebar({
  items = [],
  title = "פוסטים אחרונים",
  emptyMessage = "אין פוסטים אחרונים להצגה.",
}) {
  return (
    <aside className="post-page__sidebar">
      <h2 className="post-page__sidebar-title">{title}</h2>
      {items.length ? (
        <ul className="post-page__recent-list">
          {items.map((item) => (
            <li className="post-page__recent-item" key={item.slug}>
              <a href={`#/post/${item.slug}`} className="post-page__recent-link">
                {item.image ? (
                  <img
                    className="post-page__recent-image"
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />
                ) : null}
                <span className="post-page__recent-text">{item.title}</span>
              </a>
              {item.publishedAt ? (
                <span className="post-page__recent-time">
                  {formatDateWithHebrew(item.publishedAt)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="post-page__recent-empty">{emptyMessage}</p>
      )}
    </aside>
  );
}
