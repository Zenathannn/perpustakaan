'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Loan } from '@/types'
import LoanTable from '@/components/peminjaman/LoanTable'
import DataTableSearch from '@/components/ui/DataTableSearch'
import DataTableSort from '@/components/ui/DataTableSort'
import DataTablePagination from '@/components/ui/DataTablePagination'
import { BookCheck } from 'lucide-react'

export default function SiswaLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('id-asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    const fetchLoans = async () => {
        try {
            // Get current user to filter loans
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error("Gagal mendapatkan data user");

            const { data: profile } = await supabase
                .from('profile')
                .select('nama')
                .eq('id', user.id)
                .single();

            const userName = profile?.nama || user.user_metadata?.name || user.user_metadata?.full_name || '';

            const { data, error } = await supabase
                .from('loans')
                .select(`
                    *,
                    books (id, title, author, stock, cover_url)
                `)
                .eq('borrower_name', userName)
                .order('id', { ascending: false })

            if (error) throw error
            setLoans(data || [])
        } catch (error) {
            console.error('Error fetching loans:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLoans()
    }, [])

    const filteredAndSortedLoans = useMemo(() => {
        let result = [...loans]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (loan) =>
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

    const sortOptions = [
        { value: 'id-asc', label: 'ID (Terbaru)' },
        { value: 'id-desc', label: 'ID (Terlama)' },
        { value: 'due_date-asc', label: 'Jatuh Tempo (Terdekat)' },
        { value: 'due_date-desc', label: 'Jatuh Tempo (Terjauh)' },
    ]

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground">Memuat riwayat peminjaman...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        <BookCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Riwayat Peminjaman</h1>
                        <p className="text-blue-100 mt-1">
                            Lihat daftar buku yang sedang atau pernah kamu pinjam. Pantau status dan jatuh tempo peminjamanmu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DataTableSearch
                    placeholder="Cari judul buku..."
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
                hideActions={true}
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
        </div>
    )
}
