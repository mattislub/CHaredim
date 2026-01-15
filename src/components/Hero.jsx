import { heroMain, heroSide } from "../data/mockData";

export default function Hero() {
  return (
    <section className="hero">
      <article className="hero__main">
        <img
          src={heroMain.image}
          alt={heroMain.title}
          className="hero__image"
        />
        <div className="hero__content">
          <span className="tag">{heroMain.tag}</span>
          <h1>{heroMain.title}</h1>
          <p>{heroMain.summary}</p>
        </div>
      </article>
      <div className="hero__side">
        {heroSide.map((item) => (
          <div key={item.title} className="hero__side-item">
            <span className="tag tag--subtle">{item.tag}</span>
            <h3>{item.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
