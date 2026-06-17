"use client";

import {
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogFooter, 
    DialogTitle, 
    DialogTrigger,
    Dialog
} from "../ui/dialog";
import { Button } from "../ui/button";
import FormFields from "../layout/FormFields";
import { Kelas } from "@/types";

export default function AddSiswaDialog({
    open,
    setOpen,
    data,
    handleChange,
    handleAdd,
    dataKelas
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: any;
    handleChange: (key: string, value: string | number) => void;
    handleAdd: () => void;
    dataKelas: Kelas[];
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white">Tambah Siswa</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto bg-gray-200 rounded-[15px]">
            <DialogHeader>
                <DialogTitle>Tambah Siswa</DialogTitle>
                <DialogDescription>
                    Silahkan masukkan data siswa baru.
                </DialogDescription>
            </DialogHeader>
            <FormFields data={data} onChange={handleChange} kelas={dataKelas} />
            <DialogFooter className="flex justify-end gap-2">
                <Button className="rounded-[10px]" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAdd}>Tambah</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}