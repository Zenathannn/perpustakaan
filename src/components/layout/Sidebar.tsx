"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Users, BarChart, X, BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface userData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<userData | null>(null);

    const menuItems = [
        { label: "Dashboard", icon: Home, href: "/dashboard", },
        { label: "Siswa", icon: Users, href: "/dashboard/siswa" },
        { label: "Kelas", icon: BarChart3, href: "/dashboard/kelas" },
        { label: "Pelanggaran", icon: AlertTriangle, href: "/dashboard/pelanggaran" },
    ];

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

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 items-center justify-between px-6 border-b bg-white">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-[10px] bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">M</span>
                    </div>
                    <h1 className="tracking-tight font-semibold text-lg">Manajemen Siswa</h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 bg-white">
                {menuItems.map(({ label, icon: Icon, href }) => {
                    const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={cn(
                                "cursor-pointer hover:bg-gray-50 focus:bg-blue-50 flex items-center justify-between w-full rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-1 w-1">
                        <AvatarImage src="/avatar.png" alt="User Avatar" />
                        <AvatarFallback>{getInitials(userData?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {userData?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {userData?.email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:border-r bg-white">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}