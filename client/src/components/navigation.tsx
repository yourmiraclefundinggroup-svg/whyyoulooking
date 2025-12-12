import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useUserContext } from "@/hooks/use-user-context";
import { ScoreShiftLogo } from "@/components/scoreshift-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isClientViewer, isAdmin, canAccessCreditBuilding, canAccessEducation, logout } = useUserContext();
  
  // Show basic navigation even if user is still loading
  const displayUser = user || { firstName: 'Loading', lastName: '', accessLevel: 'CLIENT_VIEWER' };

  // Show basic navigation for all authenticated users
  const navItems = [
    { href: "/credit-repair", label: "Credit Repair" },
    { href: "/student-loans", label: "Student Loans" },
    { href: "/experian", label: "Experian Connect" },
    ...(canAccessCreditBuilding ? [{ href: "/credit-building", label: "Credit Building" }] : []),
    ...(canAccessEducation ? [{ href: "/education", label: "Education" }] : []),
    { href: "/billing", label: "Billing" },
    ...(isAdmin ? [
      { href: "/admin", label: "Admin" }, 
      { href: "/support-admin", label: "Support Center" }
    ] : []),
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-blue-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <ScoreShiftLogo size="lg" animated className="cursor-pointer" />
              </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "px-1 pb-4 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                      location === item.href
                        ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="text-gray-700 dark:text-gray-300">
                {displayUser.firstName} {displayUser.lastName}
              </div>
              {isClientViewer && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  Client View
                </span>
              )}
              {isAdmin && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                  Admin
                </span>
              )}
            </div>
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hidden sm:flex dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Sign Out
            </Button>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                      location === item.href
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button className="w-full bg-trust-blue hover:bg-blue-700 text-sm">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
