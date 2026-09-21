# Security Policy

This document outlines the security measures, practices, and guidelines implemented in the KnowIndia main website.

## Table of Contents

- [Authentication](#authentication)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Data Validation](#data-validation)
- [Security Headers](#security-headers)
- [Dependency Management](#dependency-management)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Authentication

### JWT & HttpOnly Cookies

- **HttpOnly Cookies**: JWT tokens are stored in HttpOnly cookies to prevent XSS attacks from accessing authentication tokens
- **Secure Flag**: Cookies are marked as `Secure` in production, ensuring transmission only over HTTPS
- **SameSite Attribute**: Cookies use `SameSite=Lax` to prevent CSRF attacks while allowing normal navigation
- **Token Expiration**: JWTs have defined expiration times to limit the window of token compromise

### OAuth Flow (Google Sign-In)

- **Popup-Based Authentication**: OAuth flow uses popup windows to isolate authentication from the main application
- **Centralized Login Hook**: All login implementations use the shared `useGoogleLogin` hook to ensure consistent security practices
- **Popup Flag Management**: Temporary flags track active login popups with automatic cleanup after 5 minutes

```javascript
// Correct: Use shared hook for OAuth
import useGoogleLogin from '../hooks/useGoogleLogin';
const { openGoogleLogin } = useGoogleLogin();
```

### Protected Routes

- **Route Protection**: Sensitive routes use the `ProtectedRoute` wrapper component
- **Authentication State**: `AuthContext` serves as the single source of truth for authentication status
- **Redirect on Unauthorized**: Unauthenticated users are redirected appropriately when accessing protected resources

---

## API Security

### Request Authentication

All authenticated API calls must include:

```javascript
// SECURITY: Use credentials include for HttpOnly cookie auth
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: getAuthHeaders(), // From AuthContext
  credentials: 'include',   // Required for cookies
  body: JSON.stringify(data),
});
```

### CSRF Protection

- **CSRF Tokens**: The application fetches and includes CSRF tokens for state-changing operations
- **Token Header**: CSRF tokens are sent via `X-CSRF-Token` header

### Response Validation

All API responses are validated before use:

```javascript
// SECURITY: Validate API response structure
if (Array.isArray(apiResponse)) {
  setData(apiResponse);
} else if (apiResponse && Array.isArray(apiResponse.data)) {
  setData(apiResponse.data);
} else {
  setData([]); // Safe fallback
}
```

### Error Handling

- **No Sensitive Data in Errors**: Error messages do not expose internal details
- **Graceful Degradation**: API failures result in safe fallback states, not crashes

---

## Frontend Security

### PostMessage Origin Validation

Cross-window communication uses strict origin validation:

```javascript
// SECURITY: Strict origin validation - exact matches only
const allowedOrigins = new Set([
  window.location.origin,
  'https://knowindia.vercel.app',
  'https://know-india.vercel.app',
  'https://know-india-final.vercel.app'
]);

// Reject unknown origins
if (!allowedOrigins.has(event.origin)) {
  return;
}

// Validate message structure
if (!event.data || typeof event.data !== 'object') {
  return;
}
```

**Important**: Do NOT use regex patterns for origin validation as they can be exploited.

### XSS Prevention

- **React's Built-in Protection**: React automatically escapes values in JSX
- **No `dangerouslySetInnerHTML`**: Avoided unless absolutely necessary with sanitized content
- **User Input Sanitization**: All user inputs are validated and sanitized before use

### Content Security

- **No Inline Scripts**: Application avoids inline JavaScript execution
- **External Resources**: Third-party resources are loaded from trusted CDNs only

---

## Data Validation

### Input Validation

- **Type Checking**: All inputs are type-checked before processing
- **Boundary Validation**: Numeric inputs are validated for acceptable ranges
- **String Sanitization**: Text inputs are sanitized to prevent injection attacks

### LocalStorage Usage

LocalStorage is used carefully with the following considerations:

| Data Type | Storage | Notes |
|-----------|---------|-------|
| Auth Tokens | ❌ Never | Use HttpOnly cookies instead |
| User Preferences | ✅ Allowed | Theme, UI settings |
| Temporary Flags | ✅ Allowed | Popup state, with auto-cleanup |
| Sensitive Data | ❌ Never | PII, credentials, etc. |

```javascript
// SECURITY: Only store non-sensitive, temporary data
localStorage.setItem('color-theme', theme); // OK - user preference
localStorage.setItem('auth_popup_active', Date.now().toString()); // OK - temporary flag
```

---

## Security Headers

Recommended headers for deployment (configure in `vercel.json` or server):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Dependency Management

### Audit Schedule

- Run `npm audit` before each deployment
- Address critical and high severity vulnerabilities immediately
- Review and update dependencies monthly

### Commands

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Update dependencies
npm update
```

### Excluded Packages

Do not use packages that are:
- Deprecated or unmaintained (no updates in 2+ years)
- Have known unpatched vulnerabilities
- Require excessive permissions

---

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | Yes |
| `REACT_APP_ENV` | Environment (development/production) | Yes |

### Security Rules

1. **Never commit `.env` files** - Listed in `.gitignore`
2. **No secrets in frontend** - All secrets stay in backend
3. **Use environment-specific configs** - Different values for dev/prod

---

## Production Checklist

Before deploying to production, verify:

- [ ] All `console.log` statements removed or guarded
- [ ] No hardcoded API keys or secrets
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] HttpOnly cookies configured correctly
- [ ] CORS configured for production domains only
- [ ] Error boundaries in place for graceful failures
- [ ] Rate limiting enabled on backend
- [ ] HTTPS enforced

---

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers directly with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Any suggested fixes (optional)

We aim to respond to security reports within 48 hours and will work with you to understand and address the issue.

---

## Security Updates

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-26 | 1.0 | Initial security documentation |
| 2026-01-26 | 1.1 | Hardened postMessage validation, centralized OAuth |

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices/)
