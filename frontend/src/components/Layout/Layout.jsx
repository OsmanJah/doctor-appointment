import React from "react";
import Router from "../../routes/Router";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import ChatWidget from "../Chat/ChatWidget";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Router />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Layout;
