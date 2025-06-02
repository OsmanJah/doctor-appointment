import '@testing-library/jest-dom';

// Mock browser APIs that might be missing in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock fetch for tests
global.fetch = vi.fn();

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
