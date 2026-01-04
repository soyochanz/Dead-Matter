import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpdatesManager from '@/components/admin/UpdatesManager';
import MediaManager from '@/components/admin/MediaManager';
import WeaponManager from '@/components/admin/WeaponManager';
import AccessoryManager from '@/components/admin/AccessoryManager';
import ConsumableManager from '@/components/admin/ConsumableManager';
import DiseaseManager from '@/components/admin/DiseaseManager';
import GearManager from '@/components/admin/GearManager';
import VehicleManager from '@/components/admin/VehicleManager';
import KeyManager from '@/components/admin/KeyManager';
import RarityManager from '@/components/admin/RarityManager';
import WikiCategoryManager from '@/components/admin/WikiCategoryManager';
import MapManager from '@/components/admin/MapManager';
import MicroChangesManager from '@/components/admin/MicroChangesManager';
import ToolbeltManager from '@/components/admin/ToolbeltManager';
import NpcManager from '@/components/admin/NpcManager';
import PerksOccupationsManager from '@/components/admin/PerksOccupationsManager';
import VehicleComponentManager from '@/components/admin/VehicleComponentManager';
import BasebuildingManager from '@/components/admin/BasebuildingManager';
import CraftingMaterialsManager from '@/components/admin/CraftingMaterialsManager';
import GuidesManager from '@/components/admin/GuidesManager';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-center mb-10 gap-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="px-6 py-5 text-base">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" /> Go to Site
              </Link>
            </Button>
            <Button onClick={signOut} variant="destructive" className="px-6 py-5 text-base">
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          </div>
        </div>


        <Tabs defaultValue="updates" className="w-full" orientation="vertical">
          <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-10">
            <TabsList className="flex-col h-auto justify-start p-2 space-y-2 w-full">
              <TabsTrigger value="updates" className="w-full text-lg py-3">Updates</TabsTrigger>
              <TabsTrigger value="guides" className="w-full text-lg py-3">Guides</TabsTrigger>
              <TabsTrigger value="media" className="w-full text-lg py-3">Media</TabsTrigger>
              <TabsTrigger value="commits" className="w-full text-lg py-3">Commits</TabsTrigger>
              <TabsTrigger value="map" className="w-full text-lg py-3">Map</TabsTrigger>
              <TabsTrigger value="weapons" className="w-full text-lg py-3">Weapons</TabsTrigger>
              <TabsTrigger value="accessories" className="w-full text-lg py-3">Accessories</TabsTrigger>
              <TabsTrigger value="gear" className="w-full text-lg py-3">Gear</TabsTrigger>
              <TabsTrigger value="toolbelts" className="w-full text-lg py-3">Toolbelts</TabsTrigger>
              <TabsTrigger value="consumables" className="w-full text-lg py-3">Consumables</TabsTrigger>
              <TabsTrigger value="keys" className="w-full text-lg py-3">Keys</TabsTrigger>
              <TabsTrigger value="basebuilding" className="w-full text-lg py-3">Basebuilding</TabsTrigger>
              <TabsTrigger value="crafting_materials" className="w-full text-lg py-3">Crafting Materials</TabsTrigger>
              <TabsTrigger value="vehicles" className="w-full text-lg py-3">Vehicles</TabsTrigger>
              <TabsTrigger value="mechanics" className="w-full text-lg py-3">Vehicle Mechanics</TabsTrigger>
              <TabsTrigger value="diseases" className="w-full text-lg py-3">Diseases & Meds</TabsTrigger>
              <TabsTrigger value="npcs" className="w-full text-lg py-3">NPCs</TabsTrigger>
              <TabsTrigger value="perks" className="w-full text-lg py-3">Perks & Chars</TabsTrigger>
              <TabsTrigger value="categories" className="w-full text-lg py-3">Categories</TabsTrigger>
              <TabsTrigger value="rarities" className="w-full text-lg py-3">Rarities</TabsTrigger>
            </TabsList>

            <div className="p-6 bg-black/20 rounded-lg border border-white/10 text-base">
              <TabsContent value="updates"><UpdatesManager /></TabsContent>
              <TabsContent value="guides"><GuidesManager /></TabsContent>
              <TabsContent value="media"><MediaManager /></TabsContent>
              <TabsContent value="commits"><MicroChangesManager /></TabsContent>
              <TabsContent value="map"><MapManager /></TabsContent>
              <TabsContent value="weapons"><WeaponManager /></TabsContent>
              <TabsContent value="accessories"><AccessoryManager /></TabsContent>
              <TabsContent value="gear"><GearManager /></TabsContent>
              <TabsContent value="toolbelts"><ToolbeltManager /></TabsContent>
              <TabsContent value="consumables"><ConsumableManager /></TabsContent>
              <TabsContent value="keys"><KeyManager /></TabsContent>
              <TabsContent value="basebuilding"><BasebuildingManager /></TabsContent>
              <TabsContent value="crafting_materials"><CraftingMaterialsManager /></TabsContent>
              <TabsContent value="vehicles"><VehicleManager /></TabsContent>
              <TabsContent value="mechanics"><VehicleComponentManager /></TabsContent>
              <TabsContent value="diseases"><DiseaseManager /></TabsContent>
              <TabsContent value="npcs"><NpcManager /></TabsContent>
              <TabsContent value="perks"><PerksOccupationsManager /></TabsContent>
              <TabsContent value="categories"><WikiCategoryManager /></TabsContent>
              <TabsContent value="rarities"><RarityManager /></TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;