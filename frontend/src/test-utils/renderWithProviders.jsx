import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from '../context/AuthContext.jsx';
import { CartProvider } from '../context/CartContext.jsx';
import { render } from '@testing-library/react';

export function renderWithProviders(ui, { queryClient, ...options } = {}) {
  const client = queryClient || new QueryClient({
    defaultOptions: { queries: { retry: 0 } }
  });

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={client}>
          <AuthContextProvider>
            <CartProvider>{children}</CartProvider>
          </AuthContextProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
