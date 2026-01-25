import React from "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,

} from "@/components/ui/sidebar";
import { Navbar } from "@/shared/Navbar";
import { Sidebar } from "@/shared/SideBarMenu";
;

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <SidebarInset>
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;