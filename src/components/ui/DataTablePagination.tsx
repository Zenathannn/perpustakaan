// components/ui/DataTablePagination.tsx
'use client'

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTablePaginationProps {
    totalItems: number
    itemsPerPage: number
    currentPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (items: number) => void
}

export default function DataTablePagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onItemsPerPageChange,
}: DataTablePaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg py-2">
            <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Baris per halaman</p>
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
                >
                    <SelectTrigger className="w-20 border-gray-200 bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        {[5, 10, 20, 50].map((size) => (
                            <SelectItem
                                key={size}
                                value={size.toString()}
                                className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                            >
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                    {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-200 bg-white hover:bg-gray-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="border-gray-200 bg-white hover:bg-gray-50"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}