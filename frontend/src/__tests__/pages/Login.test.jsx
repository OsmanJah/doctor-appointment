import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from '../../context/AuthContext';
import Login from '../../pages/Login';
import { vi } from 'vitest';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContextProvider>
        {component}
      </AuthContextProvider>
    </BrowserRouter>
  );
};

// Mock the config
vi.mock('../../config', () => ({
  BASE_URL: 'http://localhost:5000/api/v1'
}));

describe('Login Page', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByRole('heading', { name: /Access Your Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Your Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('renders signup link', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter Your Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submit button has correct attributes', async () => {
    renderWithProviders(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /Login/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(submitButton).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        token: 'mock-token',
        data: { _id: '1', name: 'John Doe', role: 'patient' }
      })
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter Your Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );
    });
  });

  test('handles login error', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid credentials'
      })
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter Your Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    // Since we're mocking toast, we can't test the actual error display
    // But we can verify the fetch was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('shows loading state during login', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        token: 'mock-token',
        data: { _id: '1', name: 'John Doe', role: 'patient' }
      })
    };
    
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter Your Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // The loading state shows a spinner, not text
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
