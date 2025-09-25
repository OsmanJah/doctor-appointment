import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from './context/CartContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 2, refetchOnWindowFocus: false },
    mutations: { retry: 1 },
  }
});

function ErrorBoundary({ children }) {
  const [error, setError] = React.useState(null);
  if (error) {
    return <div role="alert" className="p-4 text-red-700">Something went wrong. Please reload.</div>;
  }
  return (
    <React.ErrorBoundary fallbackRender={({ error }) => {
      return <div role="alert" className="p-4 text-red-700">{error?.message || 'Something went wrong'}</div>;
    }} onError={(e)=>setError(e)}>
      {children}
    </React.ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <CartProvider>
            <ToastContainer
              theme="light"
              position="top-right"
              autoClose={1500}
              closeOnClick
              pauseOnHover={false}
              transition={Flip}
            />
            <App />
          </CartProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
