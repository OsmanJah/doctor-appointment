import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartContext } from '../../context/CartContext';
import { vi } from 'vitest';

const TestComponent = () => {
  const { cart, dispatch } = React.useContext(CartContext);
  
  return (
    <div>
      <div data-testid="cart-count">
        Cart Items: {cart.length}
      </div>
      <div data-testid="cart-items">
        {cart.map((item, index) => (
          <div key={index}>
            {item.name} - ${item.price} - Qty: {item.quantity}
          </div>
        ))}
      </div>
      <button onClick={() => dispatch({ 
        type: 'ADD_TO_CART', 
        payload: { 
          _id: '1', 
          name: 'Medicine A', 
          price: 10, 
          quantity: 1 
        } 
      })}>
        Add Item
      </button>
      <button onClick={() => dispatch({ 
        type: 'REMOVE_FROM_CART', 
        payload: { _id: '1' } 
      })}>
        Remove Item
      </button>
      <button onClick={() => dispatch({ 
        type: 'UPDATE_QUANTITY', 
        payload: { _id: '1', quantity: 3 } 
      })}>
        Update Quantity
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        Clear Cart
      </button>
    </div>
  );
};

describe('CartContext', () => {
  test('provides initial empty cart state', () => {
    render(
      <CartContext.Provider value={{
        cart: [],
        dispatch: vi.fn()
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart Items: 0');
  });

  test('handles add to cart', () => {
    const mockDispatch = vi.fn();
    
    render(
      <CartContext.Provider value={{
        cart: [],
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Add Item'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_TO_CART',
      payload: {
        _id: '1',
        name: 'Medicine A',
        price: 10,
        quantity: 1
      }
    });
  });

  test('displays cart items', () => {
    const mockCart = [
      { _id: '1', name: 'Medicine A', price: 10, quantity: 2 },
      { _id: '2', name: 'Medicine B', price: 15, quantity: 1 }
    ];
    
    render(
      <CartContext.Provider value={{
        cart: mockCart,
        dispatch: vi.fn()
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart Items: 2');
    expect(screen.getByText('Medicine A - $10 - Qty: 2')).toBeInTheDocument();
    expect(screen.getByText('Medicine B - $15 - Qty: 1')).toBeInTheDocument();
  });

  test('handles remove from cart', () => {
    const mockDispatch = vi.fn();
    
    render(
      <CartContext.Provider value={{
        cart: [{ _id: '1', name: 'Medicine A', price: 10, quantity: 1 }],
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Remove Item'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_FROM_CART',
      payload: { _id: '1' }
    });
  });

  test('handles quantity update', () => {
    const mockDispatch = vi.fn();
    
    render(
      <CartContext.Provider value={{
        cart: [{ _id: '1', name: 'Medicine A', price: 10, quantity: 1 }],
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Update Quantity'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_QUANTITY',
      payload: { _id: '1', quantity: 3 }
    });
  });

  test('handles clear cart', () => {
    const mockDispatch = vi.fn();
    
    render(
      <CartContext.Provider value={{
        cart: [{ _id: '1', name: 'Medicine A', price: 10, quantity: 1 }],
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </CartContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Clear Cart'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_CART' });
  });
});
