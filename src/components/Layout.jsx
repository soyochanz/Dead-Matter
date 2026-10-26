import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import UserNav from '@/components/UserNav';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const { authLoaded } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [location.pathname]);

  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col selection:bg-red-500/30 text-slate-200">
      <Helmet>
        <html lang={i18n.language} />
        <meta name="description" content={t('meta.description')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://deadmatterwiki.com${location.pathname}`} />
        <meta property="og:title" content="Dead Matter Wiki | Map, Database & Survival Guides" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/783fa02e-1caf-48c3-baf6-d554d2d507fa/dead_matter_og_image.jpg" />
        <meta property="og:site_name" content="Dead Matter Wiki" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://deadmatterwiki.com${location.pathname}`} />
        <meta property="twitter:title" content="Dead Matter Wiki | Map, Database & Survival Guides" />
        <meta property="twitter:description" content={t('meta.description')} />
        <meta property="twitter:image" content="https://horizons-cdn.hostinger.com/783fa02e-1caf-48c3-baf6-d554d2d507fa/dead_matter_og_image.jpg" />
        <meta property="og:locale" content={i18n.language} />
        <link rel="canonical" href={`https://deadmatterwiki.com${location.pathname}`} />
      </Helmet>

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,30,45,0.4),transparent)] pointer-events-none" />

      {/* Top Right Controls */}
      {authLoaded && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <LanguageSelector />
          <UserNav />
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Adjusted margin to ml-80 (20rem/320px) to match the w-80 sidebar width */}
      <div className={`min-w-0 flex-grow flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <main className={`flex-grow p-4 md:p-8 pt-24 md:pt-24 ${isMapPage ? 'flex flex-col' : 'min-h-[calc(100vh-80px)]'}`}>
          {children || <Outlet />}
        </main>
        {!isMapPage && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
