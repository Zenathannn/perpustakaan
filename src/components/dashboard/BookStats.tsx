"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BookOpen, BookCheck, BookX, CalendarRange } from "lucide-react";

interface BookStatsProps {
    totalBooks: number;
    borrowedBooks: number;
    availableBooks: number;
    monthlyLoans: number;
}

export default function BookStats({ totalBooks, borrowedBooks, availableBooks, monthlyLoans }: BookStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-white rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Buku</CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{totalBooks}</div>
                    <p className="text-xs text-muted-foreground mt-1">Koleksi perpustakaan</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-white rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Dipinjam</CardTitle>
                    <BookCheck className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{borrowedBooks}</div>
                    <p className="text-xs text-muted-foreground mt-1">Sedang dipinjam</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-white rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tersedia</CardTitle>
                    <BookX className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{availableBooks}</div>
                    <p className="text-xs text-muted-foreground mt-1">Siap dipinjam</p>
                </CardContent>
            </Card>

            <Card className="border-0 bg-white rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Peminjaman Bulan Ini</CardTitle>
                    <CalendarRange className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{monthlyLoans}</div>
                    <p className="text-xs text-muted-foreground mt-1">Aktivitas terkini</p>
                </CardContent>
            </Card>
        </div>
    );
}