<div align="center">
  <img src="frontend/src/Assets/logo.png" alt="Know India" width="150" />

  # Know India

  **Discover the soul of India — its states, cultures, festivals, and heritage.**

  A full-stack web application to explore 28 states, 8 union territories, historical landmarks, vibrant festivals, the Indian Constitution, and authentic traveler stories.

  [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://knowindia.aryankr.in)
  [![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange?style=for-the-badge)](CONTRIBUTING.md)

  [Live Demo](https://knowindia.aryankr.in) · [Admin Dashboard](https://knowindiadash.aryankr.in) · [Report Bug](https://github.com/aryanjsx/knowIndia_Final/issues) · [Request Feature](https://github.com/aryanjsx/knowIndia_Final/issues)

</div>

---

## Features

**Explore India**
Interactive India map powered by [@aryanjsx/indiamap](https://www.npmjs.com/package/@aryanjsx/indiamap). Click any state for a smooth zoom animation that transitions to its detail page. Browse every state and union territory, view capitals, languages, famous attractions, and tourist destinations.

**3D District Maps**
Each state page features an interactive 3D political map built with Three.js and React Three Fiber. Every district is rendered with unique colors, varied extrusion heights, and beveled edges. Hover to highlight a district; click to see its name in a popup. Covers all 28 states and 8 union territories with accurate, up-to-date district boundaries.

**Festivals**
Browse India's festivals by month or name. Each festival page covers celebrations, best places to experience them, and the states where they're observed.

**Constitution**
Read through the Indian Constitution — Preamble, key features, amendments, and the story of its initiation.

**Traveler Reviews**
Community-driven reviews with star ratings, photos, upvote/downvote, and filtering by place, state, or rating.

**Save & Bookmark**
Sign in to save favorite places across devices. Bookmarks sync to your account automatically.

**Global Search**
Search across states, places, tourist attractions, and festivals from the navbar — with keyboard navigation and grouped results.

**Profile & Posts**
Authenticated users can write travel posts, manage their profile, and update their avatar and settings.

**Dark Mode**
Full dark/light theme toggle that persists across sessions.

**PWA**
Installable on mobile and desktop. Offline support with smart caching — static assets are pre-cached, images use cache-first, and API responses use network-first with fallback.

**Secure Auth**
Google OAuth 2.0 via popup flow, JWT stored in HttpOnly cookies, CSRF protection, and token blacklisting on logout.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, React Router, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Swiper, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (TiDB Cloud compatible) |
| **Auth** | Google OAuth 2.0 (Passport.js), JWT |
| **Security** | Helmet, express-rate-limit, CORS, CSRF tokens, sanitize-html |
| **Data** | [@aryanjsx/knowindia](https://www.npmjs.com/package/@aryanjsx/knowindia), [@aryanjsx/indiamap](https://www.npmjs.com/package/@aryanjsx/indiamap) |
| **PWA** | Service Worker, Web App Manifest |

---

## Quick Start

### Prerequisites

- Node.js 22+
- MySQL 8+ (or a TiDB Cloud instance)
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))

### Installation

```bash
git clone https://github.com/aryanjsx/knowIndia_Final.git
cd knowIndia_Final

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

Create `backend/.env`:

```env
# Database
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_DATABASE=knowindia

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Auth
JWT_SECRET=your-strong-secret-min-32-chars
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Run Locally

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
knowIndia_Final/
├── frontend/                    # React application
│   ├── public/                  # Static assets, PWA manifest, service worker
│   └── src/
│       ├── Assets/              # Images (logo, home slideshow, Constitution PDF)
│       ├── components/          # Reusable UI components
│       │   ├── navbar.jsx       # Navigation bar with search, auth, theme toggle
│       │   ├── footer.jsx       # Site footer
│       │   ├── GlobalSearch.jsx # Searchbar (states, places, festivals)
│       │   ├── BookmarkButton.jsx
│       │   ├── ReviewCard.jsx
│       │   ├── MapTour.jsx      # Guided map tour (react-joyride)
│       │   ├── ThemeToggle.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── OfflineIndicator.jsx
│       │   └── maps/
│       │       └── State3DMap.jsx  # 3D district map (Three.js / R3F)
│       ├── pages/               # Route-level pages
│       │   ├── home.jsx         # Homepage
│       │   ├── IndiaMap.jsx     # Interactive India map
│       │   ├── StatePage.jsx    # State details
│       │   ├── PlacePage.jsx    # Place details
│       │   ├── FestivalsPage.jsx
│       │   ├── FestivalDetailPage.jsx
│       │   ├── Reviews.jsx      # Traveler reviews
│       │   ├── SavedPlaces.jsx  # Bookmarked places (protected)
│       │   ├── AboutUs.jsx
│       │   ├── ContactUs.jsx
│       │   ├── FeedbackPage.jsx
│       │   ├── ProfileAbout.jsx # User profile (protected)
│       │   ├── ProfileSettings.jsx
│       │   └── constitution/    # Constitution sub-pages
│       │       ├── PreamblePage.jsx
│       │       ├── ConstitutionOverview.jsx
│       │       ├── ConstitutionalInitiation.jsx
│       │       ├── AmendmentsPage.jsx
│       │       └── KeyFeaturesPage.jsx
│       ├── context/             # React context providers
│       │   ├── AuthContext.jsx  # Auth state, login/logout, CSRF
│       │   └── ThemeContext.jsx # Dark/light theme
│       ├── hooks/               # Custom hooks
│       │   └── useGoogleLogin.js
│       ├── lib/                 # Data adapters
│       │   └── knowIndia.js     # Wrapper for @aryanjsx/knowindia
│       ├── utils/               # Utilities
│       │   ├── feedbackSync.js  # Offline feedback queue
│       │   ├── bookmarks.js     # Bookmark helpers
│       │   ├── jwt.js           # Token decode/expiry
│       │   └── seo.js           # Meta tag helpers
│       └── config.js            # API base URL config
│
├── backend/                     # Express API server
│   ├── routes/
│   │   ├── auth.routes.js       # Google OAuth, logout, status, CSRF
│   │   ├── posts.routes.js      # Travel posts CRUD + voting
│   │   ├── profilePosts.routes.js
│   │   ├── profileSettings.routes.js
│   │   └── savedPlaces.routes.js
│   ├── controllers/             # Route handlers
│   ├── middleware/
│   │   └── auth.middleware.js   # authRequired, authOptional, CSRF
│   ├── config/
│   │   ├── passport.js          # Google OAuth strategy
│   │   └── multer.js            # Avatar upload config
│   ├── utils/                   # DB pool, JWT helpers, sanitization
│   └── server.js                # App entry point
│
├── .github/workflows/ci.yml    # CI pipeline (lint, test, build)
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/google` | — | Start Google OAuth flow |
| GET | `/auth/google/callback` | — | OAuth callback |
| GET | `/auth/status` | — | Check auth status |
| GET | `/auth/me` | Required | Current user info |
| POST | `/auth/logout` | Required | Logout (blacklists token) |
| GET | `/auth/csrf-token` | — | Get CSRF token |

### Places & States

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/state/:stateName` | All places in a state |
| GET | `/api/state/:stateName/place/:placeId` | Single place by ID |

### Festivals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/festivals` | All festivals (supports `?search=` and `?month=`) |
| GET | `/api/festivals/:id` | Festival by ID |

### Reviews & Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | — | All approved travel posts |
| GET | `/api/posts/:id` | — | Single post |
| POST | `/api/posts` | Required | Create a post |
| POST | `/api/posts/:id/vote` | Required | Upvote/downvote |
| DELETE | `/api/posts/:id` | Required | Delete own post |

### Saved Places

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/saved-places` | Required | List saved places |
| GET | `/api/saved-places/check/:placeId` | Required | Check if saved |
| POST | `/api/saved-places` | Required | Save a place |
| DELETE | `/api/saved-places/:placeId` | Required | Remove a saved place |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile/settings` | Required | Get profile |
| PUT | `/api/profile/settings` | Required | Update name/avatar |

### Feedback

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/feedback` | Required | Submit feedback |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## Security

| Category | Implementation |
|----------|----------------|
| **HTTP Headers** | Helmet.js — CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Rate Limiting** | 200 requests/15 min (API), 10 attempts/15 min (auth) |
| **Authentication** | JWT with HttpOnly cookies, 1-day expiry, HS256, token blacklisting |
| **Authorization** | Ownership checks on user content, IDOR protection via JWT user ID |
| **Database** | Connection pooling, SSL in production, parameterized queries |
| **Input Validation** | Server-side validation on all endpoints, string length limits |
| **File Uploads** | MIME type + extension validation, SVG blocked, path traversal prevention |
| **Error Handling** | Sanitized error responses in production — no internals leaked |
| **CSRF** | Token-based protection on state-changing requests |

See [SECURITY.md](SECURITY.md) for the full security policy.

---

## Development

### Linting & Tests

```bash
# Run ESLint
cd frontend && npm run lint

# Auto-fix lint issues
cd frontend && npm run lint:fix

# Run tests
cd frontend && npm test
```

### CI/CD

GitHub Actions runs on every push and PR to `main` / `develop`:

| Check | What it does |
|-------|-------------|
| **ESLint** | Catches unused imports/variables as errors |
| **Tests** | Runs smoke tests for critical pages |
| **Build** | Verifies production build succeeds |
| **Syntax** | Validates backend JavaScript |

### Deployment

| Service | What it deploys |
|---------|----------------|
| **Vercel (Frontend)** | React SPA — auto-deploys from `main`, configured via `frontend/vercel.json` |
| **Vercel (Backend)** | Express serverless functions — `server.js` runs on Node 24.x via `backend/vercel.json` |

### PWA Caching Strategy

| Resource | Strategy | Detail |
|----------|----------|--------|
| Static assets (HTML, CSS, JS) | Pre-cache | Cached on service worker install |
| Images | Cache-first | Served from cache, fetched if missing |
| API responses | Network-first | Fresh data preferred, cache as fallback |
| Navigation | Network-first | Offline page shown if unavailable |

---

## Related Projects

| Project | Description |
|---------|-------------|
| [Know India Dashboard](https://github.com/aryanjsx/KnowIndia_Dash) | Admin platform for managing places, festivals, feedback, and users — [live](https://knowindiadash.aryankr.in) |
| [@aryanjsx/knowindia](https://www.npmjs.com/package/@aryanjsx/knowindia) | NPM package with curated Indian destination data |
| [@aryanjsx/indiamap](https://www.npmjs.com/package/@aryanjsx/indiamap) | Interactive India map React component |

---

## Roadmap

- [x] Interactive India map with all states and UTs
- [x] State zoom animation on map click
- [x] 3D district-level political maps for every state and UT
- [x] Festivals with search, filters, and detail pages
- [x] Traveler reviews with ratings, photos, and voting
- [x] Constitution section (preamble, amendments, key features)
- [x] PWA with offline support
- [x] Global search across places and festivals
- [ ] Multi-language support

---

## Contributing

Contributions are welcome at all skill levels.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Run lint before committing: `cd frontend && npm run lint`
4. Commit your changes: `git commit -m 'Add your feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

CI will fail if there are unused imports or linting errors. See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

  **If this project helped you, consider giving it a star.**

  [![GitHub stars](https://img.shields.io/github/stars/aryanjsx/knowIndia_Final?style=social)](https://github.com/aryanjsx/knowIndia_Final)

</div>
