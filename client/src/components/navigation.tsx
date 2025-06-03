import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/credit-repair", label: "Credit Repair" },
    { href: "/credit-building", label: "Credit Building" },
    { href: "/education", label: "Education" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold trust-blue cursor-pointer">CreditFix Pro</h1>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "px-1 pb-4 text-sm font-medium border-b-2 transition-colors",
                      location === item.href
                        ? "trust-blue border-blue-600"
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-trust-blue hover:bg-blue-700">
              Upgrade Plan
            </Button>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <i className="fas fa-user text-gray-600"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
