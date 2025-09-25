import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { AuthContextProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Home from '../../pages/Home';

const renderWithProviders = (component) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <CartProvider>
            {component}
          </CartProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('renders hero section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/We help patients live a healthy, longer life/i)).toBeInTheDocument();
  });

  test('renders featured doctors section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/Our great doctors/i)).toBeInTheDocument();
  });
});