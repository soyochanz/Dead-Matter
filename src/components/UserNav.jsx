import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut, User, ShieldAlert, ChevronDown, Sparkles } from 'lucide-react';

export function UserNav() {
  const { session, profile, signOut } = useAuth();

  if (!session) {
    return (
      <div className="flex gap-3">
        <Button asChild variant="ghost" className="text-white/90 hover:text-red-300 hover:bg-white/5 backdrop-blur-sm border border-white/10">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-red-500/30 transition-all duration-300">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  // Prioritize profile data, fallback to session defaults
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`;
  const userEmail = profile?.email || session.user.email;
  const username = profile?.username || userEmail.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();
  const isAdmin = profile?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative group cursor-pointer">
          {/* Efecto de halo luminoso */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
          
          {/* Avatar más grande con efectos modernos */}
          <Button 
            variant="ghost" 
            className="relative h-16 w-16 rounded-full p-0 hover:scale-105 transition-all duration-300 border-2 border-white/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl hover:shadow-red-500/30 group"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Avatar className="h-14 w-14 border-2 border-white/30 group-hover:border-red-500/50 transition-colors duration-300">
              <AvatarImage src={avatarUrl} alt={username} className="group-hover:scale-105 transition-transform duration-300" />
              <AvatarFallback className="bg-gradient-to-br from-red-900 to-purple-900 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Indicador de estado online */}
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-gray-900 shadow-lg">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30"></div>
            </div>
            
            {/* Icono de flecha */}
            <ChevronDown className="absolute -bottom-2 -right-2 w-6 h-6 p-1 bg-gray-900 rounded-full border border-white/10 text-white/70 group-hover:text-red-400 transition-all duration-300" />
          </Button>
          
          {/* Efecto de pulso sutil */}
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse opacity-0 group-hover:opacity-100"></div>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-gray-900/95 backdrop-blur-xl border-gray-800 text-white shadow-2xl animate-in fade-in-0 zoom-in-95"
        align="end" 
        forceMount
      >
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20"></div>
          <DropdownMenuLabel className="font-normal bg-transparent relative z-10">
            <div className="flex items-center space-x-3 p-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-full blur opacity-40"></div>
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-gradient-to-br from-red-900 to-purple-900">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold leading-none text-white truncate">
                    {username}
                  </p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-red-600/30 to-purple-600/30 text-red-300 rounded-full border border-red-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs leading-none text-gray-400 truncate mt-1">
                  {userEmail}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>
        
        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-3 hover:pl-4 transition-all duration-200 group">
            <Link to="/profile/edit" className="flex items-center">
              <div className="mr-3 p-1.5 bg-gray-800/50 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <User className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
              </div>
              <span className="font-medium">Profile</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Admin Access Link - Only visible for admins */}
          {isAdmin && (
            <DropdownMenuItem asChild className="focus:bg-red-900/30 focus:text-red-200 cursor-pointer py-3 hover:pl-4 transition-all duration-200 group">
              <Link to="/tutucucu" className="flex items-center">
                <div className="mr-3 p-1.5 bg-red-900/30 rounded-lg group-hover:bg-red-500/40 transition-colors">
                  <ShieldAlert className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                </div>
                <span className="font-medium text-red-400 group-hover:text-red-300">Admin Dashboard</span>
                <Sparkles className="ml-auto h-3.5 w-3.5 text-yellow-400 animate-pulse" />
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <DropdownMenuItem 
          className="focus:bg-red-900/30 focus:text-red-200 cursor-pointer py-3 hover:pl-4 transition-all duration-200 group" 
          onClick={() => signOut()}
        >
          <div className="flex items-center">
            <div className="mr-3 p-1.5 bg-red-900/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-400" />
            </div>
            <span className="font-medium text-red-500 group-hover:text-red-400">Log out</span>
          </div>
        </DropdownMenuItem>
        
        {/* Footer con versión */}
        <div className="px-2 py-1.5 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserNav;