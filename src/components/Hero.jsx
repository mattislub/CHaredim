import { useMemo } from "react";
import { heroMain, heroSide } from "../data/mockData";
import { getStoredPosts } from "../data/wpImport";

const buildHeroFromPosts = (posts) => {
  if (!posts?.length) {
    return { main: heroMain, side: heroSide };
  }

  const [mainPost, ...restPosts] = posts;
  return {
    main: {
      title: mainPost.title,
      summary: mainPost.summary || "",
      image: mainPost.image,
      tag: "ייבוא",
    },
    side: restPosts.slice(0, 3).map((post) => ({
      title: post.title,
      tag: "ייבוא",
    })),
  };
};

export default function Hero() {
  const heroContent = useMemo(() => {
    const importedPosts = getStoredPosts();
    return buildHeroFromPosts(importedPosts);
  }, []);

  return (
    <section className="hero">
      <article className="hero__main">
        <img
          src={heroContent.main.image}
          alt={heroContent.main.title}
          className="hero__image"
        />
        <div className="hero__content">
          <span className="tag">{heroContent.main.tag}</span>
          <h1>{heroContent.main.title}</h1>
          <p>{heroContent.main.summary}</p>
        </div>
      </article>
      <div className="hero__side">
        {heroContent.side.map((item) => (
          <div key={item.title} className="hero__side-item">
            <span className="tag tag--subtle">{item.tag}</span>
            <h3>{item.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
