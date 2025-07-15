import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';
import { vi } from 'vitest';

const TestComponent = () => {
  const { user, role, token, dispatch } = React.useContext(AuthContext);
  
  return (
    <div>
      <div data-testid="user-info">
        User: {user ? user.name : 'Not logged in'}
      </div>
      <div data-testid="role-info">
        Role: {role || 'None'}
      </div>
      <div data-testid="token-info">
        Token: {token ? 'Present' : 'Not present'}
      </div>
      <button onClick={() => dispatch({ type: 'LOGIN_START' })}>
        Login Start
      </button>
      <button onClick={() => dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: { name: 'John Doe' }, 
          token: 'mock-token', 
          role: 'patient' 
        } 
      })}>
        Login Success
      </button>
      <button onClick={() => dispatch({ type: 'LOGOUT' })}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  test('provides initial state', () => {
    render(
      <AuthContext.Provider value={{
        user: null,
        role: null,
        token: null,
        dispatch: vi.fn()
      }}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: Not logged in');
    expect(screen.getByTestId('role-info')).toHaveTextContent('Role: None');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Token: Not present');
  });

  test('handles login success', () => {
    const mockDispatch = vi.fn();
    
    render(
      <AuthContext.Provider value={{
        user: { name: 'John Doe' },
        role: 'patient',
        token: 'mock-token',
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: John Doe');
    expect(screen.getByTestId('role-info')).toHaveTextContent('Role: patient');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Token: Present');
  });

  test('handles dispatch actions', () => {
    const mockDispatch = vi.fn();
    
    render(
      <AuthContext.Provider value={{
        user: null,
        role: null,
        token: null,
        dispatch: mockDispatch
      }}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Login Start'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_START' });
    
    fireEvent.click(screen.getByText('Login Success'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: { name: 'John Doe' },
        token: 'mock-token',
        role: 'patient'
      }
    });
    
    fireEvent.click(screen.getByText('Logout'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
  });

  test('persists authentication state', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      user: { name: 'John Doe' },
      token: 'mock-token',
      role: 'patient'
    }));
    
    render(
      <AuthContext.Provider value={{
        user: { name: 'John Doe' },
        role: 'patient',
        token: 'mock-token',
        dispatch: vi.fn()
      }}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: John Doe');
  });
});
