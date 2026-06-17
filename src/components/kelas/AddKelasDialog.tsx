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
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddKelasDialog({
    open,
    setOpen,
    form,
    handleChange,
    handleAdd,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    form: {kelas: string};
    handleChange: (key: string, value: string) => void;
    handleAdd: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="text-white bg-blue-600 hover:bg-blue-700 rounded-[5px]">Tambah Kelas</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-full bg-gray-200 rounded-[10px]">
            <DialogHeader>
                <DialogTitle>Tambah Kelas</DialogTitle>
                <DialogDescription>
                    Silahkan masukkan data kelas baru.
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
                <Button className="rounded-[10px]" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="rounded-[10px] bg-blue-500 text-white hover:bg-blue-600 transition-colors" onClick={handleAdd}>Tambah</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}