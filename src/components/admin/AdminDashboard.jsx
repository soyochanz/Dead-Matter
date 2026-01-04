import React, { useState, useMemo, Suspense, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home, LogOut, Search, ChevronRight,
  Newspaper, BookOpen, Film, GitCommit,
  Map as MapIcon, Users, Hammer,
  Sword, Crosshair, Shirt, Package,
  Soup, Key, Sprout, Car, Wrench,
  Stethoscope, UserCircle, Layers, Star,
  Menu, X, Loader2
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
    ]
  }
];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full lg:hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              ADMIN CENTER
            </h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sidebar Search */}
          <div className="px-6 py-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-red-400 transition-colors" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-white/5 focus-visible:ring-red-500/50 h-9 text-sm"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
            {filteredCategories.map(category => (
              <div key={category.id} className="space-y-1">
                <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {category.label}
                </h3>
                <div className="space-y-[2px]">
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      onMouseEnter={() => {
                        // Pre-fetch the component source on hover
                        if (typeof item.component._load === 'function') {
                          item.component._load();
                        } else if (item.component.render?._load) {
                          item.component.render._load();
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                        activeTabId === item.id
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        activeTabId === item.id ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      {item.label}
                      {activeTabId === item.id && (
                        <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-3"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Logout Session
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Dashboard</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-200">{activeTab.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex border-white/10 bg-white/5 hover:bg-white/10">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Live Site
              </Link>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gradient-to-b from-transparent to-black/40">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={
              <div className="space-y-6">
                <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            }>
              {activeTab && <activeTab.component sharedMetadata={metadata} />}
            </Suspense>
          </div>
        </div>

        {/* Floating background blobs */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </main>
    </div>
  );
};

export default AdminDashboard;
