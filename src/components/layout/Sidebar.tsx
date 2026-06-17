"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, Library, X, LibraryBig } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface UserData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    role: string;
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);

    const isAdmin = pathname.startsWith('/admin');
    const menuItems = isAdmin ? [
        { label: "Dashboard", icon: Home, href: "/admin/dashboard" },
        { label: "Buku", icon: BookOpen, href: "/admin/buku" },
        { label: "Peminjaman", icon: Library, href: "/admin/peminjaman" },
    ] : [
        { label: "Dashboard", icon: Home, href: "/siswa/dashboard" },
        { label: "Buku", icon: BookOpen, href: "/siswa/buku" },
        { label: "Peminjaman", icon: Library, href: "/siswa/peminjaman" },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) {
                    router.push("/auth/login");
                    return;
                }

                // Fetch from profile table for accurate nama & role
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
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-white">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-5 border-b bg-white">
                <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                        <LibraryBig className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="tracking-tight font-bold text-base text-gray-800 leading-tight">Perpustakaan</h1>
                        <p className="text-xs text-gray-400">Sistem Manajemen</p>
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

            {/* Role label */}
            <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {isAdmin ? 'Menu Admin' : 'Menu Siswa'}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-6 space-y-1 bg-white">
                {menuItems.map(({ label, icon: Icon, href }) => {
                    const isActive = (href === '/siswa/dashboard' || href === '/admin/dashboard')
                        ? pathname === href
                        : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : "text-gray-400")} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - User Info */}
            <div className="p-4 border-t bg-gray-50/80">
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 flex-shrink-0 ring-2 ring-offset-1 ${userData?.role === 'admin' ? 'ring-blue-200' : 'ring-green-200'}`}>
                        <AvatarImage src={userData?.avatar_url} alt="User Avatar" />
                        <AvatarFallback className={`text-white text-xs font-semibold ${userData?.role === 'admin' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-teal-600'}`}>
                            {getInitials(userData?.name || '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                            {userData?.name || 'Loading...'}
                        </p>
                        <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 h-4 mt-0.5 font-medium ${
                                userData?.role === 'admin'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                        >
                            {userData?.role === 'admin' ? 'Admin' : 'Siswa'}
                        </Badge>
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