import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';

// Mock the config
vi.mock('../../config', () => ({
  BASE_URL: 'http://localhost:5000/api/v1'
}));

const renderWithProviders = (hook) => {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthContext.Provider value={{ token: 'test-token', dispatch: vi.fn() }}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  });
};

describe('useFetchData Hook', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('handles empty response', async () => {
    const mockEmptyResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: []
      })
    };

    global.fetch.mockResolvedValueOnce(mockEmptyResponse);

    const { result } = renderWithProviders(() => useFetchData('/doctors'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
