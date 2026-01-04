import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import UserNav from '@/components/UserNav';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { authLoaded } = useAuth();
  const location = useLocation();

  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,0.5),transparent)] pointer-events-none" />
      {authLoaded && (
        <div className="fixed top-4 right-4 z-50">
          <UserNav />
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Adjusted margin to ml-80 (20rem/320px) to match the w-80 sidebar width */}
      <div className={`flex-grow flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <main className={`flex-grow p-8 pt-24 ${isMapPage ? 'flex flex-col' : 'min-h-[calc(100vh-80px)]'}`}>
          {children || <Outlet />}
        </main>
        {!isMapPage && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
