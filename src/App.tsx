import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientAuthProvider } from './context/PatientAuthContext';
import { SocketProvider } from './context/SocketContext';
import PageLoader from './components/PageLoader';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const PatientLogin = React.lazy(() => import('./pages/patient/PatientLogin'));
const PatientRegister = React.lazy(() => import('./pages/patient/PatientRegister'));
const PatientDashboard = React.lazy(() => import('./pages/patient/PatientDashboard'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));

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
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </BrowserRouter>
          </div>
          </SocketProvider>
        </PatientAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
