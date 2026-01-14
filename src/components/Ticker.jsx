import { tickerItems } from "../data/mockData";

export default function Ticker() {
  return (
    <section className="ticker">
      <div className="ticker__label">מבזקים</div>
      <div className="ticker__track">
        {tickerItems.map((item) => (
          <span key={item} className="ticker__item">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
