// components/peminjaman/ReturnButton.tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CheckCircle } from 'lucide-react'

interface ReturnButtonProps {
    loanId: number
    bookId: number
    onReturn: (loanId: number, bookId: number) => Promise<void>
}

export default function ReturnButton({ loanId, bookId, onReturn }: ReturnButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleReturn = async () => {
        if (!confirm('Tandai peminjaman ini sebagai dikembalikan?')) return

        setLoading(true)
        try {
            await onReturn(loanId, bookId)
        } catch (error) {
            console.error('Error returning book:', error)
            alert('Gagal mengembalikan buku')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleReturn}
            disabled={loading}
            className="text-green-600 border-green-300 hover:bg-green-50"
        >
            <CheckCircle className="mr-1 h-3 w-3" />
            {loading ? 'Proses...' : 'Kembalikan'}
        </Button>
    )
}