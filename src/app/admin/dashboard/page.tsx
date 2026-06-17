"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, BookCheck, BookX, CalendarRange, TrendingUp, Star, PieChart as PieChartIcon, Clock, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

interface DashboardStats {
  totalBooks: number;
  borrowedBooks: number;
  availableBooks: number;
  monthlyLoans: number;
  topBooks: { title: string; total_borrowed: number }[];
  newBooks: { title: string; author: string; created_at: string; cover_url: string | null }[];
  monthlyTrend: { month: string; loans: number }[];
}

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    borrowedBooks: 0,
    availableBooks: 0,
    monthlyLoans: 0,
    topBooks: [],
    newBooks: [],
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setStats({
          totalBooks: data.totalBooks || 0,
          borrowedBooks: data.borrowedBooks || 0,
          availableBooks: data.availableBooks || 0,
          monthlyLoans: data.monthlyLoans || 0,
          topBooks: data.topBooks || [],
          newBooks: data.newBooks || [],
          monthlyTrend: data.monthlyTrend || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Tersedia", value: stats.availableBooks, color: "#10B981" },
    { name: "Dipinjam", value: stats.borrowedBooks, color: "#3B82F6" },
  ];

  const getInitials = (name: string) => {
    if (!name) return "B";
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard Perpustakaan
        </h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Buku</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">Koleksi perpustakaan</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dipinjam</CardTitle>
              <BookCheck className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.borrowedBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalBooks > 0 ? ((stats.borrowedBooks / stats.totalBooks) * 100).toFixed(1) : 0}% dari total</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tersedia</CardTitle>
              <BookX className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.availableBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">Siap dipinjam</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Peminjaman Bulan Ini</CardTitle>
              <CalendarRange className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.monthlyLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">Aktivitas terkini</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Trend - Area Chart */}
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
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-50" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="loans"
                      name="Peminjaman"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorLoans)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Belum ada data peminjaman
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ketersediaan Buku - Pie Chart */}
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-500" />
                  Ketersediaan Buku
                </CardTitle>
                <Badge variant="outline">Status</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} buku`, "Jumlah"]}
                    contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                     }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Buku (Pie Chart) + Top 5 Buku Baru (List) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 5 Buku Terpopuler - Pie Chart */}
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
              {stats.topBooks && stats.topBooks.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topBooks}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total_borrowed"
                      nameKey="title"
                      label={({ name, percent }) => {
                        const title = typeof name === 'string' ? name : ''
                        const percentValue = typeof percent === 'number' ? percent : 0
                        return `${title.substring(0, 15)}${title.length > 15 ? '...' : ''} (${(percentValue * 100).toFixed(0)}%)`
                      }}
                      labelLine={true}
                    >
                      {stats.topBooks.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                       formatter={(value, name) => [`${value ?? 0} kali dipinjam`, name ?? '']}
                       contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
    }}
/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Belum ada data peminjaman
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Buku Baru Ditambahkan - List Card */}
          <Card className="border-0 bg-white rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-green-500" />
                  Buku Baru Ditambahkan
                </CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700">Terbaru</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {stats.newBooks && stats.newBooks.length > 0 ? (
                <div className="space-y-4">
                  {stats.newBooks.map((book, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-medium">
                              {getInitials(book.title)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-green-500">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{book.title}</p>
                          <p className="text-xs text-gray-500">oleh {book.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {formatDate(book.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <PlusCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>Belum ada buku baru</p>
                    <p className="text-xs mt-1">Tambah buku melalui menu Buku</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}