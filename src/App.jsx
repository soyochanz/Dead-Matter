// src/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Layout from '@/components/Layout';

// Lazy load de páginas
// Regular imports for main entry points to avoid chunk loading issues on initial load
import Home from '@/pages/Home';
import Wiki from '@/pages/Wiki';
import { lazyImport } from '@/utils/lazyImport';

// Lazy load de páginas secundarias
const WeaponsPage = lazyImport(() => import('@/pages/WeaponsPage'));

const ConsumablesPage = lazyImport(() => import('@/pages/ConsumablesPage'));
const GearPage = lazyImport(() => import('@/pages/GearPage'));
const ToolbeltsPage = lazyImport(() => import('@/pages/ToolbeltsPage'));
const KeysPage = lazyImport(() => import('@/pages/KeysPage'));
const VehiclesPage = lazyImport(() => import('@/pages/VehiclesPage'));
const AccessoriesPage = lazyImport(() => import('@/pages/AccessoriesPage'));
const WikiCategoryPage = lazyImport(() => import('@/pages/WikiCategoryPage'));
const MedsPage = lazyImport(() => import('@/pages/MedsPage'));
const PerksPage = lazyImport(() => import('@/pages/PerksPage'));
const NpcsPage = lazyImport(() => import('@/pages/NpcsPage'));
const Updates = lazyImport(() => import('@/pages/Updates'));
const UpdateDetailPage = lazyImport(() => import('@/pages/UpdateDetailPage'));
const Map = lazyImport(() => import('@/pages/Map'));
const Media = lazyImport(() => import('@/pages/Media'));
const AdminPanel = lazyImport(() => import('@/pages/AdminPanel'));
const BasebuildingPage = lazyImport(() => import('@/pages/BasebuildingPage'));
const GuidesPage = lazyImport(() => import('@/pages/GuidesPage'));
const GuideDetailPage = lazyImport(() => import('@/pages/GuideDetailPage'));
const CreateGuidePage = lazyImport(() => import('@/pages/CreateGuidePage'));
const RegisterPage = lazyImport(() => import('@/pages/RegisterPage'));
const LoginPage = lazyImport(() => import('@/pages/LoginPage'));
const EditProfilePage = lazyImport(() => import('@/pages/EditProfilePage'));

// Componente de carga
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 animate-pulse">Cargando...</p>
    </div>
  </div>
);

// Layout principal
const MainLayout = () => {
  const { loading, authLoaded } = useAuth();

  if (loading && !authLoaded) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Dead Matter Wiki</title>
        <meta name="description" content="Your ultimate resource for Dead Matter, offering the latest updates, detailed wiki, survival guides, and expert tips to help you thrive." />
      </Helmet>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

// Ruta de admin mejorada
const AdminRoute = () => {
  const { user, isAdmin, loading, authLoaded, profile } = useAuth();
  const location = useLocation();

  if (loading || !authLoaded) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // DEBUG: Mostrar información del perfil
  console.log('Admin Route Check:', {
    email: user?.email,
    hasProfile: !!profile,
    profileRole: profile?.role,
    isAdmin,
    location: location.pathname
  });

  if (!isAdmin) {
    console.warn('Access denied to admin panel. User role:', profile?.role);
    return <Navigate to="/" replace />;
  }

  console.log('Granting admin access to:', user.email);

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <AdminPanel />
      </Suspense>
    </Layout>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading, authLoaded } = useAuth();
  const location = useLocation();

  if (loading || !authLoaded) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading, authLoaded } = useAuth();

  if (loading || !authLoaded) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Routes>
        {/* Ruta de admin */}
        <Route path="/tutucucu" element={<AdminRoute />} />

        {/* Rutas principales */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="wiki" element={<Wiki />} />


          {/* Individual Category Pages */}
          <Route path="wiki/weapons" element={<WeaponsPage />} />
          <Route path="wiki/consumables" element={<ConsumablesPage />} />
          <Route path="wiki/gear" element={<GearPage />} />
          <Route path="wiki/toolbelts" element={<ToolbeltsPage />} />
          <Route path="wiki/keys" element={<KeysPage />} />
          <Route path="wiki/vehicles" element={<VehiclesPage />} />
          <Route path="wiki/accessories" element={<AccessoriesPage />} />


          {/* Specialized Pages */}
          <Route path="wiki/meds" element={<MedsPage />} />
          <Route path="wiki/perks" element={<PerksPage />} />
          <Route path="wiki/npcs" element={<NpcsPage />} />
          <Route path="wiki/basebuilding" element={<BasebuildingPage />} />

          {/* Fallback for any other dynamic categories */}
          <Route path="wiki/:categoryName" element={<WikiCategoryPage />} />

          <Route path="updates" element={<Updates />} />
          <Route path="updates/:slug" element={<UpdateDetailPage />} />

          {/* Map page - IMPORTANTE que cargue */}
          <Route path="map" element={<Map />} />

          <Route path="media" element={<Media />} />
          <Route path="guides" element={<GuidesPage />} />

          <Route path="guides/create" element={
            <PrivateRoute>
              <CreateGuidePage />
            </PrivateRoute>
          } />

          <Route path="guides/:slug" element={<GuideDetailPage />} />

          <Route path="register" element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          } />

          <Route path="login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />

          <Route path="profile/edit" element={

            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          } />


          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="text-center py-20 px-4">
              <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Página no encontrada</p>
              <a
                href="/"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                Volver al inicio
              </a>
            </div>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
