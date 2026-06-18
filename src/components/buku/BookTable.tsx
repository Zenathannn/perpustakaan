// components/buku/BookTable.tsx
'use client'


import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Book } from '@/types'
import { Book as BookIcon } from 'lucide-react'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface BookTableProps {
    books: Book[]
    onEdit?: (book: Book) => void
    onDelete?: (id: number) => void
    hideActions?: boolean
}

export default function BookTable({ books, onEdit, onDelete, hideActions = false }: BookTableProps) {
    if (books.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                    <BookIcon className="h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium">Tidak ada data buku</p>
                    <p className="text-sm">Belum ada buku yang ditambahkan ke perpustakaan</p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200">
                            <TableHead className="w-[70px] text-center text-blue-800 font-semibold text-sm py-4">
                                ID
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Cover
                            </TableHead>
                            <TableHead className="text-left text-blue-800 font-semibold text-sm py-4">
                                Judul Buku
                            </TableHead>
                            <TableHead className="text-left text-blue-800 font-semibold text-sm py-4">
                                Pengarang
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Kategori
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Stok
                            </TableHead>
                            {!hideActions && (
                                <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                    Aksi
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {books.map((book, index) => {
                            const isEven = index % 2 === 0
                            return (
                                <TableRow
                                    key={book.id}
                                    className={`border-b border-gray-100 transition-all duration-150 hover:bg-blue-50/30 ${isEven ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                >
                                    <TableCell className="text-center text-gray-700 text-sm py-3">
                                        {book.id}
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {book.cover_url ? (
                                            <div className="flex justify-center">
                                                <Image
                                                    src={book.cover_url}
                                                    alt={book.title}
                                                    width={40}
                                                    height={50}
                                                    className="rounded-md object-cover border border-gray-200"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400 mx-auto">
                                                No cover
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-left font-medium text-gray-800 text-sm py-3">
                                        {book.title}
                                    </TableCell>
                                    <TableCell className="text-left text-gray-600 text-sm py-3">
                                        {book.author}
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {book.categories ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {book.categories.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${book.stock > 0
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {book.stock}
                                        </span>
                                    </TableCell>
                                    {!hideActions && (
                                        <TableCell className="text-center py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit?.(book)}
                                                    className="inline-flex items-center justify-center gap-1.5 text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 rounded-lg shadow-sm px-4 py-1.5 text-sm"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    <span>Edit</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete?.(book.id)}
                                                    className="inline-flex items-center justify-center gap-1.5 text-red-700 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200 rounded-lg shadow-sm px-4 py-1.5 text-sm"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Hapus</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}