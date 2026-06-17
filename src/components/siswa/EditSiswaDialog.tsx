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

export default function EditSiswaDialog({
    open,
    setOpen,
    data,
    handleChange,
    handleUpdate,
    dataKelas
}: any) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto bg-gray-200 rounded-[10px]">
            <DialogHeader>
                <DialogTitle>Edit Siswa</DialogTitle>
                <DialogDescription>
                    Silahkan masukkan data siswa yang ingin di edit.
                </DialogDescription>
            </DialogHeader>
            <FormFields data={data} onChange={handleChange} kelas={dataKelas} />
            <DialogFooter className="flex justify-end gap-2">
                <Button className="rounded-[10px]" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="rounded-[10px] bg-yellow-500 hover:bg-yellow-540 text-white" onClick={handleUpdate}>Simpan</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}