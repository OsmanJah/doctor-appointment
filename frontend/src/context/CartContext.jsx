import React, { createContext, useReducer, useEffect } from 'react';


const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};


const loadCartItemsFromStorage = () => {
  const storedItems = localStorage.getItem('cartItems');
  if (storedItems) {
    try {
      let parsedItems = JSON.parse(storedItems);
      if (Array.isArray(parsedItems)) {

        parsedItems = parsedItems.map(item => {
          if (item._id && !item.medicineId) {
            return { ...item, medicineId: item._id };
          }
          return item;
        });
        return parsedItems;
      }
      return [];
    } catch (e) {
      console.error("Failed to parse cart items from localStorage", e);
      return [];
    }
  }
  return [];
};


const initialCartItems = loadCartItemsFromStorage();
const initialState = {
  items: initialCartItems,
  totalPrice: calculateTotalPrice(initialCartItems),
};


const cartReducer = (state, action) => {
  let updatedItems;
  switch (action.type) {
    case 'ADD_ITEM':

      const existingCartItemIndex = state.items.findIndex(
        (item) => item.medicineId === action.payload.medicineId
      );
      const existingCartItem = state.items[existingCartItemIndex];

      if (existingCartItem) {
        const updatedItem = {
          ...existingCartItem,
          quantity: existingCartItem.quantity + 1,
        };
        updatedItems = [...state.items];
        updatedItems[existingCartItemIndex] = updatedItem;
      } else {
        updatedItems = state.items.concat({ 
            medicineId: action.payload.medicineId,
            name: action.payload.name,
            price: action.payload.price,
            description: action.payload.description,
            quantity: action.payload.quantity || 1 
        });
      }
      return {
        ...state,
        items: updatedItems,
        totalPrice: calculateTotalPrice(updatedItems),
      };

    case 'REMOVE_ITEM':
       const itemToRemoveIndex = state.items.findIndex(
        (item) => item.medicineId === action.payload
      );
      const itemToRemove = state.items[itemToRemoveIndex];

      if (!itemToRemove) {
        return state;
      }

      if (itemToRemove.quantity === 1) {
        updatedItems = state.items.filter(item => item.medicineId !== action.payload);
      } else {
        const updatedItem = { ...itemToRemove, quantity: itemToRemove.quantity - 1 };
        updatedItems = [...state.items];
        updatedItems[itemToRemoveIndex] = updatedItem;
      }
        return {
        ...state,
        items: updatedItems,
        totalPrice: calculateTotalPrice(updatedItems),
      };

     case 'CLEAR_CART':
        localStorage.removeItem('cartItems'); 
        return {
            items: [],
            totalPrice: 0,
        };

    default:
      return state;
  }
};


export const CartContext = createContext({
  items: [],
  totalPrice: 0,
  addItem: (item) => {},
  removeItem: (id) => {},
  clearCart: () => {},
});


export const CartProvider = ({ children }) => {
  const [cartState, dispatchCartAction] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartState.items));
  }, [cartState.items]);

  const addItemToCartHandler = (item) => {
    dispatchCartAction({ type: 'ADD_ITEM', payload: item });
  };

  const removeItemFromCartHandler = (id) => {
    dispatchCartAction({ type: 'REMOVE_ITEM', payload: id });
  };

   const clearCartHandler = () => {
    dispatchCartAction({ type: 'CLEAR_CART' });
  };

  const cartContext = {
    items: cartState.items,
    totalPrice: cartState.totalPrice,
    addItem: addItemToCartHandler,
    removeItem: removeItemFromCartHandler,
    clearCart: clearCartHandler,
  };

  return (
    <CartContext.Provider value={cartContext}>
      {children}
    </CartContext.Provider>
  );
}; 