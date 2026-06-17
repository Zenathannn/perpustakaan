'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Book } from '@/types'
import DataTableSearch from '@/components/ui/DataTableSearch'
import DataTableSort from '@/components/ui/DataTableSort'
import DataTablePagination from '@/components/ui/DataTablePagination'
import PinjamBookDialog from '@/components/buku/PinjamBookDialog'
import { BookOpen, User as UserIcon, BookMarked } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SiswaBooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('id-asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .order('id', { ascending: true })
            if (error) throw error
            setBooks(data || [])
        } catch (error) {
            console.error('Error fetching books:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const filteredAndSortedBooks = useMemo(() => {
        let result = [...books]
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (book) =>
                    book.title.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query)
            )
        }
        const [field, order] = sortBy.split('-')
        result.sort((a, b) => {
            let aVal: any = a[field as keyof Book]
            let bVal: any = b[field as keyof Book]
            if (field === 'id') return order === 'asc' ? aVal - bVal : bVal - aVal
            if (typeof aVal === 'string') return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            return order === 'asc' ? aVal - bVal : bVal - aVal
        })
        return result
    }, [books, searchQuery, sortBy])

    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedBooks.slice(start, start + itemsPerPage)
    }, [filteredAndSortedBooks, currentPage, itemsPerPage])

    useEffect(() => { setCurrentPage(1) }, [searchQuery, itemsPerPage])

    const handlePinjam = (book: Book) => {
        setSelectedBook(book)
        setDialogOpen(true)
    }

    const handlePinjamSuccess = () => {
        fetchBooks() // Refresh stock
    }

    const getInitials = (name: string) => {
        if (!name) return 'B'
        return name.split(' ').map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2)
    }

    const sortOptions = [
        { value: 'id-asc', label: 'Terbaru Ditambahkan' },
        { value: 'id-desc', label: 'Terlama Ditambahkan' },
        { value: 'title-asc', label: 'Judul (A-Z)' },
        { value: 'title-desc', label: 'Judul (Z-A)' },
        { value: 'author-asc', label: 'Pengarang (A-Z)' },
        { value: 'author-desc', label: 'Pengarang (Z-A)' },
        { value: 'stock-desc', label: 'Stok Terbanyak' },
        { value: 'stock-asc', label: 'Stok Tersedikit' },
    ]

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-muted-foreground text-sm">Memuat katalog buku...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Katalog Buku</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Temukan dan pinjam buku yang kamu inginkan. Tersedia <span className="font-semibold text-blue-600">{books.filter(b => b.stock > 0).length}</span> buku siap dipinjam.
                </p>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DataTableSearch
                    placeholder="Cari judul atau pengarang..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
                <DataTableSort
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                />
            </div>

            {/* Results Count */}
            {searchQuery && (
                <p className="text-sm text-gray-500">
                    Ditemukan <span className="font-semibold">{filteredAndSortedBooks.length}</span> buku untuk &quot;{searchQuery}&quot;
                </p>
            )}

            {/* Book Grid */}
            {paginatedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <BookOpen className="h-16 w-16 text-gray-200 mb-3" />
                    <p className="text-lg font-medium">Tidak ada buku ditemukan</p>
                    <p className="text-sm mt-1">Coba kata kunci yang berbeda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {paginatedBooks.map((book) => (
                        <div
                            key={book.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                        >
                            {/* Cover */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                                {book.cover_url ? (
                                    <Image
                                        src={book.cover_url}
                                        alt={book.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-blue-300">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                                            {getInitials(book.title)}
                                        </div>
                                        <BookMarked className="h-5 w-5 opacity-40" />
                                    </div>
                                )}
                                {/* Stock badge overlay */}
                                <div className="absolute top-2 right-2">
                                    <Badge
                                        className={`text-xs font-semibold shadow-sm ${
                                            book.stock > 0
                                                ? 'bg-green-500 text-white border-0'
                                                : 'bg-red-500 text-white border-0'
                                        }`}
                                    >
                                        {book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-1" title={book.title}>
                                    {book.title}
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                                    <UserIcon className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{book.author}</span>
                                </p>

                                {/* Pinjam Button */}
                                <div className="mt-auto">
                                    <Button
                                        onClick={() => handlePinjam(book)}
                                        disabled={book.stock <= 0}
                                        size="sm"
                                        className={`w-full rounded-xl text-sm font-medium transition-all ${
                                            book.stock > 0
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {book.stock > 0 ? (
                                            <>
                                                <BookOpen className="h-4 w-4 mr-1.5" />
                                                Pinjam Buku
                                            </>
                                        ) : (
                                            'Stok Habis'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredAndSortedBooks.length > 0 && (
                <DataTablePagination
                    totalItems={filteredAndSortedBooks.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}

            {/* Pinjam Dialog */}
            <PinjamBookDialog
                book={selectedBook}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handlePinjamSuccess}
            />
        </div>
    )
}
