/**
 * DashboardHeader — Top navigation bar for the ScoreShift client portal.
 * Shows logo, welcome message, notification bell, and profile dropdown.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useUserContext } from "@/hooks/use-user-context";

interface DashboardHeaderProps {
  clientName: string;
}

export function DashboardHeader({ clientName }: DashboardHeaderProps) {
  const { user, logout } = useUserContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);

  const displayName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : clientName;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Gold SS mark */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm leading-none">SS</span>
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                Score<span className="text-amber-500">Shift</span>
              </span>
            </div>
          </div>

          {/* Welcome message — hidden on small screens */}
          <div className="hidden md:flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-800">
              Welcome back, {displayName.split(" ")[0]} 👋
            </p>
            <p className="text-xs text-slate-500">Your credit repair portal</p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-100">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow">
                    {initials || <User className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {displayName.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email ?? ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2 text-slate-500" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile welcome message */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 mt-2">
            <p className="text-sm font-semibold text-slate-800">
              Welcome back, {displayName} 👋
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Your credit repair portal</p>
          </div>
        )}
      </div>
    </header>
  );
}
