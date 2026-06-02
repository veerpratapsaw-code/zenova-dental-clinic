import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientAuthProvider } from './context/PatientAuthContext';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientLogin from './pages/patient/PatientLogin';
import PatientRegister from './pages/patient/PatientRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0a0a1a]">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PatientAuthProvider>
          <SocketProvider>
            <div className="relative overflow-x-hidden min-h-screen selection:bg-cyan-500 selection:text-white bg-[#f8fafc] dark:bg-[#0a0a1a] transition-colors duration-500">
            <BrowserRouter>
              <Routes>
                {/* Public Website */}
                <Route path="/" element={<Home />} />
                
                {/* Blog Section */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                
                {/* Patient Portal */}
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/register" element={<PatientRegister />} />
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
                
                {/* Admin Portal */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
          </SocketProvider>
        </PatientAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
