"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Path yang menggunakan layout
  const useLayoutPaths = [
    "/siswa",
    "/admin",
  ];

  // Path tanpa layout (auth pages)
  const noLayoutPaths = [
    "/auth/login",
    "/auth/register",
  ];

  // Jika path termasuk no layout, return children tanpa layout
  if (noLayoutPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // Cek apakah path saat ini menggunakan AppLayout
  const useAppLayout = useLayoutPaths.some((path) => pathname.startsWith(path));

  // Jika menggunakan AppLayout, wrap dengan AppLayout
  if (useAppLayout) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Default: return children tanpa layout
  return <>{children}</>;
}