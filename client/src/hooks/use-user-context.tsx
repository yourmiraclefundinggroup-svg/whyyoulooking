import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  isBetaTester: boolean;
  isClientViewer: boolean;
  canCreateDisputes: boolean;
  canAccessAI: boolean;
  canAccessCreditBuilding: boolean;
  canAccessEducation: boolean;
  setCurrentUserId: (userId: number) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Check for stored authentication on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const authToken = localStorage.getItem("auth_token");
    
    if (storedUserId && authToken) {
      setCurrentUserId(parseInt(storedUserId));
    }
  }, []);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${currentUserId}`],
    enabled: !!currentUserId,
  });

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("auth_token");
    setCurrentUserId(null);
    window.location.href = "/login";
  };

  const isAdmin = user?.accessLevel === 'ADMIN';
  const isBetaTester = user?.accessLevel === 'BETA_TESTER';
  const isClientViewer = user?.accessLevel === 'CLIENT_VIEWER';

  // DIY client: any paying subscriber with a subscriptionTier
  const isDIYClient = !!(user?.subscriptionTier && user.subscriptionTier !== 'none');

  // Permission checks — DIY clients (starter/pro/elite) can create disputes
  const canCreateDisputes = isAdmin || isBetaTester || isDIYClient;
  const canAccessAI = isAdmin || isBetaTester || isDIYClient;
  const canAccessCreditBuilding = isAdmin || isBetaTester || isDIYClient;
  const canAccessEducation = isAdmin || isBetaTester || isDIYClient;

  const value: UserContextType = {
    user: user || null,
    isAdmin,
    isBetaTester,
    isClientViewer,
    canCreateDisputes,
    canAccessAI,
    canAccessCreditBuilding,
    canAccessEducation,
    setCurrentUserId,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}