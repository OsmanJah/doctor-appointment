import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastContainer
        theme="light"
        position="top-right"
        autoClose={1500}
        closeOnClick
        pauseOnHover={false}
        transition={Flip}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
