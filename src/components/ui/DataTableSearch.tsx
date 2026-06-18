// components/ui/DataTableSearch.tsx
'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DataTableSearchProps {
    placeholder: string
    value: string
    onChange: (value: string) => void
    className?: string
}

export default function DataTableSearch({ placeholder, value, onChange, className }: DataTableSearchProps) {
    return (
        <div className={`relative w-full sm:w-80 ${className || ''}`}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
    )
}