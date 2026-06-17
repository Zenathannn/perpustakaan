// components/peminjaman/LoanTable.tsx
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
import { Loan } from '@/types'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface LoanTableProps {
    loans: Loan[]
    onReturn: (loanId: number, bookId: number) => void
}

export default function LoanTable({ loans, onReturn }: LoanTableProps) {
    const getStatusBadge = (returned: boolean, dueDate: string) => {
        if (returned) {
            return {
                icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
                text: "Dikembalikan",
                className: "bg-green-100 text-green-700 border-green-200"
            }
        }

        const today = new Date()
        const due = new Date(dueDate)
        const isOverdue = due < today

        if (isOverdue) {
            return {
                icon: <AlertCircle className="h-3.5 w-3.5 text-red-600" />,
                text: "Terlambat",
                className: "bg-red-100 text-red-700 border-red-200"
            }
        }

        return {
            icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
            text: "Aktif",
            className: "bg-amber-100 text-amber-700 border-amber-200"
        }
    }

    if (loans.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                    <Clock className="h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium">Tidak ada data peminjaman</p>
                    <p className="text-sm">Belum ada peminjaman buku yang tercatat</p>
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
                            <TableHead className="text-left text-blue-800 font-semibold text-sm py-4">
                                Judul Buku
                            </TableHead>
                            <TableHead className="text-left text-blue-800 font-semibold text-sm py-4">
                                Peminjam
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Tanggal Pinjam
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Jatuh Tempo
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Status
                            </TableHead>
                            <TableHead className="text-center text-blue-800 font-semibold text-sm py-4">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loans.map((loan, index) => {
                            const status = getStatusBadge(loan.returned, loan.due_date)
                            const isEven = index % 2 === 0
                            return (
                                <TableRow
                                    key={loan.id}
                                    className={`border-b border-gray-100 transition-all duration-150 hover:bg-blue-50/30 ${isEven ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                >
                                    <TableCell className="text-center text-gray-700 text-sm py-3">
                                        {loan.id}
                                    </TableCell>
                                    <TableCell className="text-left font-medium text-gray-800 text-sm py-3">
                                        {loan.books?.title || '-'}
                                    </TableCell>
                                    <TableCell className="text-left text-gray-600 text-sm py-3">
                                        {loan.borrower_name}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-600 text-sm py-3">
                                        {new Date(loan.borrow_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-600 text-sm py-3">
                                        {new Date(loan.due_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${status.className}`}>
                                            {status.icon}
                                            <span>{status.text}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {!loan.returned && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onReturn(loan.id, loan.book_id)}
                                                className="inline-flex items-center justify-center gap-1.5 text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all duration-200 rounded-lg shadow-sm px-4 py-1.5 text-sm"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                <span>Kembalikan</span>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}