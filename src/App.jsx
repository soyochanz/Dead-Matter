// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Layout from '@/components/Layout';

// Lazy load de páginas
const Home = lazy(() => import('@/pages/Home'));
const Wiki = lazy(() => import('@/pages/Wiki'));
const WeaponsPage = lazy(() => import('@/pages/WeaponsPage'));
const ConsumablesPage = lazy(() => import('@/pages/ConsumablesPage'));
const GearPage = lazy(() => import('@/pages/GearPage'));
const ToolbeltsPage = lazy(() => import('@/pages/ToolbeltsPage'));
const KeysPage = lazy(() => import('@/pages/KeysPage'));
const VehiclesPage = lazy(() => import('@/pages/VehiclesPage'));
const AccessoriesPage = lazy(() => import('@/pages/AccessoriesPage'));
const WikiCategoryPage = lazy(() => import('@/pages/WikiCategoryPage'));
const MedsPage = lazy(() => import('@/pages/MedsPage'));
const PerksPage = lazy(() => import('@/pages/PerksPage'));
const NpcsPage = lazy(() => import('@/pages/NpcsPage'));
const Updates = lazy(() => import('@/pages/Updates'));
const UpdateDetailPage = lazy(() => import('@/pages/UpdateDetailPage'));
const Map = lazy(() => import('@/pages/Map'));
const Media = lazy(() => import('@/pages/Media'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const BasebuildingPage = lazy(() => import('@/pages/BasebuildingPage'));
const GuidesPage = lazy(() => import('@/pages/GuidesPage'));
const GuideDetailPage = lazy(() => import('@/pages/GuideDetailPage'));
const CreateGuidePage = lazy(() => import('@/pages/CreateGuidePage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'));

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
          <Route index path="/" element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          } />

          <Route path="wiki" element={
            <Suspense fallback={<PageLoader />}>
              <Wiki />
            </Suspense>
          } />

          {/* Individual Category Pages */}
          <Route path="wiki/weapons" element={
            <Suspense fallback={<PageLoader />}>
              <WeaponsPage />
            </Suspense>
          } />
          <Route path="wiki/consumables" element={
            <Suspense fallback={<PageLoader />}>
              <ConsumablesPage />
            </Suspense>
          } />
          <Route path="wiki/gear" element={
            <Suspense fallback={<PageLoader />}>
              <GearPage />
            </Suspense>
          } />
          <Route path="wiki/toolbelts" element={
            <Suspense fallback={<PageLoader />}>
              <ToolbeltsPage />
            </Suspense>
          } />
          <Route path="wiki/keys" element={
            <Suspense fallback={<PageLoader />}>
              <KeysPage />
            </Suspense>
          } />
          <Route path="wiki/vehicles" element={
            <Suspense fallback={<PageLoader />}>
              <VehiclesPage />
            </Suspense>
          } />
          <Route path="wiki/accessories" element={
            <Suspense fallback={<PageLoader />}>
              <AccessoriesPage />
            </Suspense>
          } />

          {/* Specialized Pages */}
          <Route path="wiki/meds" element={
            <Suspense fallback={<PageLoader />}>
              <MedsPage />
            </Suspense>
          } />
          <Route path="wiki/perks" element={
            <Suspense fallback={<PageLoader />}>
              <PerksPage />
            </Suspense>
          } />
          <Route path="wiki/npcs" element={
            <Suspense fallback={<PageLoader />}>
              <NpcsPage />
            </Suspense>
          } />
          <Route path="wiki/basebuilding" element={
            <Suspense fallback={<PageLoader />}>
              <BasebuildingPage />
            </Suspense>
          } />

          {/* Fallback for any other dynamic categories */}
          <Route path="wiki/:categoryName" element={
            <Suspense fallback={<PageLoader />}>
              <WikiCategoryPage />
            </Suspense>
          } />

          <Route path="updates" element={
            <Suspense fallback={<PageLoader />}>
              <Updates />
            </Suspense>
          } />
          <Route path="updates/:slug" element={
            <Suspense fallback={<PageLoader />}>
              <UpdateDetailPage />
            </Suspense>
          } />

          {/* Map page - IMPORTANTE que cargue */}
          <Route path="map" element={
            <Suspense fallback={<PageLoader />}>
              <Map />
            </Suspense>
          } />

          <Route path="media" element={
            <Suspense fallback={<PageLoader />}>
              <Media />
            </Suspense>
          } />
          <Route path="guides" element={
            <Suspense fallback={<PageLoader />}>
              <GuidesPage />
            </Suspense>
          } />

          <Route path="guides/create" element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <CreateGuidePage />
              </Suspense>
            </PrivateRoute>
          } />

          <Route path="guides/:slug" element={
            <Suspense fallback={<PageLoader />}>
              <GuideDetailPage />
            </Suspense>
          } />

          <Route path="register" element={
            <PublicOnlyRoute>
              <Suspense fallback={<PageLoader />}>
                <RegisterPage />
              </Suspense>
            </PublicOnlyRoute>
          } />

          <Route path="login" element={
            <PublicOnlyRoute>
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            </PublicOnlyRoute>
          } />

          <Route path="/profile/edit" element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <EditProfilePage />
              </Suspense>
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