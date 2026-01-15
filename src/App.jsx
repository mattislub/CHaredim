import { useEffect, useState } from "react";
import AdminPage from "./components/AdminPage";
import Communities from "./components/Communities";
import ExtraContent from "./components/ExtraContent";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewsGrid from "./components/NewsGrid";
import OpinionColumns from "./components/OpinionColumns";
import PopularList from "./components/PopularList";
import SponsoredArea from "./components/SponsoredArea";
import Ticker from "./components/Ticker";

export default function App() {
  const [isAdminView, setIsAdminView] = useState(
    window.location.hash === "#/admin"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === "#/admin");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="app">
      <Header />
      <main>
        {isAdminView ? (
          <AdminPage />
        ) : (
          <>
            <Hero />
            <Ticker />
            <NewsGrid />
            <Communities />
            <OpinionColumns />
            <PopularList />
            <ExtraContent />
            <SponsoredArea />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
