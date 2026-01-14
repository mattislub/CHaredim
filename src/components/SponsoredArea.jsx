import { sponsoredContent } from "../data/mockData";

export default function SponsoredArea() {
  return (
    <section className="section sponsored">
      <div className="sponsored__label">{sponsoredContent.title}</div>
      <p>{sponsoredContent.description}</p>
    </section>
  );
}
