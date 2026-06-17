"use client";

import {
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogFooter, 
    DialogTitle, 
    Dialog
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddKelasDialog({
    open,
    setOpen,
    form,
    handleChange,
    handleUpdate,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    form: {kelas: string};
    handleChange: (key: string, value: string) => void;
    handleUpdate: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-full max-w-[min(90vw,300px)] max-h-[calc(100vh-10rem)] overflow-auto bg-white rounded-[10px]">
            <DialogHeader>
                <DialogTitle>Edit Kelas</DialogTitle>
                <DialogDescription>
                    Silahkan masukkan data kelas yang ingin di edit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py=2">
                <Label htmlFor="kelas">Nama kelas</Label>
                <Input
                    className="rounded-[5px]"
                    id="kelas"
                    value={form.kelas}
                    onChange={(e) => handleChange("kelas", e.target.value)}
                    placeholder="Masukan nama kelas"
                />
            </div>
            <DialogFooter className="flex justify-end gap-2">
                <Button className="rounded-[10px] bg-white hover:bg-gray-100 transition-colors" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="rounded-[10px] bg-blue-500 text-white hover:bg-blue-600 transition-colors" onClick={handleUpdate}>Simpan</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}