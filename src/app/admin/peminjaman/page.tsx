// app/dashboard/peminjaman/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loan, Book } from '@/types'
import LoanTable from '@/components/peminjaman/LoanTable'
import LoanForm from '@/components/peminjaman/LoanForm'
import ReturnButton from '@/components/peminjaman/ReturnButton'
import DataTableSearch from '@/components/ui/DataTableSearch'
import DataTableSort from '@/components/ui/DataTableSort'
import DataTablePagination from '@/components/ui/DataTablePagination'

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('id-asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    const fetchLoans = async () => {
        try {
            const { data, error } = await supabase
                .from('loans')
                .select(`
                    *,
                    books (id, title, author, stock, cover_url)
                `)
                .order('id', { ascending: false })

            if (error) throw error
            setLoans(data || [])
        } catch (error) {
            console.error('Error fetching loans:', error)
            alert('Gagal mengambil data peminjaman')
        } finally {
            setLoading(false)
        }
    }

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .gt('stock', 0)

            if (error) throw error
            setBooks(data || [])
        } catch (error) {
            console.error('Error fetching books:', error)
        }
    }

    useEffect(() => {
        fetchLoans()
        fetchBooks()
    }, [])

    const filteredAndSortedLoans = useMemo(() => {
        let result = [...loans]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (loan) =>
                    loan.borrower_name.toLowerCase().includes(query) ||
                    loan.books?.title.toLowerCase().includes(query)
            )
        }

        const [field, order] = sortBy.split('-')
        result.sort((a, b) => {
            let aVal: any = a[field as keyof Loan]
            let bVal: any = b[field as keyof Loan]

            if (field === 'id') {
                return order === 'asc' ? aVal - bVal : bVal - aVal
            }

            if (typeof aVal === 'string') {
                return order === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            }

            return order === 'asc' ? aVal - bVal : bVal - aVal
        })

        return result
    }, [loans, searchQuery, sortBy])

    const paginatedLoans = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredAndSortedLoans.slice(start, end)
    }, [filteredAndSortedLoans, currentPage, itemsPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, itemsPerPage])

    const handleCreateLoan = async (data: { book_id: number; borrower_name: string; due_date: string }) => {
        const { error } = await supabase.from('loans').insert([{
            ...data,
            borrow_date: new Date().toISOString().split('T')[0]
        }])
        if (error) throw error

        // Update stok buku
        const book = books.find(b => b.id === data.book_id)
        if (book) {
            await supabase
                .from('books')
                .update({ stock: book.stock - 1 })
                .eq('id', data.book_id)
        }

        await fetchLoans()
        await fetchBooks()
    }

    const handleReturn = async (loanId: number, bookId: number) => {
        if (!confirm('Tandai peminjaman ini sebagai dikembalikan?')) return

        const { error } = await supabase
            .from('loans')
            .update({ returned: true })
            .eq('id', loanId)

        if (error) throw error

        // Update stok buku
        const book = books.find(b => b.id === bookId)
        if (book) {
            await supabase
                .from('books')
                .update({ stock: book.stock + 1 })
                .eq('id', bookId)
        }

        await fetchLoans()
        await fetchBooks()
    }

    const sortOptions = [
        { value: 'id-asc', label: 'ID (Terbaru)' },
        { value: 'id-desc', label: 'ID (Terlama)' },
        { value: 'borrower_name-asc', label: 'Peminjam (A-Z)' },
        { value: 'borrower_name-desc', label: 'Peminjam (Z-A)' },
        { value: 'due_date-asc', label: 'Jatuh Tempo (Terdekat)' },
        { value: 'due_date-desc', label: 'Jatuh Tempo (Terjauh)' },
    ]

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground">Memuat data peminjaman...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Peminjaman</h1>
                    <p className="text-muted-foreground">
                        Kelola peminjaman buku perpustakaan di sini.
                    </p>
                </div>
                <Button
                    onClick={() => setFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4 text-white" />
                    <span className='text-white'>Pinjam Buku</span>
                </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DataTableSearch
                    placeholder="Cari peminjam atau judul buku..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
                <DataTableSort
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                />
            </div>

            <LoanTable
                loans={paginatedLoans}
                onReturn={handleReturn}
            />

            {filteredAndSortedLoans.length > 0 && (
                <DataTablePagination
                    totalItems={filteredAndSortedLoans.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}

            <LoanForm
                open={formOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleCreateLoan}
                books={books}
            />
        </div>
    )
}