import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { register as registerSW } from './utils/serviceWorker';
import performanceMonitor from './utils/performanceMonitor';
import './styles/reset.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const UniversityDetailPage = lazy(() => import('./pages/UniversityDetailPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const SmartRecommendationsPage = lazy(() => import('./pages/SmartRecommendationsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

function AppContent() {
  React.useEffect(() => {
    // Mark app initialization
    performanceMonitor.mark('app-init');

    // Service worker disabled for development to avoid caching issues
    // registerSW({
    //   onSuccess: (registration) => {
    //     console.log('App is ready for offline use');
    //     performanceMonitor.mark('sw-ready');
    //   },
    //   onUpdate: (registration) => {
    //     console.log('New app version available');
    //     // You could show a notification to the user here
    //   }
    // });

    // Preload critical routes
    const criticalRoutes = ['/search', '/login'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    performanceMonitor.mark('app-ready');
  }, []);

  return (
    <ErrorBoundary name="App">
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Suspense fallback={
            <LoadingSpinner
              size="large"
              message="Loading page..."
              overlay={false}
            />
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/universities/:id" element={<UniversityDetailPage />} />
              <Route path="/compare" element={
                <ProtectedRoute>
                  <ComparisonPage />
                </ProtectedRoute>
              } />

              {/* AI Recommendations - Available to everyone */}
              <Route
                path="/recommendations"
                element={<SmartRecommendationsPage />}
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <BookmarksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preferences"
                element={
                  <ProtectedRoute>
                    <PreferencesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={<HelpPage />}
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;