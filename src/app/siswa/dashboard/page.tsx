"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, BookCheck, Clock, AlertCircle, BookMarked, Star, ChevronRight, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SiswaStats {
  myActiveLoans: number;
  myReturnedLoans: number;
  myOverdueLoans: number;
  totalBooksAvailable: number;
  myLoans: {
    id: number;
    books?: { title: string; author: string; cover_url: string | null };
    borrow_date: string;
    due_date: string;
    returned: boolean;
  }[];
  newBooks: { title: string; author: string; created_at: string; cover_url: string | null; categories?: { id: number; name: string } | null }[];
}

export default function SiswaDashboardPage() {
  const [stats, setStats] = useState<SiswaStats>({
    myActiveLoans: 0,
    myReturnedLoans: 0,
    myOverdueLoans: 0,
    totalBooksAvailable: 0,
    myLoans: [],
    newBooks: [],
  });
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profile")
          .select("nama")
          .eq("id", user.id)
          .single();

        const name = profile?.nama || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Siswa";
        setUserName(name);

        // Get my loans
        const { data: myLoansData } = await supabase
          .from("loans")
          .select(`*, books (title, author, cover_url)`)
          .eq("borrower_name", name)
          .order("created_at", { ascending: false })
          .limit(5);

        const myLoans = myLoansData || [];
        const today = new Date();

        const myActiveLoans = myLoans.filter(l => !l.returned && new Date(l.due_date) >= today).length;
        const myReturnedLoans = myLoans.filter(l => l.returned).length;
        const myOverdueLoans = myLoans.filter(l => !l.returned && new Date(l.due_date) < today).length;

        // Get total available books
        const { count: totalBooks } = await supabase
          .from("books").select("*", { count: "exact", head: true });
        const { data: borrowedData } = await supabase
          .from("loans").select("book_id").eq("returned", false);
        const totalBooksAvailable = (totalBooks || 0) - (borrowedData?.length || 0);

        // Get new books
        const { data: newBooksRaw } = await supabase
          .from("books")
          .select("title, author, created_at, cover_url, categories (id, name)")
          .order("created_at", { ascending: false })
          .limit(5);

        const newBooks = (newBooksRaw || []).map((b: any) => ({
          ...b,
          categories: Array.isArray(b.categories) ? b.categories[0] : b.categories || null,
        }));

        setStats({
          myActiveLoans,
          myReturnedLoans,
          myOverdueLoans,
          totalBooksAvailable,
          myLoans,
          newBooks: newBooks || [],
        });
      } catch (err) {
        console.error("Error fetching siswa dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "B";
    return name.split(" ").map(p => p.charAt(0).toUpperCase()).join("").slice(0, 2);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const getLoanStatus = (loan: { returned: boolean; due_date: string }) => {
    if (loan.returned) return { label: "Dikembalikan", color: "bg-green-100 text-green-700 border-green-200" };
    const isOverdue = new Date(loan.due_date) < new Date();
    return isOverdue
      ? { label: "Terlambat!", color: "bg-red-100 text-red-700 border-red-200" }
      : { label: "Aktif", color: "bg-amber-100 text-amber-700 border-amber-200" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Selamat datang kembali,</p>
              <h1 className="text-2xl font-bold tracking-tight text-white">{userName}</h1>
              <p className="text-blue-200 text-sm mt-1">
                Kamu memiliki <span className="font-bold text-white">{stats.myActiveLoans} buku aktif</span> yang sedang dipinjam
                {stats.myOverdueLoans > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    ⚠ {stats.myOverdueLoans} terlambat!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dipinjam</CardTitle>
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookCheck className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.myActiveLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">Buku aktif pinjaman</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Terlambat</CardTitle>
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.myOverdueLoans > 0 ? "text-red-600" : "text-gray-400"}`}>
                {stats.myOverdueLoans}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Melebihi jatuh tempo</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sudah Dikembalikan</CardTitle>
              <div className="bg-green-100 p-2 rounded-lg">
                <BookMarked className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.myReturnedLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">Total riwayat pengembalian</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buku Tersedia</CardTitle>
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalBooksAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">Siap dipinjam sekarang</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Recent Loans */}
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Peminjaman Terakhir
                </CardTitle>
                <Link href="/siswa/peminjaman">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1">
                    Lihat Semua <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.myLoans.length > 0 ? (
                <div className="space-y-3">
                  {stats.myLoans.slice(0, 5).map((loan) => {
                    const status = getLoanStatus(loan);
                    return (
                      <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                              {getInitials(loan.books?.title || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{loan.books?.title || "—"}</p>
                            <p className="text-xs text-gray-500">Jatuh tempo: {formatDate(loan.due_date)}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 flex-col gap-2">
                  <BookCheck className="h-12 w-12 text-gray-200" />
                  <p className="text-sm">Belum ada riwayat peminjaman</p>
                  <Link href="/siswa/buku">
                    <span className="text-xs text-blue-500 hover:underline cursor-pointer">Cari buku untuk dipinjam →</span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Books */}
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Buku Terbaru
                </CardTitle>
                <Link href="/siswa/buku">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                    Lihat Semua <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.newBooks.length > 0 ? (
                <div className="space-y-3">
                  {stats.newBooks.map((book, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={book.cover_url || undefined} alt={book.title} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-lg">
                            <ImageIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-yellow-500 shadow-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{book.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-gray-500">oleh {book.author}</p>
                          {book.categories && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                              {book.categories.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 flex-col gap-2">
                  <BookOpen className="h-12 w-12 text-gray-200" />
                  <p className="text-sm">Belum ada buku baru</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}