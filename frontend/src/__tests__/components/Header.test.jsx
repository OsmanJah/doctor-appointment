import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Header from '../../components/Header/Header';

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

describe('Header Component', () => {
  test('renders MarieCare brand', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText(/MarieCare/i)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Find a Doctor/i)).toBeInTheDocument();
    expect(screen.getByText(/Pharmacy/i)).toBeInTheDocument();
  });

  test('renders login button when not authenticated', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });

  test('brand logo links to home', () => {
    renderWithProviders(<Header />);
    const logoLink = screen.getByRole('link', { name: /MarieCare/i });
    expect(logoLink).toHaveAttribute('href', '/home');
  });
});
