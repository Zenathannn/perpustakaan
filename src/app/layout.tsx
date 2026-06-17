import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";

import ClientLayout from "@/components/layout/ClientLayout";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Tambah weight lebih lengkap
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perpustakaan Digital",
  description: "Aplikasi manajemen perpustakaan digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={`${poppins.variable} antialiased font-sans`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}