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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col">
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