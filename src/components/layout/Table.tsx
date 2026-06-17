"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, ReactNode, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    placeholder?: string;
    actions?: ReactNode;
    filterByKelas?: ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    placeholder = "Cari...",
    actions,
    filterByKelas,
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: "includesString",
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    const rows = table.getRowModel().rows;
    const hasData = rows.length > 0;
    const totalData = table.getPreFilteredRowModel().rows.length;
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    const TableHeader = useMemo(() => (
        <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {!header.isPlaceholder &&
                              flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    ), [table]);

    const EmptyState = () => (
        <div className="px-4 py-8 text-center text-gray-500">Tidak ada data</div>
    );

    const PaginationButton = ({ onClick, disabled, children, direction }: {
        onClick: () => void;
        disabled: boolean;
        children: ReactNode;
        direction?: 'left' | 'right';
    }) => (
        <button 
          onClick={onClick}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {direction === 'left' && <ChevronLeft size={16} />}
            {children}
            {direction === 'right' && <ChevronRight size={16} />}
        </button>    
    );
 
    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {filterByKelas}
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-w-[120px]"
                    >
                        {[5, 10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    {actions}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-[10px] shadow-sm border bg-white">
                <table className="w-full">
                    {TableHeader}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {hasData ? (
                            rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                          key={cell.id}
                                          className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length}>
                                    <EmptyState />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {hasData ? (
                    rows.map((row) => (
                        <div key={row.id} className="bg-white rounded-[10px] shadow-sm border p-4 space-y-2">
                            {row.getVisibleCells().map((cell) => {
                                const header = typeof cell.column.columnDef.header === "string"
                                    ? cell.column.columnDef.header
                                    : cell.column.id;

                                if (header === "No") return null;

                                return (
                                    <div key={cell.id} className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{header}:</span>
                                        <div className="text-sm text-gray-900 text-right">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                ) : (
                   <EmptyState />
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                    Menampilkan {rows.length} dari {totalData} data
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 w-full sm:w-auto">
                    <PaginationButton
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        direction="left"
                    >
                        Sebelumnya
                    </PaginationButton>
                    <span className="text-sm text-gray-600 px-2">
                        {currentPage} / {totalPages}
                    </span>
                    <PaginationButton
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        direction="right"
                    >
                        Berikutnya
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
}