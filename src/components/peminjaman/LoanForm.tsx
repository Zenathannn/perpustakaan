// src/components/loans/LoanForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Book } from '@/types'
import { LoanInput } from '@/types'

interface LoanFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: LoanInput) => Promise<void>
    books: Book[]
}

export default function LoanForm({ open, onOpenChange, onSubmit, books }: LoanFormProps) {
    const [formData, setFormData] = useState<LoanInput>({
        book_id: 0,
        borrower_name: '',
        due_date: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            const defaultDueDate = new Date()
            defaultDueDate.setDate(defaultDueDate.getDate() + 7)
            setFormData({
                book_id: 0,
                borrower_name: '',
                due_date: defaultDueDate.toISOString().split('T')[0]
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.book_id || !formData.borrower_name || !formData.due_date) {
            alert('Harap isi semua field!')
            return
        }

        setLoading(true)
        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (error) {
            console.error('Error creating loan:', error)
            alert('Gagal meminjam buku. Mungkin stok sedang habis?')
        } finally {
            setLoading(false)
        }
    }

    const availableBooks = books.filter(book => book.stock > 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 p-0 gap-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl">Form Peminjaman Buku</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Isi data peminjaman buku di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Pilih Buku</Label>
                        <Select
                            value={formData.book_id.toString()}
                            onValueChange={(value) => setFormData({ ...formData, book_id: parseInt(value) })}
                        >
                            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                                <SelectValue placeholder="Pilih buku yang tersedia..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                                {availableBooks.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">
                                        Tidak ada buku yang tersedia
                                    </div>
                                ) : (
                                    availableBooks.map((book) => (
                                        <SelectItem
                                            key={book.id}
                                            value={book.id.toString()}
                                            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <span className="font-medium text-gray-700">{book.title}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    Stok: {book.stock}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="borrower_name" className="text-sm font-medium">
                            Nama Peminjam
                        </Label>
                        <Input
                            id="borrower_name"
                            value={formData.borrower_name}
                            onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                            placeholder="Contoh: Ahmad Fauzan"
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date" className="text-sm font-medium">
                            Tanggal Kembali
                        </Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            required
                        />
                        <p className="text-xs text-gray-400">
                            Maksimal peminjaman biasanya 7-14 hari
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-200 hover:bg-gray-50 bg-white"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || availableBooks.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? 'Memproses...' : 'Pinjam Buku'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}