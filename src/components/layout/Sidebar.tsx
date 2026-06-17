"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, Library, X, LibraryBig } from "lucide-react";
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
        { label: "Dashboard", icon: Home, href: "/dashboard" },
        { label: "Buku", icon: BookOpen, href: "/dashboard/buku" },
        { label: "Peminjaman", icon: Library, href: "/dashboard/peminjaman" },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();

                if (error || !data.user) {
                    console.error("Error fetching user:", error);
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
                console.error("Error fetching user data:", error);
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
        <div className="flex h-full flex-col bg-white">
            <div className="flex h-20 items-center justify-between px-6 border-b bg-white">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-15 border-white rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                        <LibraryBig className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="tracking-tight font-bold text-xl text-gray-800">Perpustakaan</h1>
                        <p className="text-xs text-gray-500">Sistem Manajemen Perpustakaan</p>
                    </div>
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
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userData?.avatar_url} alt="User Avatar" />
                        <AvatarFallback>{getInitials(userData?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {userData?.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {userData?.email}
                        </p>
                    </div>
                </div>
            </div>
        </div >
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