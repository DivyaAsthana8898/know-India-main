/**
 * Mock implementations for context providers used in tests
 */

// Default mock user for authenticated state
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  avatar: null,
};

// Mock AuthContext values
export const createMockAuthContext = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  csrfToken: 'mock-csrf-token',
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token',
  })),
  refetchUser: jest.fn(),
  ...overrides,
});

// Mock ThemeContext values
export const createMockThemeContext = (overrides = {}) => ({
  theme: 'light',
  toggleTheme: jest.fn(),
  ...overrides,
});
