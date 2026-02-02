import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";


const navigation = [
  { name: "Dashboard", href: "/home", icon: LayoutDashboard },
  { name: "Incidents", href: "/home/incidents", icon: AlertTriangle },
  { name: "Activity", href: "/home/activity", icon: Activity },
];

export function Sidebar() {
  const location = useLocation();

  const { user } = useAuth();


  return (
    <SidebarPrimitive collapsible="icon" className="border-r ">
      <SidebarHeader className="border-b border-white/10 bg-amber-800">
        <div className="flex h-16 items-center gap-3 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2  bg-white overflow-hidden shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 transition-all duration-200">
            <img
              src="https://pbs.twimg.com/profile_images/1540056875508682752/4EFArv1v_400x400.jpg"
              alt="Barangay Logo"
              className="object-cover h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <h1 className="text-base font-bold text-white truncate">
              Incident Radar
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-amber-800">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? "bg-white/20 text-white hover:bg-white/25 hover:text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    >
                      <Link to={item.href}>
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-amber-800 p-5">
        <SidebarSeparator className="bg-white/10" />
        <div>
          <div>
            <div

            >
              <div className="flex items-center w-full text-left">
                {/* <Avatar className="h-8 w-8 rounded-lg mr-3 shrink-0">
                  <AvatarImage
                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                    alt="User"
                  />
                  <AvatarFallback className="rounded-lg">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar> */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-white/70">
                    {user?.email}
                  </span>
                </div>
                {/* <Settings className="ml-auto h-5 w-5 text-white" /> */}
              </div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}