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

// Owner
import OwnerDashboard from './screens/owner/Dashboard';
import MyListings from './screens/owner/MyListings';
import AddPG from './screens/owner/AddPG';
import EditPG from './screens/owner/EditPG';
import Leads from './screens/owner/Leads';
import Visits from './screens/owner/Visits';

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
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
        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['admin']}><Analytics /></PrivateRoute>} />

        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={<PrivateRoute allowedRoles={['owner']}><OwnerDashboard /></PrivateRoute>} />
        <Route path="/owner/listings" element={<PrivateRoute allowedRoles={['owner']}><MyListings /></PrivateRoute>} />
        <Route path="/owner/listings/add" element={<PrivateRoute allowedRoles={['owner']}><AddPG /></PrivateRoute>} />
        <Route path="/owner/listings/:id/edit" element={<PrivateRoute allowedRoles={['owner']}><EditPG /></PrivateRoute>} />
        <Route path="/owner/leads" element={<PrivateRoute allowedRoles={['owner']}><Leads /></PrivateRoute>} />
        <Route path="/owner/visits" element={<PrivateRoute allowedRoles={['owner']}><Visits /></PrivateRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
