import React from "react";
import { getJwtPayload } from "@/shared/auth/jwt";
import { SessionProvider } from "@/entities/session";
import { SidebarProvider } from "@/widgets/sidebar/ui/SidebarContext";
import { SidebarLayout } from "@/widgets/sidebar/ui/SidebarLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const payload = await getJwtPayload();
  
  return (
    <SessionProvider>
      <SidebarProvider>
        <SidebarLayout payload={payload}>
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </SessionProvider>
  );
}