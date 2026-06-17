'use client';

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { Badge } from "../ui/badge";

interface userData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    role: string;
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<userData | null>(null);

    const getTitle = () => {
        if (pathname.startsWith("/admin")) return "Panel Admin";
        return "Perpustakaan Digital";
    };

    const title = getTitle();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(error.message);
                return;
            }
            localStorage.clear();
            router.push("/auth/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) {
                    router.push("/auth/login");
                    return;
                }

                // Also fetch role from profile table
                const { data: profile } = await supabase
                    .from("profile")
                    .select("nama, role")
                    .eq("id", data.user.id)
                    .single();

                const name = profile?.nama ||
                    data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    data.user.email?.split('@')[0] ||
                    'User';

                setUserData({
                    id: data.user.id,
                    email: data.user.email || '',
                    name: name,
                    avatar_url: data.user.user_metadata?.avatar_url || '',
                    role: profile?.role || 'siswa',
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
        fetchUser();
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left: Hamburger + Title */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight text-gray-800">{title}</h2>
                </div>

                {/* Right: User info + avatar */}
                <div className="flex items-center gap-3">
                    {/* User name + role (visible on md+) */}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-800 leading-tight">
                            {userData?.name || "Memuat..."}
                        </span>
                        <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0 h-5 mt-0.5 ${userData?.role === 'admin'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                        >
                            {userData?.role === 'admin' ? 'Admin' : 'Siswa'}
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <Avatar className="w-9 h-9 ring-2 ring-blue-100 ring-offset-1">
                                    <AvatarImage src={userData?.avatar_url || "/avatar.png"} alt="User Avatar" />
                                    <AvatarFallback className={`text-white font-semibold text-sm ${userData?.role === 'admin' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-teal-600'}`}>
                                        {getInitials(userData?.name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white rounded-xl shadow-lg border border-gray-100" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none text-gray-800">
                                        {userData?.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground mt-0.5">
                                        {userData?.email}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={`w-fit mt-1.5 text-xs ${userData?.role === 'admin'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                        }`}
                                    >
                                        {userData?.role === 'admin' ? '👑 Admin' : '🎓 Siswa'}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer mx-1 mb-1"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}