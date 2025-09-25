import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const CheckoutSuccess = () => {
  const { clearCart } = useContext(CartContext);

  // Clear the cart when the component mounts
  useEffect(() => {
    clearCart();
  }, [clearCart]); // Dependency array includes clearCart

  return (
    <section>
      <div className="container text-center">
  <h2 className="heading heading--accent mb-4">Payment Successful!</h2>
        <p className="text__para mb-6">
          Thank you for your purchase.
        </p>
        <Link to="/home" className="btn">
          Return to Home
        </Link>
         <Link to="/users/profile/me" className="btn ml-4">
          View My Account
        </Link>
      </div>
    </section>
  );
};

export default CheckoutSuccess; 