import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useUserContext } from "@/hooks/use-user-context";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isClientViewer, isAdmin, canAccessCreditBuilding, canAccessEducation, logout } = useUserContext();

  const displayUser = user || { firstName: "Loading", lastName: "", accessLevel: "CLIENT_VIEWER" };

  const navItems = [
    { href: "/credit-repair", label: "Dashboard" },
    { href: "/credit-monitoring", label: "Credit Monitoring" },
    { href: "/credit-building", label: "Credit Building" },
    { href: "/billing", label: "Billing" },
    ...(canAccessEducation ? [{ href: "/education", label: "Education" }] : []),
    ...(isAdmin
      ? [
          { href: "/admin", label: "Admin" },
          { href: "/support-admin", label: "Support" },
        ]
      : []),
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(5,10,20,0.9)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
                style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
              >
                SS
              </div>
              <span className="text-white font-bold text-lg tracking-tight">ScoreShift</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    location === item.href
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-slate-400 text-sm">
                {displayUser.firstName} {displayUser.lastName}
              </div>
              {isClientViewer && (
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                  Client View
                </span>
              )}
              {isAdmin && (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs">
                  Admin
                </span>
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            >
              <User className="h-4 w-4 text-black" />
            </div>

            {/* Sign out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden sm:flex text-slate-400 hover:text-white hover:bg-white/5 text-xs"
            >
              Sign Out
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t py-3"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "block px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all",
                      location === item.href
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="pt-2 px-3">
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
