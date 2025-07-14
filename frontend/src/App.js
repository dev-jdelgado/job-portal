import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Navigate } from 'react-router-dom';
import AdminCreateUser from './pages/AdminCreateUser';
import JobDetails from './pages/JobDetails'
import JobApplicantsPage from "./pages/JobApplicantsPage";
import ApplyPage from './pages/ApplyPage';
import ProfilePage from './pages/ProfilePage';


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
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/seeker-dashboard" element={
          <PrivateRoute allowedRoles={['seeker']}>
            <SeekerDashboard />
          </PrivateRoute>
        } />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/apply/:id" element={<ApplyPage />} />

        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin/create-user" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminCreateUser />
          </PrivateRoute>
          } />

        <Route path="/admin/job/:jobId/applicants" element={<JobApplicantsPage />} />
        
        <Route path="/profile" element={
          <PrivateRoute allowedRoles={['seeker']}>
            <ProfilePage />
          </PrivateRoute>
          } />

      </Routes>
    </>
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