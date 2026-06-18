import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        // Total Buku
        const { count: totalBooks } = await supabase
            .from("books")
            .select("*", { count: "exact", head: true });

        // Buku Dipinjam (sedang aktif)
        const { data: borrowedData } = await supabase
            .from("loans")
            .select("book_id")
            .eq("returned", false);
        const borrowedBooks = borrowedData?.length || 0;
        const availableBooks = (totalBooks || 0) - borrowedBooks;

        // Peminjaman terlambat
        const { count: overdueLoans } = await supabase
            .from("loans")
            .select("*", { count: "exact", head: true })
            .eq("returned", false)
            .lt("due_date", today);

        // Peminjaman bulan ini
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const { count: monthlyLoans } = await supabase
            .from("loans")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString().split("T")[0]);

        // Total anggota (profile dengan role member)
        const { count: totalMembers } = await supabase
            .from("profile")
            .select("*", { count: "exact", head: true })
            .eq("role", "member");

        // Top 5 Buku Terpopuler
        const { data: topBooksRaw } = await supabase
            .from("loans")
            .select("books (title)")
            .not("books", "is", null);

        const bookCount: { [key: string]: number } = {};
        topBooksRaw?.forEach((loan: any) => {
            const title = loan.books?.title;
            if (title) bookCount[title] = (bookCount[title] || 0) + 1;
        });
        const topBooks = Object.entries(bookCount)
            .map(([title, total_borrowed]) => ({ title, total_borrowed }))
            .sort((a, b) => b.total_borrowed - a.total_borrowed)
            .slice(0, 5);

        // Tren 3 bulan terakhir
        const monthlyTrend = [];
        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString("id-ID", { month: "short" });
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0];
            const { count } = await supabase
                .from("loans")
                .select("*", { count: "exact", head: true })
                .gte("created_at", startDate)
                .lte("created_at", endDate);
            monthlyTrend.push({ month: monthName, loans: count || 0 });
        }

        // 5 Buku Baru
        const { data: newBooks } = await supabase
            .from("books")
            .select("title, author, created_at, cover_url, category_id, categories (id, name)")
            .order("created_at", { ascending: false })
            .limit(5);

        // 5 Peminjaman Terbaru (untuk admin)
        const { data: recentLoans } = await supabase
            .from("loans")
            .select("id, borrower_name, due_date, returned, books (title)")
            .order("created_at", { ascending: false })
            .limit(5);

        return NextResponse.json({
            totalBooks: totalBooks || 0,
            borrowedBooks,
            availableBooks,
            monthlyLoans: monthlyLoans || 0,
            overdueLoans: overdueLoans || 0,
            totalMembers: totalMembers || 0,
            topBooks,
            monthlyTrend,
            newBooks: newBooks || [],
            recentLoans: recentLoans || [],
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}