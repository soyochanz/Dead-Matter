import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home, LogOut, Search, ChevronRight,
  Newspaper, BookOpen, Film, GitCommit,
  Map as MapIcon, Users, Hammer,
  Sword, Crosshair, Shirt, Package,
  Soup, Key, Sprout, Car, Wrench,
  Stethoscope, UserCircle, Layers, Star,
  Menu, X, Loader2, Shield, Globe, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/mySupabaseClient';

// Shared Metadata Cache
let metadataCache = null;

// Lazy load manager components
const UpdatesManager = lazy(() => import('@/components/admin/UpdatesManager'));
const GuidesManager = lazy(() => import('@/components/admin/GuidesManager'));
const MediaManager = lazy(() => import('@/components/admin/MediaManager'));
const MicroChangesManager = lazy(() => import('@/components/admin/MicroChangesManager'));
const MapManager = lazy(() => import('@/components/admin/MapManager'));
const WeaponManager = lazy(() => import('@/components/admin/WeaponManager'));
const AccessoryManager = lazy(() => import('@/components/admin/AccessoryManager'));
const GearManager = lazy(() => import('@/components/admin/GearManager'));
const ToolbeltManager = lazy(() => import('@/components/admin/ToolbeltManager'));
const ConsumableManager = lazy(() => import('@/components/admin/ConsumableManager'));
const KeyManager = lazy(() => import('@/components/admin/KeyManager'));
const BasebuildingManager = lazy(() => import('@/components/admin/BasebuildingManager'));
const CraftingMaterialsManager = lazy(() => import('@/components/admin/CraftingMaterialsManager'));
const VehicleManager = lazy(() => import('@/components/admin/VehicleManager'));
const VehicleComponentManager = lazy(() => import('@/components/admin/VehicleComponentManager'));
const DiseaseManager = lazy(() => import('@/components/admin/DiseaseManager'));
const NpcManager = lazy(() => import('@/components/admin/NpcManager'));
const PerksOccupationsManager = lazy(() => import('@/components/admin/PerksOccupationsManager'));
const WikiCategoryManager = lazy(() => import('@/components/admin/WikiCategoryManager'));
const RarityManager = lazy(() => import('@/components/admin/RarityManager'));
const TranslationManager = lazy(() => import('@/components/admin/TranslationManager'));

const CATEGORIES = [
  {
    id: 'content',
    label: 'Content',
    items: [
      { id: 'updates', label: 'Updates', icon: Newspaper, component: UpdatesManager },
      { id: 'guides', label: 'Guides', icon: BookOpen, component: GuidesManager },
      { id: 'media', label: 'Media', icon: Film, component: MediaManager },
      { id: 'commits', label: 'Commits', icon: GitCommit, component: MicroChangesManager },
    ]
  },
  {
    id: 'world',
    label: 'World & Map',
    items: [
      { id: 'map', label: 'Map Editor', icon: MapIcon, component: MapManager },
      { id: 'npcs', label: 'NPCs', icon: Users, component: NpcManager },
      { id: 'basebuilding', label: 'Basebuilding', icon: Hammer, component: BasebuildingManager },
    ]
  },
  {
    id: 'items',
    label: 'Items & Loot',
    items: [
      { id: 'weapons', label: 'Weapons', icon: Sword, component: WeaponManager },
      { id: 'accessories', label: 'Accessories', icon: Crosshair, component: AccessoryManager },
      { id: 'gear', label: 'Gear', icon: Shirt, component: GearManager },
      { id: 'toolbelts', label: 'Toolbelts', icon: Package, component: ToolbeltManager },
      { id: 'consumables', label: 'Consumables', icon: Soup, component: ConsumableManager },
      { id: 'keys', label: 'Keys', icon: Key, component: KeyManager },
      { id: 'crafting_materials', label: 'Crafting', icon: Sprout, component: CraftingMaterialsManager },
    ]
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    items: [
      { id: 'vehicles', label: 'Vehicles', icon: Car, component: VehicleManager },
      { id: 'mechanics', label: 'Mechanics', icon: Wrench, component: VehicleComponentManager },
    ]
  },
  {
    id: 'character',
    label: 'Character',
    items: [
      { id: 'diseases', label: 'Meds & Health', icon: Stethoscope, component: DiseaseManager },
      { id: 'perks', label: 'Perks & Chars', icon: UserCircle, component: PerksOccupationsManager },
    ]
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'categories', label: 'Categories', icon: Layers, component: WikiCategoryManager },
      { id: 'rarities', label: 'Rarities', icon: Star, component: RarityManager },
      { id: 'translations', label: 'Translations', icon: Globe, component: TranslationManager },
    ]
  }
];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mobile App State
  // Initialize view based on URL to maintain functional parity (deep linking/refresh support)
  const [mobileView, setMobileView] = useState(searchParams.get('tab') ? 'active-tool' : 'home');
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null); // For drilling down in 'tools'

  const [metadata, setMetadata] = useState(metadataCache || { rarities: [], categories: [], subcategories: [], loading: !metadataCache });

  useEffect(() => {
    if (metadataCache) return;

    const fetchMetadata = async () => {
      try {
        const [raritiesRes, categoriesRes, subcategoriesRes] = await Promise.all([
          supabase.from('rarities').select('*'),
          supabase.from('wiki_categories').select('*'),
          supabase.from('wiki_subcategories').select('*')
        ]);

        const data = {
          rarities: raritiesRes.data || [],
          categories: categoriesRes.data || [],
          subcategories: subcategoriesRes.data || [],
          loading: false
        };

        metadataCache = data;
        setMetadata(data);
      } catch (err) {
        setMetadata(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetadata();
  }, []);

  const activeTabId = searchParams.get('tab') || 'updates';

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    const query = searchQuery.toLowerCase();
    return CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.label.toLowerCase().includes(query) ||
        cat.label.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const activeTab = useMemo(() => {
    for (const cat of CATEGORIES) {
      const item = cat.items.find(i => i.id === activeTabId);
      if (item) return item;
    }
    return CATEGORIES[0].items[0];
  }, [activeTabId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    // On mobile, switching a tab means we are going to 'active-tool' view
    setMobileView('active-tool');
  };

  // Mobile: Helper to get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] z-0" />

      {/* ==============================================================================
          DESKTOP LAYOUT (lg:flex)
          Legacy layout preserved exactly as requested for larger screens.
         ============================================================================== */}
      <div className="hidden lg:flex h-screen bg-black text-white overflow-hidden font-sans">
        <aside className={cn(
          "w-72 bg-[#0a0a0c] border-r border-white/5 transition-all duration-300 flex-col relative shrink-0",
          !isSidebarOpen && "lg:hidden"
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-md font-bold text-white tracking-wide">ADMIN CMD</h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Dead Matter Wiki</p>
              </div>
            </div>
          </div>

          {/* Sidebar Search */}
          <div className="px-6 py-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/[0.02] border-white/5 focus-visible:ring-red-500/50 h-10 text-sm focus:bg-white/5 transition-all"
              />
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
            {filteredCategories.map(category => (
              <div key={category.id} className="space-y-1">
                <h3 className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-600/50" />
                  {category.label}
                </h3>
                <div className="space-y-[2px]">
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative border border-transparent",
                        activeTabId === item.id
                          ? "bg-white/5 text-white border-white/5"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors opacity-70",
                        activeTabId === item.id ? "text-red-500 opacity-100" : "group-hover:text-white"
                      )} />
                      {item.label}
                      {activeTabId === item.id && (
                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01] space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 gap-3 h-8"
              onClick={() => {
                localStorage.removeItem('admin_last_route');
                window.location.reload();
              }}
            >
              <Layers className="w-3 h-3" />
              Reset Session Layout
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-white hover:bg-red-500/10 gap-3"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          {/* Header */}
          <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md px-6 flex items-center justify-between z-20 relative">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-white"
                onClick={toggleSidebar}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs font-mono text-gray-500 uppercase">
                  {activeTab?.icon ? <activeTab.icon className="w-3 h-3 inline mr-1" /> : null}
                  CMD
                </div>
                <ChevronRight className="w-3 h-3 text-gray-700" />
                <span className="font-semibold text-white tracking-tight">{activeTab.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-mono text-emerald-500/80">ONLINE</span>
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-gray-500 hover:text-white hover:bg-white/5">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Site
                </Link>
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-black p-4 lg:p-8 relative">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                </div>
              }>
                {activeTab && <activeTab.component sharedMetadata={metadata} />}
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* ==============================================================================
          MOBILE APP LAYOUT (lg:hidden)
          A complete re-imagining for small screens.
         ============================================================================== */}
      <div className="lg:hidden fixed inset-0 bg-[#000000] text-white font-sans flex flex-col z-50">

        {/* Mobile Header (Dynamic based on view) */}
        <div className="h-14 px-4 border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            {mobileView !== 'home' && mobileView !== 'settings' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-gray-400" onClick={() => setMobileView('home')}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            )}
            <h1 className="text-lg font-bold tracking-tight text-white/90">
              {mobileView === 'home' && 'Dashboard'}
              {mobileView === 'tools' && 'Tools & Editors'}
              {mobileView === 'settings' && 'Settings'}
              {mobileView === 'active-tool' && activeTab?.label}
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* Mobile Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black pb-20 scrollbar-hide">

          {/* VIEW: HOME */}
          {mobileView === 'home' && (
            <div className="p-4 space-y-6">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">{getGreeting()},</p>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  Admin Command
                </h2>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleTabChange('updates');
                    setMobileView('active-tool');
                  }}
                  className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-sm">Post Update</span>
                    <span className="text-xs text-gray-400">Manage news</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMobileView('tools');
                  }}
                  className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-sm">All Tools</span>
                    <span className="text-xs text-gray-400">Database Editors</span>
                  </div>
                </button>
              </div>

              {/* Recent/Pinned Section (Mockup for visual) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Quick Access</h3>
                </div>
                <div className="space-y-2">
                  {['map', 'guides', 'media'].map(id => {
                    const item = CATEGORIES.flatMap(c => c.items).find(i => i.id === id);
                    if (!item) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          handleTabChange(id);
                          setMobileView('active-tool');
                        }}
                        className="w-full flex items-center gap-4 p-3 bg-[#0f0f11] border border-white/5 rounded-xl active:bg-white/5 transition-colors"
                      >
                        <div className="p-2 bg-black rounded-lg border border-white/5">
                          <item.icon className="w-5 h-5 text-gray-300" />
                        </div>
                        <span className="font-medium text-sm text-gray-200">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TOOLS (Category Browser) */}
          {mobileView === 'tools' && (
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a tool..."
                  className="pl-9 h-12 rounded-xl bg-white/5 border-white/5"
                />
              </div>

              <div className="space-y-4">
                {filteredCategories.map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{cat.label}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {cat.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleTabChange(item.id);
                            setMobileView('active-tool');
                          }}
                          className="flex flex-col items-center justify-center p-4 bg-[#0f0f11] border border-white/5 rounded-xl gap-3 hover:border-white/20 active:scale-95 transition-all text-center"
                        >
                          <div className={cn("p-3 rounded-full bg-black border border-white/5", activeTabId === item.id && "border-red-500/50 bg-red-500/10")}>
                            <item.icon className={cn("w-6 h-6", activeTabId === item.id ? "text-red-500" : "text-gray-400")} />
                          </div>
                          <span className="text-xs font-semibold text-gray-300 line-clamp-1">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-12" /> {/* Bottom Spacer */}
            </div>
          )}

          {/* VIEW: ACTIVE TOOL (The Actual Manager) */}
          {mobileView === 'active-tool' && (
            <div className="min-h-full">
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
              }>
                {activeTab && (
                  <div className="mobile-manager-wrapper p-3 sm:p-4">
                    {/* Wrapper class for potential CSS overrides specific to mobile managers */}
                    <activeTab.component sharedMetadata={metadata} />
                  </div>
                )}
              </Suspense>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {mobileView === 'settings' && (
            <div className="p-4 space-y-6">
              <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Shield className="w-32 h-32" />
                </div>
                <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-green-500 relative z-10">
                  <span className="text-2xl font-bold">OZ</span>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-black"></div>
                </div>
                <h2 className="text-xl font-bold text-white relative z-10">Admin user</h2>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-400 relative z-10">
                  <Lock className="w-3 h-3" />
                  <span>Super Admin Access</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start h-14 rounded-xl bg-[#0f0f11] border-white/5 text-gray-300 hover:bg-white/5">
                  <Link to="/">
                    <div className="p-2 bg-black rounded mr-3">
                      <Home className="w-4 h-4" />
                    </div>
                    Return to Website
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-14 rounded-xl bg-[#0f0f11] border-white/5 text-gray-300 hover:bg-white/5"
                  onClick={() => {
                    localStorage.removeItem('admin_last_route');
                    window.location.reload();
                  }}
                >
                  <div className="p-2 bg-black rounded mr-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  Reset Navigation History
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-14 rounded-xl bg-[#0f0f11] border-red-900/10 text-red-500 hover:bg-red-900/10 hover:border-red-900/30"
                  onClick={signOut}
                >
                  <div className="p-2 bg-red-950/30 rounded mr-3">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Sign Out
                </Button>
              </div>

              <div className="pt-8 text-center">
                <p className="text-xs text-gray-600 font-mono">DEAD MATTER WIKI ADMIN<br />v2.4.0 (Mobile App Build)</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation (Fixed) */}
        <div className="h-20 bg-[#050505] border-t border-white/10 shrink-0 flex items-center justify-around px-2 pb-2 safe-area-pb">
          {/* Home Tab */}
          <button
            onClick={() => setMobileView('home')}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", mobileView === 'home' ? "text-white" : "text-gray-600")}
          >
            <div className={cn("p-1 rounded-lg transition-all", mobileView === 'home' && "bg-white/10")}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Tools Tab */}
          <button
            onClick={() => setMobileView('tools')}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", (mobileView === 'tools' || mobileView === 'active-tool') ? "text-red-500" : "text-gray-600")}
          >
            <div className={cn("p-1 rounded-lg transition-all", (mobileView === 'tools' || mobileView === 'active-tool') && "bg-red-500/10")}>
              <Hammer className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">Tools</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setMobileView('settings')}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", mobileView === 'settings' ? "text-white" : "text-gray-600")}
          >
            <div className={cn("p-1 rounded-lg transition-all", mobileView === 'settings' && "bg-white/10")}>
              <UserCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
