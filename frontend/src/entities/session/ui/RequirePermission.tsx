"use client";

import React from "react";
import { usePermissions } from "../model/sessionContext";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children
 * based on whether the current user has the specified permission.
 */
export const RequirePermission = ({ 
  permission, 
  children, 
  fallback = null 
}: RequirePermissionProps) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
