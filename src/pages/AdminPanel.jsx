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

  // Loading State with Modern Design
  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(180deg,#fff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Loading Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center w-full max-w-md px-4"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-3xl opacity-20 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-red-400 animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400">
              Initializing secure administration interface...
            </p>
            
            {/* Loading Indicators */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="h-4 w-4 animate-pulse text-green-500" />
                <span>Authentication</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 animate-pulse text-yellow-500" />
                <span>Permissions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4 animate-pulse text-blue-500" />
                <span>Security</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Border */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 border-t-2 border-red-500/20 rounded-full"
        />
      </div>
    );
  }

  // Unify login: Redirect to main login page if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role - Modern Access Denied
  if (profile?.role !== 'admin') {
    toast({
      variant: 'destructive',
      title: 'Access Denied',
      description: 'You do not have permission to access this page.',
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center w-full max-w-md px-4"
        >
          {/* Access Denied Card */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 blur-2xl opacity-30 rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30 rounded-2xl p-8 md:p-10 backdrop-blur-sm">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-full w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center">
                  <Lock className="h-10 w-10 md:h-12 md:w-12 text-red-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full border-4 border-gray-900"></div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-full border-4 border-gray-900"></div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Access Denied
              </h2>
              <p className="text-gray-400 mb-6 text-sm md:text-base">
                Administrative privileges are required to access this panel.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="w-full py-3 px-6 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-white/10 rounded-xl text-white font-semibold transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Return to Home
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>
          
          {/* Security Info */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-white/10 rounded-full">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Access logged for security review</span>
          </div>
        </motion.div>
      </div>
    );
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
            <AdminDashboard />
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
