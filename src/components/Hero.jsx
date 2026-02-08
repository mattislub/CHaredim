import { normalizeEntities } from "../utils/text";

export default function Hero({ mainPost, sidePosts }) {
  return (
    <section className="hero">
      <article className="hero__main">
        <img
          src={mainPost.image}
          alt={mainPost.title}
          className="hero__image"
        />
        <div className="hero__content">
          <span className="tag">{normalizeEntities(mainPost.tag)}</span>
          <h1 className="headline-font hero__title">
            <a className="headline-link" href={`#/post/${mainPost.slug}`}>
              {normalizeEntities(mainPost.title)}
            </a>
          </h1>
          <p>{normalizeEntities(mainPost.summary)}</p>
        </div>
      </article>
      <div className="hero__side">
        {sidePosts.map((item) => (
          <div key={item.title} className="hero__side-item">
            <span className="tag tag--subtle">{normalizeEntities(item.tag)}</span>
            <h3 className="headline-font hero__side-title">
              <a className="headline-link" href={`#/post/${item.slug}`}>
                {normalizeEntities(item.title)}
              </a>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
