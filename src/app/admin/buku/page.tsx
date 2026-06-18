// app/dashboard/buku/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Book, BookInput, Category } from '@/types'
import BookTable from '@/components/buku/BookTable'
import BookForm from '@/components/buku/BookForm'
import DataTableSearch from '@/components/ui/DataTableSearch'
import DataTableSort from '@/components/ui/DataTableSort'
import DataTablePagination from '@/components/ui/DataTablePagination'

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editingBook, setEditingBook] = useState<Book | null>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('id-asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [categoryFilter, setCategoryFilter] = useState('')
    const [categories, setCategories] = useState<Category[]>([])

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*, categories (id, name)')
                .order('id', { ascending: true })

            if (error) throw error
            setBooks(data || [])
        } catch (error) {
            console.error('Error fetching books:', error)
            alert('Gagal mengambil data buku')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })
        if (data) setCategories(data)
    }

    useEffect(() => {
        fetchBooks()
        fetchCategories()
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

        if (categoryFilter) {
            result = result.filter((book) => book.category_id === Number(categoryFilter))
        }

        const [field, order] = sortBy.split('-')
        result.sort((a, b) => {
            let aVal: any = a[field as keyof Book]
            let bVal: any = b[field as keyof Book]

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
    }, [books, searchQuery, sortBy, categoryFilter])

    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredAndSortedBooks.slice(start, end)
    }, [filteredAndSortedBooks, currentPage, itemsPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, itemsPerPage])

    const handleCreate = async (data: BookInput) => {
        const { error } = await supabase.from('books').insert([data])
        if (error) throw error
        await fetchBooks()
    }

    const handleUpdate = async (data: BookInput) => {
        if (!editingBook) return
        const { error } = await supabase
            .from('books')
            .update(data)
            .eq('id', editingBook.id)
        if (error) throw error
        await fetchBooks()
        setEditingBook(null)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus buku ini?')) return

        const { error } = await supabase.from('books').delete().eq('id', id)
        if (error) throw error
        await fetchBooks()
    }

    const handleSubmit = async (data: BookInput) => {
        if (editingBook) {
            await handleUpdate(data)
        } else {
            await handleCreate(data)
        }
    }

    const sortOptions = [
        { value: 'id-asc', label: 'ID (Terbaru)' },
        { value: 'id-desc', label: 'ID (Terlama)' },
        { value: 'title-asc', label: 'Judul (A-Z)' },
        { value: 'title-desc', label: 'Judul (Z-A)' },
        { value: 'author-asc', label: 'Pengarang (A-Z)' },
        { value: 'author-desc', label: 'Pengarang (Z-A)' },
        { value: 'stock-asc', label: 'Stok (Sedikit ke Banyak)' },
        { value: 'stock-desc', label: 'Stok (Banyak ke Sedikit)' },
    ]

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground">Memuat data buku...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-white">Manajemen Buku</h1>
                        <p className="text-blue-100 mt-1">
                            Kelola daftar buku perpustakaan. Tambah, edit, atau hapus koleksi buku di sini.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingBook(null)
                            setFormOpen(true)
                        }}
                        className="bg-white hover:bg-blue-50 text-blue-700 shadow-md flex-shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Tambah Buku</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DataTableSearch
                    placeholder="Cari judul atau pengarang..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="sm:max-w-md"
                />
                <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <DataTableSort
                        options={sortOptions}
                        value={sortBy}
                        onChange={setSortBy}
                    />
                </div>
            </div>

            <BookTable
                books={paginatedBooks}
                onEdit={(book) => {
                    setEditingBook(book)
                    setFormOpen(true)
                }}
                onDelete={handleDelete}
            />

            {filteredAndSortedBooks.length > 0 && (
                <DataTablePagination
                    totalItems={filteredAndSortedBooks.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}

            <BookForm
                open={formOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleSubmit}
                initialData={editingBook}
                title={editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
            />
        </div>
    )
}