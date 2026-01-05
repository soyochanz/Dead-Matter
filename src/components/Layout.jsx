import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import UserNav from '@/components/UserNav';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { authLoaded } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-500/30">
      <Helmet>
        <html lang={i18n.language} />
        <meta name="description" content={t('meta.description')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:locale" content={i18n.language} />
      </Helmet>

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,0.5),transparent)] pointer-events-none" />

      {/* Top Right Controls */}
      {authLoaded && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <LanguageSelector />
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
