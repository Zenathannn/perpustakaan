// src/components/ui/DataTableSort.tsx
'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortOption {
    value: string
    label: string
}

interface DataTableSortProps {
    options: SortOption[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export default function DataTableSort({ options, value, onChange, className }: DataTableSortProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <ArrowUpDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[200px] h-10 bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                    <SelectValue placeholder="Urutkan berdasarkan" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer text-gray-700"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}