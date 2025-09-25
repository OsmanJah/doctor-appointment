import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config'; // Assuming you have BASE_URL for backend
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

// Make sure to install @stripe/stripe-js: npm install @stripe/stripe-js
// Add your Stripe Publishable Key to your frontend environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CartPage = () => {
  const { items, removeItem, addItem, totalPrice, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!token) {
      toast.error('Please log in to proceed to checkout.');
      return;
    }

    console.log('→ [Cart] Cart items being sent to backend:', JSON.stringify(items, null, 2));
    console.log('→ [Cart] Using BASE_URL:', BASE_URL);

    try {
      toast.info('Processing your checkout request...');

      console.log('→ [Cart] Sending request to', `${BASE_URL}/checkout/create-session`);
      const response = await fetch(`${BASE_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems: items }),
      });

      console.log('← [Cart] Received response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ [Cart] Failed to parse response as JSON');
        const text = await response.text();
        console.error('Response text (first 500 chars):', text.substring(0, 500));
        toast.error('Server returned an invalid response. Please try again later.');
        return;
      }

      console.log('← [Cart] Response data:', data);

      if (!response.ok || !data.success) {
        console.error('❌ [Cart] Checkout failed:', data);
        toast.error(data.message || 'Failed to create checkout session.');
        return;
      }

      if (!data.sessionId) {
        console.error('❌ [Cart] Missing sessionId in response');
        toast.error('Server response is missing session ID. Please try again.');
        return;
      }

      console.log('→ [Cart] Redirecting to Stripe checkout with session ID:', data.sessionId);
      const stripe = await stripePromise;

      if (!stripe) {
        console.error('❌ [Cart] Stripe failed to initialize');
        toast.error('Payment provider failed to initialize. Please try again later.');
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        console.error('❌ [Cart] Stripe redirection error:', error);
        toast.error(error.message || 'Payment redirection failed.');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      toast.error(error.message || 'An error occurred during checkout.');
    }
  };

  return (
    <section className="section--alt">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="section__eyebrow">Your Pharmacy Bag</span>
            <h2 className="heading heading--accent">Review your selected treatments</h2>
            <p className="text__para">
              Adjust quantities or remove items before proceeding to our secure checkout powered by Stripe.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="card p-10 text-center">
              <h3 className="text-xl font-semibold text-headingColor">Your cart is currently empty.</h3>
              <p className="text-sm text-textColor mt-2">
                Browse the pharmacy to add prescription refills and wellness essentials.
              </p>
              <Link to="/pharmacy" className="btn btn--sm mx-auto mt-6">
                Explore Pharmacy
              </Link>
            </div>
          ) : (
            <div className="card p-6 md:p-10 space-y-6">
              <ul className="space-y-5">
                {items.map(item => (
                  <li
                    key={item.medicineId || item._id || item.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-primaryColor/10 rounded-2xl px-5 py-4 bg-white/70"
                  >
                    <div>
                      <h4 className="font-semibold text-headingColor text-lg">{item.name}</h4>
                      <p className="text-sm text-primaryColor font-semibold">
                        {(item.price || 0).toLocaleString('hu-HU')} HUF
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeItem(item.medicineId || item._id)}
                        className="btn--outline px-3 py-1 text-sm"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span className="font-semibold text-headingColor">{item.quantity}</span>
                      <button
                        onClick={() => addItem(item)}
                        className="btn--outline px-3 py-1 text-sm"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-textColor/80">
                  Taxes and delivery options are calculated at checkout.
                </div>
                <div className="text-right md:text-left">
                  <p className="text-sm text-textColor/70 uppercase tracking-[0.3em] font-semibold">Total</p>
                  <h3 className="text-3xl font-bold text-headingColor">
                    {totalPrice.toLocaleString('hu-HU')} HUF
                  </h3>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:justify-end gap-3 md:gap-4">
                <button onClick={clearCart} className="btn--outline">
                  Clear Cart
                </button>
                <button onClick={handleCheckout} className="btn">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CartPage;