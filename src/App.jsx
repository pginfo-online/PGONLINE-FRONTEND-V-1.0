import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Auth
import Login from './screens/auth/Login';

// Admin
import AdminDashboard from './screens/admin/Dashboard';
import PGApprovals from './screens/admin/PGApprovals';
import UserManagement from './screens/admin/UserManagement';
import Analytics from './screens/admin/Analytics';
import AppVersionManagement from './screens/admin/AppVersionManagement';

// Owner
import OwnerDashboard from './screens/owner/Dashboard';
import MyListings from './screens/owner/MyListings';
import AddPG from './screens/owner/AddPG';
import EditPG from './screens/owner/EditPG';
import Leads from './screens/owner/Leads';
import Visits from './screens/owner/Visits';

// New features
import PGUpdateRequests from './screens/admin/PGUpdateRequests';
import MeetupManagement from './screens/admin/MeetupManagement';
import Meetups from './screens/owner/Meetups';
import CreateEditMeetup from './screens/owner/CreateEditMeetup';

// Public Landing Screens
import LandingPage from './screens/landing/LandingPage';
import Careers from './screens/landing/Careers';
import Resources from './screens/landing/Resources';
import HelpCenter from './screens/landing/HelpCenter';
import Terms from './screens/landing/Terms';
import Privacy from './screens/landing/Privacy';
import FeaturesPage from './screens/landing/FeaturesPage';
import AboutPage from './screens/landing/AboutPage';
import ServicesPage from './screens/landing/ServicesPage';
import WhyChooseUsPage from './screens/landing/WhyChooseUsPage';
import ConnectPage from './screens/landing/ConnectPage';
import ContactPage from './screens/landing/ContactPage';


function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: 10, fontSize: '0.875rem', padding: '12px 16px' },
          success: { iconTheme: { primary: '#10b981' } },
          error: { iconTheme: { primary: '#ef4444' } },
        }}
      />
      <Routes>
        <Route path="/login" element={
          isAuthenticated
            ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard'} replace />
            : <Login />
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/approvals" element={<PrivateRoute allowedRoles={['admin']}><PGApprovals /></PrivateRoute>} />
        <Route path="/admin/pg-updates" element={<PrivateRoute allowedRoles={['admin']}><PGUpdateRequests /></PrivateRoute>} />
        <Route path="/admin/meetups" element={<PrivateRoute allowedRoles={['admin']}><MeetupManagement /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['admin']}><Analytics /></PrivateRoute>} />
        <Route path="/admin/app-versions" element={<PrivateRoute allowedRoles={['admin']}><AppVersionManagement /></PrivateRoute>} />


        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={<PrivateRoute allowedRoles={['owner']}><OwnerDashboard /></PrivateRoute>} />
        <Route path="/owner/listings" element={<PrivateRoute allowedRoles={['owner']}><MyListings /></PrivateRoute>} />
        <Route path="/owner/listings/add" element={<PrivateRoute allowedRoles={['owner']}><AddPG /></PrivateRoute>} />
        <Route path="/owner/listings/:id/edit" element={<PrivateRoute allowedRoles={['owner']}><EditPG /></PrivateRoute>} />
        <Route path="/owner/leads" element={<PrivateRoute allowedRoles={['owner']}><Leads /></PrivateRoute>} />
        <Route path="/owner/visits" element={<PrivateRoute allowedRoles={['owner']}><Visits /></PrivateRoute>} />
        <Route path="/owner/meetups" element={<PrivateRoute allowedRoles={['owner']}><Meetups /></PrivateRoute>} />
        <Route path="/owner/meetups/create" element={<PrivateRoute allowedRoles={['owner']}><CreateEditMeetup /></PrivateRoute>} />
        <Route path="/owner/meetups/:id/edit" element={<PrivateRoute allowedRoles={['owner']}><CreateEditMeetup /></PrivateRoute>} />


        {/* Public Landing Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/why-us" element={<WhyChooseUsPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
