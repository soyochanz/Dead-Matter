import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Shield, Lock, Cpu, Activity, X, Menu } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const AdminPanel = () => {
  const { session, profile, authLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const redirected = useRef(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (authLoaded && profile?.role === 'admin' && !redirected.current) {
      const lastRoute = localStorage.getItem('admin_last_route');
      if (lastRoute && lastRoute !== '/tutucucu') {
        redirected.current = true;
        navigate(lastRoute, { replace: true });
      }
    }
  }, [authLoaded, profile, navigate]);

  // Loading State
  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Technical Background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="text-center z-10">
          <Loader2 className="h-10 w-10 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Initializing Admin Secure Link...</p>
        </div>
      </div>
    );
  }

  // Unify login: Redirect to main login page if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role
  if (profile?.role !== 'admin') {
    toast({
      variant: 'destructive',
      title: 'Access Denied',
      description: 'You do not have permission to access this page.',
    });

    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Technical Background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="max-w-md w-full p-8 border border-red-500/20 bg-[#0a0a0c] rounded-2xl relative z-10 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400 mb-8">This frequency is encrypted. Clearance level inadequate for access.</p>

          <Button
            onClick={() => navigate('/')}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Simple Error Boundary
  class AdminErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error("AdminDashboard Crash:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-8 text-center text-red-500 bg-[#0a0a0c] min-h-[50vh] flex flex-col items-center justify-center border border-red-900/50 rounded-xl m-4">
            <Shield className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Dashboard Malfunction</h2>
            <p className="text-gray-400 mb-4 max-w-md">
              The secure link has encountered a critical error.
            </p>
            <pre className="text-xs bg-black/50 p-4 rounded border border-white/10 text-left overflow-auto max-w-full mb-4">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Re-initialize Secure Link
            </button>
          </div>
        );
      }

      return this.props.children;
    }
  }

  return (
    <>
      <Helmet>
        <title>Dead Matter Wiki - Admin Panel</title>
        <meta name="description" content="Admin panel for managing Dead Matter Wiki content" />
      </Helmet>

      {/* Modern Admin Layout Wrapper */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950">
        {/* Header Bar - Fixed */}
        <div className="sticky top-0 z-50 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur opacity-20 rounded-lg"></div>
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-lg p-2">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-400">v1.0 • Secure Mode</p>
                </div>
              </div>

              {/* Center - User Info */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{profile?.username || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-full">
                  <Lock className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-gray-300">Admin</span>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{profile?.username || 'Admin'}</span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Gradient Accent Line */}
          <div className="h-[2px] bg-gradient-to-r from-red-600 via-orange-600 to-red-600"></div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sm:hidden absolute top-full left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-white/10"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-600/20">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Admin Panel</p>
                    <p className="text-xs text-gray-400">Full access enabled</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem('admin_last_route');
                    toast({
                      title: 'Route History Cleared',
                      description: 'Navigation history has been reset.',
                    });
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Clear Navigation History
                </button>

                <button
                  onClick={() => {
                    navigate('/');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="relative min-h-[calc(100vh-70px)]">
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(180deg,#fff_1px,transparent_1px)] bg-[size:60px_60px]"></div>
            </div>

            {/* Floating Accent Gradients */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/3 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl"></div>
          </div>

          {/* Content Container - Full Width */}
          <div className="relative z-10">
            <AdminErrorBoundary>
              <AdminDashboard />
            </AdminErrorBoundary>
          </div>
        </div>

        {/* Floating Clear History Button (Desktop) */}
        <div className="fixed bottom-6 right-6 z-30 hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem('admin_last_route');
              toast({
                title: 'Route History Cleared',
                description: 'Navigation history has been reset.',
                duration: 3000,
              });
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-white/10 rounded-lg text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 shadow-lg"
          >
            Clear History
          </motion.button>
        </div>

        {/* Connection Status Indicator (Minimal) */}
        <div className="fixed bottom-4 left-4 z-30">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 hidden sm:inline">Secure</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
