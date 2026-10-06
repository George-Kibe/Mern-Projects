import { Outlet, ScrollRestoration } from "react-router";
import Masthead from "../components/Masthead";
import Footer from "../components/Footer";

const PrimaryLayout = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
};

export default PrimaryLayout;
