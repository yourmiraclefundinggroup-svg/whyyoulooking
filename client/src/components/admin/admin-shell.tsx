import { useState, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatedBackdrop } from "./animated-backdrop";
import { useUserContext } from "@/hooks/use-user-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  FolderOpen,
  UserCog,
  Settings,
  Activity,
  Shield,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package,
  Brain,
  TrendingUp,
  Mail,
} from "lucide-react";

interface AdminShellContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  animatedBackground: boolean;
  setAnimatedBackground: (enabled: boolean) => void;
}

const AdminShellContext = createContext<AdminShellContextType | null>(null);

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) throw new Error("useAdminShell must be used within AdminShell");
  return context;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin-portal", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/admin-portal/clients", label: "Clients", icon: Users },
      { href: "/admin-portal/chat", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Disputes",
    items: [
      { href: "/admin-portal/credit-reports", label: "Credit Reports", icon: FolderOpen },
      { href: "/admin-portal/disputes", label: "Disputes", icon: FileText, badge: "3" },
      { href: "/admin-portal/tracking", label: "USPS Tracking", icon: Package },
      { href: "/admin-portal/bureau-analysis", label: "Bureau Analysis", icon: Brain },
    ],
  },
  {
    label: "Mail",
    items: [
      { href: "/admin-portal/mail", label: "Mail Queue", icon: Mail },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/admin-portal/analytics", label: "Analytics", icon: TrendingUp },
      { href: "/admin-portal/white-label", label: "White Label", icon: Package },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin-portal/users", label: "Users & Roles", icon: UserCog },
      { href: "/admin-portal/settings", label: "Settings", icon: Settings },
      { href: "/admin-portal/system", label: "System", icon: Activity },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedBackground, setAnimatedBackground] = useState(true);
  const [location] = useLocation();
  const { user, logout } = useUserContext();

  const isActiveRoute = (href: string) => {
    if (href === "/admin-portal") {
      return location === "/admin-portal" || location === "/admin-portal/";
    }
    return location.startsWith(href);
  };

  const NavItemEl = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);
    return (
      <Link key={item.href} href={item.href}>
        <motion.div
          whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
            isActive
              ? "bg-gradient-to-r from-[hsl(var(--admin-accent))]/20 to-[hsl(var(--admin-accent))]/5 text-[hsl(var(--admin-accent))] border-l-2 border-[hsl(var(--admin-accent))]"
              : "text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-card))]",
            sidebarCollapsed && "justify-center px-2"
          )}
          onClick={onClick}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-[hsl(var(--admin-accent))]")} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <Badge className="h-5 px-1.5 text-[10px] bg-[hsl(var(--admin-accent))] text-white border-0">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <AdminShellContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, animatedBackground, setAnimatedBackground }}>
      <div className="admin-theme min-h-screen bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]">
        <AnimatedBackdrop enabled={animatedBackground} />
        
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
            "bg-[hsl(var(--admin-sidebar))]/95 backdrop-blur-xl border-r border-[hsl(var(--admin-border))]",
            sidebarCollapsed ? "w-[72px]" : "w-64",
            "hidden lg:block"
          )}
        >
          <div className="flex h-full flex-col">
            <div className={cn(
              "flex items-center h-16 px-4 border-b border-[hsl(var(--admin-border))]",
              sidebarCollapsed ? "justify-center" : "justify-between"
            )}>
              <Link href="/admin-portal">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <span className="font-bold text-lg text-white">ScoreShift</span>
                      <span className="block text-[10px] font-medium text-[hsl(var(--admin-accent))] tracking-wider">ADMIN</span>
                    </motion.div>
                  )}
                </div>
              </Link>
              {!sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-card))]"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              {navGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  {!sidebarCollapsed && (
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-subtle))]">
                      {group.label}
                    </p>
                  )}
                  {sidebarCollapsed && group.label !== "Overview" && (
                    <div className="border-t border-[hsl(var(--admin-border))]/40 my-2" />
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavItemEl key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {sidebarCollapsed && (
              <div className="px-3 py-4 border-t border-[hsl(var(--admin-border))]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-9 p-0 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-card))]"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!sidebarCollapsed && (
              <div className="p-4 border-t border-[hsl(var(--admin-border))]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">
                      Administrator
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-card))]"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <header
          className={cn(
            "fixed top-0 right-0 z-30 h-16 transition-all duration-300",
            "bg-[hsl(var(--admin-bg))]/80 backdrop-blur-xl border-b border-[hsl(var(--admin-border))]",
            sidebarCollapsed ? "lg:left-[72px]" : "lg:left-64",
            "left-0"
          )}
        >
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0 text-[hsl(var(--admin-text-muted))] hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-subtle))]" />
                <Input
                  placeholder="Search clients, disputes..."
                  className="w-64 lg:w-80 pl-9 h-9 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:border-[hsl(var(--admin-accent))] focus:ring-[hsl(var(--admin-accent))]/20"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--admin-text-subtle))]">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-card))]"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--admin-accent))] rounded-full" />
              </Button>

              <div className="lg:hidden flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white font-semibold text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 z-50 h-screen w-72 bg-[hsl(var(--admin-sidebar))] border-r border-[hsl(var(--admin-border))] lg:hidden"
              >
                <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--admin-border))]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-lg text-white">ScoreShift</span>
                      <span className="block text-[10px] font-medium text-[hsl(var(--admin-accent))] tracking-wider">ADMIN</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[hsl(var(--admin-text-muted))]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="py-3 px-3 overflow-y-auto h-[calc(100vh-8rem)]">
                  {navGroups.map((group) => (
                    <div key={group.label} className="mb-3">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-subtle))]">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = isActiveRoute(item.href);
                          return (
                            <Link key={item.href} href={item.href}>
                              <div
                                className={cn(
                                  "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer",
                                  isActive
                                    ? "bg-gradient-to-r from-[hsl(var(--admin-accent))]/20 to-transparent text-[hsl(var(--admin-accent))]"
                                    : "text-[hsl(var(--admin-text-muted))]"
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.badge && (
                                  <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-[hsl(var(--admin-accent))] text-white border-0">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[hsl(var(--admin-border))]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">Administrator</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-[hsl(var(--admin-text-muted))]"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main
          className={cn(
            "min-h-screen pt-16 transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
          )}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminShellContext.Provider>
  );
}
