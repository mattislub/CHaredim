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
          <span className="tag">{mainPost.tag}</span>
          <h1>
            <a className="headline-link" href={`#/post/${mainPost.slug}`}>
              {mainPost.title}
            </a>
          </h1>
          <p>{mainPost.summary}</p>
        </div>
      </article>
      <div className="hero__side">
        {sidePosts.map((item) => (
          <div key={item.title} className="hero__side-item">
            <span className="tag tag--subtle">{item.tag}</span>
            <h3>
              <a className="headline-link" href={`#/post/${item.slug}`}>
                {item.title}
              </a>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
