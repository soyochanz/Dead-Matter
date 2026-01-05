import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home, LogOut, Search, ChevronRight,
  Newspaper, BookOpen, Film, GitCommit,
  Map as MapIcon, Users, Hammer,
  Sword, Crosshair, Shirt, Package,
  Soup, Key, Sprout, Car, Wrench,
  Stethoscope, UserCircle, Layers, Star,
  Menu, X, Loader2, Shield, Globe
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
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Technical Background (Global for dashboard) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] z-0" />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0c] border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
        !isSidebarOpen && "-translate-x-full lg:hidden"
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
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/5 text-gray-400" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </Button>
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

        {/* Navigation Items */}
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
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="w-5 h-5 text-gray-400" />
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
        <div className="flex-1 overflow-y-auto bg-black p-6 lg:p-8 relative">
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
  );
};

export default AdminDashboard;
