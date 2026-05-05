import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useUserContext } from "@/hooks/use-user-context";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isClientViewer, isAdmin, canCreateDisputes, logout } = useUserContext();

  const displayUser = user || { firstName: "Loading", lastName: "", accessLevel: "CLIENT_VIEWER" };

  const clientNavItems = [
    { href: "/credit-repair", label: "Dashboard" },
    { href: "/credit-monitoring", label: "Credit Monitoring" },
    ...(canCreateDisputes ? [{ href: "/disputes-diy", label: "Disputes" }] : []),
    { href: "/debt-navigator", label: "Debt Navigator" },
    { href: "/student-loans", label: "Student Loan Aid" },
    { href: "/progress", label: "Progress" },
    { href: "/chat", label: "Chat" },
    { href: "/billing", label: "Billing" },
  ];

  const adminNavItems = [
    { href: "/admin-portal", label: "Admin Portal" },
    { href: "/support-admin", label: "Support" },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const isActive = (href: string) => {
    if (href === "/credit-repair") return location === "/" || location === "/credit-repair";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(8,12,20,0.95)",
        borderColor: "rgba(201,168,76,0.15)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAdmin ? "/admin-portal" : "/credit-repair"}>
            <div className="flex items-center gap-2 cursor-pointer shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}
              >
                SS
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">ScoreShift</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className="relative px-3 py-1.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap block"
                    style={{
                      color: active ? "#E8C96B" : "#8A9BB5",
                    }}
                    onMouseEnter={(e) => { if (!active) (e.target as HTMLElement).style.color = "#E8C96B"; }}
                    onMouseLeave={(e) => { if (!active) (e.target as HTMLElement).style.color = "#8A9BB5"; }}
                  >
                    {item.label}
                    {active && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: "var(--gold)" }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm" style={{ color: "#8A9BB5" }}>
                {displayUser.firstName} {displayUser.lastName}
              </span>
              {isClientViewer && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(201,168,76,0.12)", color: "#E8C96B", border: "1px solid rgba(201,168,76,0.25)" }}>
                  Client
                </span>
              )}
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(201,168,76,0.12)", color: "#E8C96B", border: "1px solid rgba(201,168,76,0.25)" }}>
                  Admin
                </span>
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}
            >
              <User className="h-4 w-4 text-black" />
            </div>

            {/* Sign out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden sm:flex text-xs"
              style={{ color: "#8A9BB5" }}
            >
              Sign Out
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              style={{ color: "#8A9BB5" }}
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
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
                      style={{
                        color: active ? "#E8C96B" : "#8A9BB5",
                        background: active ? "rgba(201,168,76,0.08)" : "transparent",
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              <div className="pt-2 px-3">
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--bg-primary)" }}
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
