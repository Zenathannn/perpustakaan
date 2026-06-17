"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation"
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const phatname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter();

    if(phatname === '/auth/register' || phatname === '/auth/login') {
        return children;
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:pl-64">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="p-6">
                        {children}
                    </main>
            </div>
        </div>
    )
}