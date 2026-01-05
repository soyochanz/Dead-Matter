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
import { useTranslation } from 'react-i18next';
import { LogOut, User, ShieldAlert, ChevronDown, Sparkles } from 'lucide-react';

export function UserNav() {
  const { session, profile, signOut } = useAuth();
  const { t } = useTranslation();

  if (!session) {
    return (
      <div className="flex gap-3">
        <Button asChild variant="ghost" className="text-white/90 hover:text-red-300 hover:bg-white/5 backdrop-blur-sm border border-white/10">
          <Link to="/login">{t('user.login')}</Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-red-500/30 transition-all duration-300">
          <Link to="/register">{t('user.register')}</Link>
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
        <button className="relative group outline-none">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-300">
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarUrl} alt={username} className="object-cover" />
              <AvatarFallback className="bg-white/5 text-white/50 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-white/5 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>

          {/* Online Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#0a0a0c] rounded-full flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 text-white shadow-2xl p-0 overflow-hidden"
        align="end"
        forceMount
      >
        {/* Technical Header */}
        <div className="relative p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />

          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden">
              <Avatar className="h-full w-full">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="bg-white/10 text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white truncate">{username}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    {t('user.cmd')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-mono truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="p-2 space-y-1">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-2.5 px-3 rounded-lg flex items-center gap-3 group transition-colors">
              <Link to="/profile/edit" className="w-full flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">{t('user.profile_settings')}</span>
                </div>
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem asChild className="focus:bg-red-500/5 focus:text-red-400 cursor-pointer py-2.5 px-3 rounded-lg flex items-center gap-3 group transition-colors mt-1">
                <Link to="/tutucucu" className="w-full flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-red-400">{t('user.admin_dashboard')}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <div className="my-1 h-px bg-white/5" />

          <DropdownMenuItem
            className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer py-2.5 px-3 rounded-lg flex items-center gap-3 group transition-colors"
            onSelect={() => signOut()}
          >
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-medium text-gray-300 group-hover:text-red-400">{t('user.disconnect')}</span>
          </DropdownMenuItem>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
          <span className="text-[9px] text-gray-600 uppercase tracking-widest font-black">{t('user.system_id')}</span>
          <span className="text-[9px] font-mono text-gray-500">USER-{session.user.id.slice(0, 4)}</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserNav;
