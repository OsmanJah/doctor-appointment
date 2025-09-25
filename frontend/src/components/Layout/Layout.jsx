import React, { useEffect } from "react";
import Router from "../../routes/Router";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const Layout = () => {
  useEffect(() => {
    const handlePointerMove = (e) => {
      const el = e.target.closest?.('.btn');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--y', `${y}%`);
    };
    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, []);
  return (
    <>
      <Header />
      <main>
        <Router />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
