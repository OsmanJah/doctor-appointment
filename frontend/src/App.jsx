import "./app.css";
import Layout from "./components/Layout/Layout";
import { AuthContextProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <AuthContextProvider>
      <CartProvider>
        <ChatProvider>
          <Layout />
        </ChatProvider>
      </CartProvider>
    </AuthContextProvider>
  );
}

export default App;
