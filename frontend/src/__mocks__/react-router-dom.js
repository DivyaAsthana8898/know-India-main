/**
 * Manual mock for react-router-dom
 * Used by Jest tests
 */

const React = require('react');

const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

const mockNavigate = jest.fn();

module.exports = {
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: () => null,
  Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  Navigate: () => null,
  Outlet: () => null,
  useLocation: jest.fn(() => mockLocation),
  useNavigate: jest.fn(() => mockNavigate),
  useParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
  useMatch: jest.fn(() => null),
  useRoutes: jest.fn(() => null),
};
