import { LogOut, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SidebarTrigger } from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <header className="h-16 border-b border-border bg-background">
            <div className="flex h-full items-center justify-between px-6">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    <SidebarTrigger />
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Log Out
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}