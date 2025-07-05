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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState(1); // Default to user 1

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users', currentUserId],
  });

  const isAdmin = user?.accessLevel === 'ADMIN';
  const isBetaTester = user?.accessLevel === 'BETA_TESTER';
  const isClientViewer = user?.accessLevel === 'CLIENT_VIEWER';

  // Permission checks
  const canCreateDisputes = isAdmin || isBetaTester;
  const canAccessAI = isAdmin || isBetaTester;
  const canAccessCreditBuilding = isAdmin || isBetaTester;
  const canAccessEducation = isAdmin || isBetaTester;

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