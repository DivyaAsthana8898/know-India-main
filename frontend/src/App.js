import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import OfflineIndicator from "./components/OfflineIndicator.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { syncPendingFeedback, hasPendingFeedback } from "./utils/feedbackSync.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Loader2 } from "lucide-react";

// PERFORMANCE: Lazy load route components for code splitting
// Critical paths (Home, Auth) load immediately, others are lazy loaded
import Home from "./pages/home.jsx";
import AuthSuccess from "./pages/AuthSuccess.jsx";
import AuthFailure from "./pages/AuthFailure.jsx";

// Lazy loaded pages - deferred until needed
const IndiaMapPage = lazy(() => import("./pages/IndiaMap.jsx"));
const StatePage = lazy(() => import("./pages/StatePage.jsx"));
const PlacePage = lazy(() => import("./pages/PlacePage.jsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));
const ContactUs = lazy(() => import("./pages/ContactUs.jsx"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage.jsx"));
const Constitution = lazy(() => import("./pages/constitution.jsx"));
const SavedPlaces = lazy(() => import("./pages/SavedPlaces.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const ProfileAbout = lazy(() => import("./pages/ProfileAbout.jsx"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings.jsx"));
const Reviews = lazy(() => import("./pages/Reviews.jsx"));
const FestivalsPage = lazy(() => import("./pages/FestivalsPage.jsx"));
const FestivalDetailPage = lazy(() => import("./pages/FestivalDetailPage.jsx"));

// Lazy load constitution sub-pages
const PreamblePage = lazy(() => import("./pages/constitution/PreamblePage.jsx"));
const ConstitutionOverview = lazy(() => import("./pages/constitution/ConstitutionOverview.jsx"));
const ConstitutionalInitiation = lazy(() => import("./pages/constitution/ConstitutionalInitiation.jsx"));
const AmendmentsPage = lazy(() => import("./pages/constitution/AmendmentsPage.jsx"));
const KeyFeaturesPage = lazy(() => import("./pages/constitution/KeyFeaturesPage.jsx"));

/**
 * Loading fallback component for Suspense
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center">
      <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// ScrollToTop component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component to handle feedback sync on app startup
function FeedbackSyncHandler() {
  useEffect(() => {
    // Check if there's any pending feedback to sync
    const checkForPendingFeedback = async () => {
      if (hasPendingFeedback()) {
        console.log("Found pending feedback, attempting to sync...");
        try {
          const result = await syncPendingFeedback();
          if (result.success) {
            console.log(`Successfully synced ${result.synced} feedback items`);
            if (result.failed > 0) {
              console.warn(`Failed to sync ${result.failed} feedback items`);
            }
          } else {
            console.error("Failed to sync feedback:", result.errors);
          }
        } catch (error) {
          console.error("Error syncing feedback:", error);
        }
      }
    };

    // Wait a bit for the app to initialize before checking
    const syncTimer = setTimeout(() => {
      checkForPendingFeedback();
    }, 5000); // 5 second delay to avoid interfering with initial app load

    // Set up periodic checks for syncing feedback
    const periodicSyncTimer = setInterval(() => {
      checkForPendingFeedback();
    }, 60000); // Check every minute

    return () => {
      clearTimeout(syncTimer);
      clearInterval(periodicSyncTimer);
    };
  }, []);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
        <ScrollToTop />
        <FeedbackSyncHandler />
        {/* UX: Show offline indicator when connection is lost */}
        <OfflineIndicator />
        <div className="flex flex-col min-h-screen dark:bg-gray-900 transition-colors duration-300">
          {/* Navbar */}
          <Navbar />

          {/* Page Content - wrapped in Suspense for lazy loading */}
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/places" element={<IndiaMapPage />} />
                <Route path="/places/:stateName" element={<StatePage />} />
                <Route path="/places/:stateName/:placeId" element={<PlacePage />} />
                <Route path="/constitution" element={<Constitution />} />
                <Route path="/constitution/preamble" element={<PreamblePage />} />
                <Route path="/constitution/overview" element={<ConstitutionOverview />} />
                <Route path="/constitution/initiation" element={<ConstitutionalInitiation />} />
                <Route path="/constitution/amendments" element={<AmendmentsPage />} />
                <Route path="/constitution/features" element={<KeyFeaturesPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/festivals" element={<FestivalsPage />} />
                <Route path="/festivals/:id" element={<FestivalDetailPage />} />
                {/* SECURITY: Protected route - requires authentication */}
                <Route path="/saved" element={
                  <ProtectedRoute>
                    <SavedPlaces />
                  </ProtectedRoute>
                } />
                {/* Auth Routes - not lazy loaded for fast auth flow */}
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/auth/failure" element={<AuthFailure />} />
                {/* Reviews Route - public but voting requires auth */}
                <Route path="/reviews" element={<Reviews />} />
                
                {/* SECURITY: Profile Routes - require authentication */}
                <Route path="/profile/shareExperience" element={
                  <ProtectedRoute>
                    <ProfileAbout />
                  </ProtectedRoute>
                } />
                <Route path="/profile/settings" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </Suspense>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
