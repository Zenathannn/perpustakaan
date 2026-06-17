"use client";

import { DataTable } from "@/components/layout/Table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/layout/DeleteDialog";
import { type ColumnDef } from "@tanstack/react-table";
import { Kelas } from "@/types"

export default function KelasTable({
    data,
    handleEditClick,
    handleDelete,
    addDialog
}: {
    data: Kelas[];
    handleEditClick: (kelas: Kelas) => void;
    handleDelete: (id: number) => void;
    addDialog: React.ReactNode;
}) {

    const columns: ColumnDef<Kelas>[] = [
    {
        header: "No",
        cell: ({ row }: any) => <div className="text-center">{row.index + 1}</div>,
    },
    {
        accessorKey: "kelas",
        header: "Nama",
    },
    {
        header: "Aksi",
        cell: ({ row }: any) => {
            const kelas: Kelas = row.original;
            return (
                <div className="flex gap-2 justify-center items-center">
                    <Button onClick={() => handleEditClick(kelas)} className="bg-yellow-300 hover:bg-yellow-400 text-white transition-colors rounded-[5px]">
                        Edit
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-red-500 hover:bg-red-600 transition-colors text-white rounded-[5px]">Hapus</Button>
                        </DialogTrigger>
                        <ConfirmDeleteDialog onConfirm={() => handleDelete(kelas.id)} />
                    </Dialog>
                </div>
            );
        },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      actions={addDialog}
    />
  )
}