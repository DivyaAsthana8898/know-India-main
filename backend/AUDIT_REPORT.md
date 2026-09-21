# Backend Code Audit Report
**Date:** January 29, 2026  
**Audited Directory:** `C:\Users\LENOVO\Documents\GitHub\knowIndia_Final\backend`

## Executive Summary

This audit identified **unused code** across middleware, utilities, services, and dependencies. All routes, controllers, and config files are properly registered and used.

---

## 1. Routes Audit ✅

**Status:** All routes are properly registered in `server.js`

| Route File | Registered Path | Status |
|------------|----------------|--------|
| `routes/auth.routes.js` | `/auth` | ✅ Used |
| `routes/posts.routes.js` | `/api/posts` | ✅ Used |
| `routes/profilePosts.routes.js` | `/api/profile/posts` | ✅ Used |
| `routes/profileSettings.routes.js` | `/api/profile/settings` | ✅ Used |
| `routes/savedPlaces.routes.js` | `/api/saved-places` | ✅ Used |

**Finding:** No unused routes found.

---

## 2. Controllers Audit ✅

**Status:** All controller functions are mapped to routes

### `controllers/profilePosts.controller.js`
- ✅ `createPost` → `POST /api/profile/posts`
- ✅ `getAllPosts` → `GET /api/profile/posts`
- ✅ `getMyPosts` → `GET /api/profile/posts/me`
- ✅ `getPostById` → `GET /api/profile/posts/:id`
- ✅ `updatePost` → `PUT /api/profile/posts/:id`
- ✅ `voteOnPost` → `POST /api/profile/posts/:id/vote`
- ✅ `getUserVote` → `GET /api/profile/posts/:id/vote`
- ✅ `deletePost` → `DELETE /api/profile/posts/:id`
- ✅ `getPostStatusCounts` → `GET /api/profile/posts/status-check`

### `controllers/profileSettings.controller.js`
- ✅ `getProfile` → `GET /api/profile/settings`
- ✅ `updateProfile` → `PUT /api/profile/settings`

### `controllers/savedPlaces.controller.js`
- ✅ `getSavedPlaces` → `GET /api/saved-places`
- ✅ `addSavedPlace` → `POST /api/saved-places`
- ✅ `removeSavedPlace` → `DELETE /api/saved-places/:placeId`
- ✅ `clearSavedPlaces` → `DELETE /api/saved-places`
- ✅ `checkSavedPlace` → `GET /api/saved-places/check/:placeId`

**Finding:** No unused controller functions found.

---

## 3. Middleware Audit ⚠️

**File:** `middleware/auth.middleware.js`

| Function | Status | Usage |
|----------|--------|-------|
| `authRequired` | ✅ Used | Used in `server.js` (line 18), `profilePosts.routes.js`, `profileSettings.routes.js`, `savedPlaces.routes.js` |
| `authOptional` | ❌ **UNUSED** | Exported but never imported or used anywhere |
| `csrfProtection` | ❌ **UNUSED** | Exported but never imported or used anywhere |

**Recommendation:**
- **Safe to remove:** `authOptional` and `csrfProtection` if not planned for future use
- **Location:** `middleware/auth.middleware.js` lines 37-51 (`authOptional`) and lines 58-77 (`csrfProtection`)

---

## 4. Utils Audit ⚠️

### `utils/db.js` ✅
All functions are used:
- ✅ `connectToDatabase` - Used extensively throughout codebase
- ✅ `initUsersTable` - Called in `server.js` line 970
- ✅ `initPostsTable` - Called in `server.js` line 973
- ✅ `initProfilePostsTable` - Called in `server.js` line 976
- ✅ `initSavedPlacesTable` - Called in `server.js` line 979

### `utils/jwt.js` ⚠️

| Function/Export | Status | Usage |
|-----------------|--------|-------|
| `generateToken` | ✅ Used | Used in `auth.routes.js` |
| `verifyToken` | ✅ Used | Used in `auth.routes.js`, `posts.routes.js`, `auth.middleware.js` |
| `blacklistToken` | ✅ Used | Used in `auth.routes.js` |
| `setTokenCookie` | ✅ Used | Used in `auth.routes.js` |
| `clearTokenCookie` | ✅ Used | Used in `auth.routes.js` |
| `getTokenFromRequest` | ✅ Used | Used in `auth.routes.js`, `auth.middleware.js` |
| `getJwtSecret` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally within `jwt.js` (lines 68, 135) |
| `isTokenBlacklisted` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally within `jwt.js` (line 131) |
| `COOKIE_OPTIONS` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally within `jwt.js` (line 81) |

**Recommendation:**
- **Safe to remove from exports:** `getJwtSecret`, `isTokenBlacklisted`, `COOKIE_OPTIONS` if not needed by external code
- **Location:** `utils/jwt.js` lines 181-187

### `utils/sanitize.js` ⚠️

| Function | Status | Usage |
|----------|--------|-------|
| `sanitizeUserInput` | ✅ Used | Used in `profilePosts.controller.js`, `savedPlaces.controller.js` |
| `sanitizeText` | ✅ Used | Used in `profilePosts.controller.js`, `savedPlaces.controller.js` |
| `sanitizeUrl` | ✅ Used | Used in `profilePosts.controller.js`, `savedPlaces.controller.js` |
| `sanitizeContent` | ❌ **UNUSED** | Exported but never imported or used anywhere |
| `STRICT_OPTIONS` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally |
| `BASIC_OPTIONS` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally |

**Recommendation:**
- **Safe to remove:** `sanitizeContent` function (lines 57-68)
- **Safe to remove from exports:** `STRICT_OPTIONS` and `BASIC_OPTIONS` if not needed externally
- **Location:** `utils/sanitize.js` lines 57-68, 135-140

---

## 5. Services Audit ⚠️

**File:** `services/embeddingService.js`

| Function | Status | Usage |
|----------|--------|-------|
| `initializeIndex` | ⚠️ **PARTIALLY USED** | Called in `server.js` line 984 (initialization only) |
| `searchPlaces` | ❌ **UNUSED** | Exported but never called from any route or controller |
| `getPlacesByState` | ❌ **UNUSED** | Exported but never called from any route or controller |
| `isReady` | ❌ **UNUSED** | Exported but never called |
| `getStats` | ❌ **UNUSED** | Exported but never called |
| `generateEmbedding` | ⚠️ **EXPORTED BUT ONLY USED INTERNALLY** | Only used internally within `embeddingService.js` |

**Finding:** The embedding service is initialized but its search functionality is never actually used in any API endpoints.

**Recommendation:**
- **Review needed:** Determine if vector search functionality is intended for future use
- **If not needed:** Remove `searchPlaces`, `getPlacesByState`, `isReady`, `getStats` exports
- **If needed:** Create routes/controllers to expose these functions
- **Location:** `services/embeddingService.js` lines 336-432

---

## 6. Config Files Audit ✅

| File | Status | Usage |
|------|--------|-------|
| `config/passport.js` | ✅ Used | Required in `server.js` line 12, used by `auth.routes.js` |
| `config/multer.js` | ✅ Used | Used in `profileSettings.routes.js` line 3 |

**Finding:** All config files are properly used.

---

## 7. Dependencies Audit ⚠️

**File:** `package.json`

| Dependency | Status | Usage |
|------------|--------|-------|
| `express` | ✅ Used | Core framework |
| `cors` | ✅ Used | `server.js` line 2 |
| `helmet` | ✅ Used | `server.js` line 3 |
| `express-rate-limit` | ✅ Used | `server.js` line 4 |
| `cookie-parser` | ✅ Used | `server.js` line 5 |
| `mysql2` | ✅ Used | `server.js` line 6, `utils/db.js` |
| `dotenv` | ✅ Used | `server.js` line 9 |
| `passport` | ✅ Used | `config/passport.js`, `auth.routes.js` |
| `passport-google-oauth20` | ✅ Used | `config/passport.js` |
| `jsonwebtoken` | ✅ Used | `utils/jwt.js` |
| `multer` | ✅ Used | `config/multer.js` |
| `sanitize-html` | ✅ Used | `utils/sanitize.js` |
| `@aryanjsx/knowindia` | ✅ Used | `services/embeddingService.js` line 12 |
| `@xenova/transformers` | ✅ Used | `services/embeddingService.js` (optional) |
| `faiss-node` | ✅ Used | `services/embeddingService.js` (optional) |
| `axios` | ❌ **UNUSED** | Listed in `server.js` package status check but never imported |
| `pdfkit` | ❌ **UNUSED** | In dependencies but never imported or used |
| `uuid` | ❌ **UNUSED** | Listed in `server.js` package status check but never imported |

**Recommendation:**
- **Safe to remove:** `pdfkit` and `uuid` from `package.json` dependencies
- **Review:** `axios` - check if it's needed for future features
- **Location:** `package.json` lines 32 (`pdfkit`), and check for `uuid` (not found in dependencies list, but checked in server.js)

**Note:** `axios` appears in the package status check endpoint (`server.js` line 417) but is not in `package.json` dependencies. This suggests it was removed but the check remains.

---

## 8. Utility Scripts Audit ⚠️

| File | Status | Usage |
|------|--------|-------|
| `deploy-test.js` | ✅ Used | Called in `package.json` scripts (lines 9-11) |
| `generate_cert_base64.bat` | ⚠️ **MANUAL USE ONLY** | Utility script for generating certificate base64, not used by code |

**Recommendation:**
- **Keep:** `deploy-test.js` (used in build scripts)
- **Optional:** `generate_cert_base64.bat` can be kept for manual use or removed if certificate generation is automated

---

## Summary of Unused Code

### High Priority (Safe to Remove)

1. **Middleware:**
   - `authOptional` function in `middleware/auth.middleware.js` (lines 37-51)
   - `csrfProtection` function in `middleware/auth.middleware.js` (lines 58-77)

2. **Utils:**
   - `sanitizeContent` function in `utils/sanitize.js` (lines 57-68)

3. **Services:**
   - `searchPlaces` export in `services/embeddingService.js` (if not planned)
   - `getPlacesByState` export in `services/embeddingService.js` (if not planned)
   - `isReady` export in `services/embeddingService.js` (if not planned)
   - `getStats` export in `services/embeddingService.js` (if not planned)

4. **Dependencies:**
   - `pdfkit` from `package.json` (line 32)

### Medium Priority (Review Before Removing)

1. **Utils Exports (Internal Use Only):**
   - `getJwtSecret` export in `utils/jwt.js`
   - `isTokenBlacklisted` export in `utils/jwt.js`
   - `COOKIE_OPTIONS` export in `utils/jwt.js`
   - `STRICT_OPTIONS` export in `utils/sanitize.js`
   - `BASIC_OPTIONS` export in `utils/sanitize.js`
   - `generateEmbedding` export in `services/embeddingService.js`

2. **Services:**
   - Entire embedding service functionality if vector search is not needed

### Low Priority (Keep for Manual Use)

1. **Scripts:**
   - `generate_cert_base64.bat` - Keep if used manually for certificate generation

---

## Recommendations

1. **Immediate Actions:**
   - Remove unused middleware functions (`authOptional`, `csrfProtection`)
   - Remove unused utility function (`sanitizeContent`)
   - Remove unused dependency (`pdfkit`)

2. **Review Required:**
   - Determine if embedding service search functions are needed
   - Review if `axios` should be added as dependency or removed from status check
   - Decide if internal-only exports should remain exported

3. **Code Quality:**
   - Consider removing exports that are only used internally
   - Document why embedding service is initialized but not used
   - Add comments explaining future use of unused functions if keeping them

---

## Files Modified Summary

No files need modification based on this audit - this is a **read-only audit report**. All findings are recommendations for cleanup.

---

**Audit Completed:** January 29, 2026
