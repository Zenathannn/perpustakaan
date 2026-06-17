"use client";

import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Pelanggaran } from "@/types";
import { FormFieldsPelanggaran, type PelanggaranFormData } from "@/components/pelanggaran/FormFieldsPelanggaran";

interface EditPelanggaranDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    violation: Pelanggaran | null;
    onUpdate: (violation: Pelanggaran) => void
}

export default function EditPelanggaranDialog({
    open, onOpenChange, violation, onUpdate
}: EditPelanggaranDialogProps) {
    const [form, setForm] = useState<PelanggaranFormData>({
        siswa_id: 0,
        jenis_pelanggaran: '',
        tingkat: '',
        poin: 0,
        tanggal: '',
        waktu: '',
        lokasi: '',
        deskripsi: '',
        dilaporkan_oleh: '',
        status: 'Aktif',
        tindakan: null,
        tanggal_tindak_lanjut: null,
        catatan: null,
        url: null,
    });

    useEffect(() => {
        if (violation) {
            setForm({
                siswa_id: violation.siswa_id,
                jenis_pelanggaran: violation.jenis_pelanggaran,
                tingkat: violation.tingkat,
                poin: violation.poin,
                tanggal: violation.tanggal,
                waktu: violation.waktu,
                lokasi: violation.lokasi,
                deskripsi: violation.deskripsi,
                dilaporkan_oleh: violation.dilaporkan_oleh || '',
                status: violation.status,
                tindakan: violation.tindakan || null,
                tanggal_tindak_lanjut: violation.tanggal_tindak_lanjut || null,
                catatan: violation.catatan || null,
                url: violation.url || null,
            });
        }
    }, [violation]);

    const handleChange = <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    const handleSubmit = () => {
        if (!violation) return;
        onUpdate({
            ...violation,
            ...form
        });
        onOpenChange(false);
    };

    if (!violation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[10px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Pelanggaran</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <FormFieldsPelanggaran
                        form={form}
                        onChange={handleChange}
                        showSiswaField={false}
                        showOptionalFields={true}
                        showFileUpload={false}
                    />
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button className="rounded-[5px]" variant="outline">
                            Batal
                        </Button>
                    </DialogClose>
                        <Button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[5px]"
                        >
                            Simpan
                        </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}