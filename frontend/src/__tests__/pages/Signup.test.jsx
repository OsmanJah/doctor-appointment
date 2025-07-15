import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContextProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Signup from '../../pages/Signup';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContextProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
};

describe('Signup Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('renders role selection', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText(/Are you a:/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor/i)).toBeInTheDocument();
  });
});