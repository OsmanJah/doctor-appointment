import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config'; // Assuming you have BASE_URL for backend
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';

// Make sure to install @stripe/stripe-js: npm install @stripe/stripe-js
// Add your Stripe Publishable Key to your frontend environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CartPage = () => {
  const { items, removeItem, addItem, totalPrice, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!token) {
      toast.error("Please log in to proceed to checkout.");
      return;
    }

    console.log("→ [Cart] Cart items being sent to backend:", JSON.stringify(items, null, 2));
    console.log("→ [Cart] Using BASE_URL:", BASE_URL);
    
    try {
      // Show checkout is processing
      toast.info("Processing your checkout request...");
      
      // 1. Create checkout session on the backend
      console.log("→ [Cart] Sending request to", `${BASE_URL}/checkout/create-session`);
      const response = await fetch(`${BASE_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItems: items }), 
      });
      
      console.log("← [Cart] Received response status:", response.status);
      
      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("❌ [Cart] Failed to parse response as JSON");
        const text = await response.text();
        console.error("Response text (first 500 chars):", text.substring(0, 500));
        toast.error("Server returned an invalid response. Please try again later.");
        return;
      }
      
      console.log("← [Cart] Response data:", data);

      if (!response.ok || !data.success) {
        console.error("❌ [Cart] Checkout failed:", data);
        toast.error(data.message || 'Failed to create checkout session.');
        return;
      }
      
      if (!data.sessionId) {
        console.error("❌ [Cart] Missing sessionId in response");
        toast.error("Server response is missing session ID. Please try again.");
        return;
      }

      // 2. Redirect to Stripe Checkout
      console.log("→ [Cart] Redirecting to Stripe checkout with session ID:", data.sessionId);
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error("❌ [Cart] Stripe failed to initialize");
        toast.error("Payment provider failed to initialize. Please try again later.");
        return;
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        console.error("❌ [Cart] Stripe redirection error:", error);
        toast.error(error.message || "Payment redirection failed.");
      }
      // No need to clear cart here, Stripe handles redirection.
      // Success page should ideally handle clearing the cart.

    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error(error.message || 'An error occurred during checkout.');
    }
  };

  return (
    <section>
      <div className="container">
  <h2 className="heading heading--accent text-center mb-8">Shopping Cart</h2>

        {items.length === 0 ? (
          <p className="text-center text-textColor">Your cart is currently empty.</p>
        ) : (
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.medicineId || item._id || item.name} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-semibold text-headingColor">{item.name}</h4>
                    <p className="text-sm text-primaryColor font-medium">{(item.price || 0).toLocaleString("hu-HU")} HUF</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => removeItem(item.medicineId || item._id)}
                      className="px-2 py-1 border rounded text-slate-600 hover:bg-slate-50"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => addItem(item)} // Re-use addItem to increase quantity
                      className="px-2 py-1 border rounded text-slate-600 hover:bg-slate-50"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-right mb-6">
              <h3 className="text-xl font-bold text-headingColor">
                Total: {totalPrice.toLocaleString("hu-HU")} HUF
              </h3>
            </div>

            <div className="flex justify-end gap-4">
               <button 
                  onClick={clearCart}
                  className="btn--outline"
                >
                  Clear Cart
                </button>
               <button 
                  onClick={handleCheckout}
                  className="btn"
                >
                  Proceed to Checkout
                </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage; 