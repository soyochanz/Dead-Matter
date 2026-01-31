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

      <AdminErrorBoundary>
        <AdminDashboard />
      </AdminErrorBoundary>
    </>
  );
};

export default AdminPanel;
