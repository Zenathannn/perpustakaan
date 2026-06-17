'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Book } from '@/types'
import { BookOpen, User, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PinjamBookDialogProps {
    book: Book | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function PinjamBookDialog({ book, open, onOpenChange, onSuccess }: PinjamBookDialogProps) {
    const [dueDate, setDueDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    // Max borrow: 30 days
    const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!book || !dueDate) return

        setLoading(true)
        setError('')

        try {
            // Get current user name from profile
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('Tidak bisa mendapatkan data user')

            const { data: profile, error: profileError } = await supabase
                .from('profile')
                .select('nama')
                .eq('id', user.id)
                .single()
            if (profileError || !profile) throw new Error('Tidak bisa mendapatkan profil siswa')

            // Check if book is still available (re-check stock)
            const { data: freshBook } = await supabase
                .from('books')
                .select('stock')
                .eq('id', book.id)
                .single()

            if (!freshBook || freshBook.stock <= 0) {
                throw new Error('Maaf, stok buku ini sudah habis.')
            }

            // Check if user already has an active loan for this book
            const { data: existingLoan } = await supabase
                .from('loans')
                .select('id')
                .eq('book_id', book.id)
                .eq('borrower_name', profile.nama)
                .eq('returned', false)
                .single()

            if (existingLoan) {
                throw new Error('Kamu sudah meminjam buku ini dan belum dikembalikan.')
            }

            // Create the loan
            const { error: loanError } = await supabase.from('loans').insert([{
                book_id: book.id,
                borrower_name: profile.nama,
                borrow_date: today,
                due_date: dueDate,
                returned: false,
            }])
            if (loanError) throw loanError

            // Reduce stock
            const { error: stockError } = await supabase
                .from('books')
                .update({ stock: freshBook.stock - 1 })
                .eq('id', book.id)
            if (stockError) throw stockError

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setDueDate('')
                onOpenChange(false)
                onSuccess()
            }, 1800)
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan, coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (loading) return
        setError('')
        setSuccess(false)
        setDueDate('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Pinjam Buku
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="bg-green-100 rounded-full p-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-800">Peminjaman Berhasil!</p>
                        <p className="text-sm text-gray-500 text-center">Buku berhasil dipinjam. Silakan ambil di perpustakaan.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Book Info */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Buku yang dipinjam</p>
                            <p className="font-bold text-gray-800 text-base leading-tight">{book?.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">oleh {book?.author}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                    (book?.stock || 0) > 0
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                    Stok: {book?.stock || 0} tersedia
                                </span>
                            </div>
                        </div>

                        {/* Borrower name (read only, auto-filled) */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                <User className="h-4 w-4 text-gray-400" />
                                Peminjam
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm">
                                Otomatis terisi sesuai akun kamu
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                Tanggal Pengembalian
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => { setDueDate(e.target.value); setError('') }}
                                min={today}
                                max={maxDate}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Maksimal peminjaman 30 hari dari sekarang.</p>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <DialogFooter className="gap-2 flex-row justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!dueDate || loading || (book?.stock || 0) <= 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </span>
                                ) : 'Konfirmasi Pinjam'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
