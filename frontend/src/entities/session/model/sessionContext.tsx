"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  department_id: number | null;
  office_room_id: number | null;
  region: string;
  hire_date: string;
  is_active: boolean;
  id: number;
  permissions: string[];
}

interface SessionContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// TODO: Replace with actual auth mechanism and /api/v1/users/me call
// For now, simulating the current admin user session
const MOCK_USER: UserProfile = {
  first_name: "Admin",
  last_name: "User",
  email: "admin@unime.it",
  role_id: 1,
  department_id: 1,
  office_room_id: null,
  region: "Domestic",
  hire_date: "2020-01-01",
  is_active: true,
  id: 1,
  permissions: ["*"], // Wildcard means all permissions granted
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simulate network delay for realistic UI loading states
        await new Promise(resolve => setTimeout(resolve, 300));
        setUser(MOCK_USER);
      } catch (error) {
        console.error("Failed to fetch session", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Wildcard permission check
    if (user.permissions.includes("*")) return true;
    return user.permissions.includes(permission);
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, hasPermission }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const usePermissions = () => {
  const { hasPermission } = useSession();
  return { hasPermission };
};
