'use client';

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface userData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}


export default function Topbar({onMenuClick}: {onMenuClick: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<userData | null>(null);
    const [loading, setLoading] = useState(false);
    const menuMap: Record<string, string> = {};

    const title = menuMap[pathname] || "SMK Negeri 1 Pasuruan";

    const handlelogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(error.message);
                return;
            }
            router.push("/auth/login");
            localStorage.clear();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();

                if (error || !data.user) {
                    console.error("Error fething user:", error);
                    router.push("/auth/login");
                    return;
                }

                const name = data.user.user_metadata?.name ||
                data.user.user_metadata?.full_name ||
                data.user.email?.split('@')[0] ||
                'user';

                setUserData({
                    id: data.user.id,
                    email: data.user.email || '',
                    name: name,
                    avatar_url: data.user.user_metadata.avatar_url || '',
                })
            } catch (error) {
                console.error("Error fethching user data:", error);
            }
        }
        fetchUser();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return(
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container flex h-15 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={onMenuClick}
                      >
                        <Menu className="w-5 h-5" onClick={onMenuClick}/>
                    </Button>
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar>
                                    <AvatarImage src="/avatar.png" alt="user Avatar" />
                                    <AvatarFallback className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700">{getInitials(userData?.name || '')}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-65 bg-white rounded-[10px]" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium loading-none">
                                        {userData?.name}
                                    </p>
                                    <p className="text-sm leading-none text-muted-foreground">
                                        {userData?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-[5px]"
                              onClick={handlelogout}
                              >
                                <LogOut className="mr-2 h-4 w-4"/>
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}