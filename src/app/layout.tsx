import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import ClientLayout from "@/components/layout/ClientLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"], 
});

export const metadata: Metadata = {
  title: "Manajemen Siswa",
  description: "Aplikasi manajemen siswa rpl kelas industri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id"> 
      <body 
        className={`${poppins.variable} antialiased`}
      > 
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}