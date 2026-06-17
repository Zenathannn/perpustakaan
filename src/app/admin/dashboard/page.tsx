"use client";

import React, { useState, useEffect } from "react";
import {
    BookOpen, BookCheck, BookX, CalendarRange, TrendingUp, Star,
    PieChart as PieChartIcon, Clock, Users, AlertTriangle, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";

interface AdminDashboardStats {
    totalBooks: number;
    borrowedBooks: number;
    availableBooks: number;
    monthlyLoans: number;
    overdueLoans: number;
    totalMembers: number;
    topBooks: { title: string; total_borrowed: number }[];
    newBooks: { title: string; author: string; created_at: string; cover_url: string | null }[];
    monthlyTrend: { month: string; loans: number }[];
    recentLoans: { id: number; borrower_name: string; due_date: string; returned: boolean; books?: { title: string } }[];
}

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardStats>({
        totalBooks: 0, borrowedBooks: 0, availableBooks: 0,
        monthlyLoans: 0, overdueLoans: 0, totalMembers: 0,
        topBooks: [], newBooks: [], monthlyTrend: [], recentLoans: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dashboard");
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setStats({
                    totalBooks: data.totalBooks || 0,
                    borrowedBooks: data.borrowedBooks || 0,
                    availableBooks: data.availableBooks || 0,
                    monthlyLoans: data.monthlyLoans || 0,
                    overdueLoans: data.overdueLoans || 0,
                    totalMembers: data.totalMembers || 0,
                    topBooks: data.topBooks || [],
                    newBooks: data.newBooks || [],
                    monthlyTrend: data.monthlyTrend || [],
                    recentLoans: data.recentLoans || [],
                });
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name.split(" ").map(p => p.charAt(0).toUpperCase()).join("").slice(0, 2);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data dashboard admin...</p>
                </div>
            </div>
        );
    }

    const pieData = [
        { name: "Tersedia", value: stats.availableBooks, color: "#10B981" },
        { name: "Dipinjam", value: stats.borrowedBooks, color: "#3B82F6" },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Dashboard Admin
                </h1>

                {/* Alert for overdue */}
                {stats.overdueLoans > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-red-800 font-semibold text-sm">
                                {stats.overdueLoans} peminjaman melewati jatuh tempo!
                            </p>
                            <p className="text-red-600 text-xs mt-0.5">
                                Segera hubungi anggota terkait untuk pengembalian buku.
                            </p>
                        </div>
                        <Link href="/admin/peminjaman" className="ml-auto">
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 cursor-pointer hover:bg-red-200 transition-colors text-xs whitespace-nowrap flex items-center gap-1">
                                Cek Sekarang <ChevronRight className="h-3 w-3" />
                            </Badge>
                        </Link>
                    </div>
                )}

                {/* Stat Cards Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Buku</CardTitle>
                            <div className="bg-blue-100 p-2 rounded-lg"><BookOpen className="h-4 w-4 text-blue-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalBooks}</div>
                            <p className="text-xs text-muted-foreground mt-1">Koleksi perpustakaan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dipinjam</CardTitle>
                            <div className="bg-amber-100 p-2 rounded-lg"><BookCheck className="h-4 w-4 text-amber-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.borrowedBooks}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.totalBooks > 0 ? ((stats.borrowedBooks / stats.totalBooks) * 100).toFixed(1) : 0}% dari total koleksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tersedia</CardTitle>
                            <div className="bg-green-100 p-2 rounded-lg"><BookX className="h-4 w-4 text-green-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.availableBooks}</div>
                            <p className="text-xs text-muted-foreground mt-1">Siap dipinjam</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Peminjaman Bulan Ini</CardTitle>
                            <div className="bg-purple-100 p-2 rounded-lg"><CalendarRange className="h-4 w-4 text-purple-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.monthlyLoans}</div>
                            <p className="text-xs text-muted-foreground mt-1">Aktivitas bulan ini</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Terlambat Kembali</CardTitle>
                            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${stats.overdueLoans > 0 ? "text-red-600" : "text-gray-400"}`}>
                                {stats.overdueLoans}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Perlu tindak lanjut</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Anggota</CardTitle>
                            <div className="bg-indigo-100 p-2 rounded-lg"><Users className="h-4 w-4 text-indigo-600" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-indigo-600">{stats.totalMembers}</div>
                            <p className="text-xs text-muted-foreground mt-1">Siswa terdaftar</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="border-0 bg-white rounded-2xl shadow-lg lg:col-span-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    Tren Peminjaman
                                </CardTitle>
                                <Badge variant="outline">3 Bulan Terakhir</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {stats.monthlyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={stats.monthlyTrend}>
                                        <defs>
                                            <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                                        <Area type="monotone" dataKey="loans" name="Peminjaman" stroke="#3B82F6" strokeWidth={2} fill="url(#colorLoans)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[280px] text-gray-500">Belum ada data</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-green-500" />
                                    Ketersediaan
                                </CardTitle>
                                <Badge variant="outline">Status</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                        paddingAngle={5} dataKey="value" nameKey="name"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={true}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} buku`, "Jumlah"]}
                                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom: Top Buku + Peminjaman Terbaru */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top 5 Buku Terpopuler */}
                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Top 5 Buku Terpopuler
                                </CardTitle>
                                <Badge variant="outline">Paling sering dipinjam</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {stats.topBooks.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.topBooks.map((book, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="flex-1 text-sm font-medium text-gray-800 truncate">{book.title}</span>
                                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0">
                                                {book.total_borrowed}x
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada data</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Peminjaman Terbaru */}
                    <Card className="border-0 bg-white rounded-2xl shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    Peminjaman Terbaru
                                </CardTitle>
                                <Link href="/admin/peminjaman">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1">
                                        Kelola <ChevronRight className="h-3 w-3" />
                                    </Badge>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {stats.recentLoans.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recentLoans.map((loan) => {
                                        const isOverdue = !loan.returned && new Date(loan.due_date) < new Date();
                                        const statusColor = loan.returned
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : isOverdue
                                                ? "bg-red-100 text-red-700 border-red-200"
                                                : "bg-amber-100 text-amber-700 border-amber-200";
                                        const statusLabel = loan.returned ? "Kembali" : isOverdue ? "Terlambat" : "Aktif";
                                        return (
                                            <div key={loan.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                                <Avatar className="h-9 w-9 flex-shrink-0">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium">
                                                        {getInitials(loan.borrower_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{loan.borrower_name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{loan.books?.title || "—"}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{formatDate(loan.due_date)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada peminjaman</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}