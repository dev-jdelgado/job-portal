import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminFooter from './components/AdminFooter';
import AdminPrivacyPolicy from "./pages/AdminPrivacyPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Navigate } from 'react-router-dom';
import AdminCreateUser from './pages/AdminCreateUser';
import JobDetails from './pages/JobDetails'
import JobApplicantsPage from "./pages/JobApplicantsPage";
import ApplyPage from './pages/ApplyPage';
import ProfilePage from './pages/ProfilePage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import AccountSettingsPage from './pages/AccountSettingsPage'; 
import EmailVerificationHandler from './pages/EmailVerificationHandler'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import SeekerMessagingPage from './pages/SeekerMessagingPage';
import AdminMessagingPage from './pages/AdminMessagingPage';

// HomeRedirect component
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role}-dashboard`} replace />;
}

// Wrapper component for App that uses hooks
function AppRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {!hideNavbar && <Navbar />}

      <div style={{ flex: '1' }}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<EmailVerificationHandler />} />

          <Route
            path="/seeker-dashboard"
            element={
              <PrivateRoute allowedRoles={['seeker']}>
                <SeekerDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/apply/:id" element={<ApplyPage />} />

          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/create-user"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminCreateUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/job/:jobId/applicants"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <JobApplicantsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['seeker']}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/job-applications"
            element={
              <PrivateRoute allowedRoles={['seeker']}>
                <JobApplicationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <PrivateRoute allowedRoles={['seeker', 'admin']}>
                <AccountSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/messaging"
            element={
              <PrivateRoute allowedRoles={['seeker']}>
                <SeekerMessagingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/messaging"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminMessagingPage />
              </PrivateRoute>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/admin/privacy-policy"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminPrivacyPolicy />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {/* ✅ Footer shows only for seekers */}
      {!hideNavbar && user?.role === 'seeker' && <Footer />}
      {!hideNavbar && user?.role === 'admin' && <AdminFooter />}
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;