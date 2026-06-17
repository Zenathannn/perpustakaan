"use client";

import { useState } from "react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, Upload, ImageIcon } from "lucide-react";
import type { Pelanggaran, Siswa } from "@/types";
import { FormFieldsPelanggaran, type PelanggaranFormData } from "@/components/pelanggaran/FormFieldsPelanggaran";
import { supabase } from "@/lib/supabase";

interface AddPelanggaranDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (violation: Omit<Pelanggaran, 'id' | 'created_at' | 'updated_at' | 'siswa' | 'dilaporkan_oleh_user'>) => Promise<void>;
    dataSiswa: Siswa[];
}

const getInitialForm = (): PelanggaranFormData => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    return {
        siswa_id: 0,
        jenis_pelanggaran: "",
        tingkat: "",
        poin: 0,
        tanggal: today,
        waktu: now,
        lokasi: "",
        deskripsi: "",
        status: "Aktif",
        tindakan: null,
        tanggal_tindak_lanjut: null,
        catatan: null,
        url: null,
        dilaporkan_oleh: "", // Tambahkan field ini
    };
}

export default function AddPelanggaranDialog({
    open, onOpenChange, onAdd, dataSiswa
}: AddPelanggaranDialogProps) {
    const [form, setForm] = useState<PelanggaranFormData>(getInitialForm());
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleChange = <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar (JPG, PNG, dll)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setForm(prev => ({ ...prev, url: null }));
    };

    const resetForm = () => {
        setForm(getInitialForm());
        setSelectedFile(null);
        setPreviewUrl("");
        setSearchQuery("");
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `pelanggaran/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('bukti-pelanggaran')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Error uploading to Supabase:', error);
                
                // If bucket doesn't exist, use base64 as fallback
                if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
                    console.warn('Bucket "bukti-pelanggaran" not found. Using base64 instead.');
                    return await convertToBase64(file);
                }
                
                // For other errors, also fallback to base64
                console.warn('Upload error, falling back to base64');
                return await convertToBase64(file);
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('bukti-pelanggaran')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error in uploadImageToSupabase:', error);
            // Fallback to base64
            return await convertToBase64(file);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.siswa_id || form.siswa_id === 0) {
            alert('Silakan pilih siswa');
            return;
        }
        if (!form.jenis_pelanggaran.trim()) {
            alert('Jenis pelanggaran harus diisi');
            return;
        }
        if (!form.tingkat) {
            alert('Tingkat pelanggaran harus dipilih');
            return;
        }
        if (!form.dilaporkan_oleh || !form.dilaporkan_oleh.trim()) {
            alert('Nama pelapor harus diisi');
            return;
        }

        try {
            setUploading(true);
            let uploadedUrl = null;

            // Upload file if selected
            if (selectedFile) {
                uploadedUrl = await uploadImageToSupabase(selectedFile);
                
                if (!uploadedUrl) {
                    alert("Gagal mengupload gambar. Pelanggaran akan disimpan tanpa gambar.");
                }
            }

            // Prepare data
            const cleanedData = {
                siswa_id: form.siswa_id,
                dilaporkan_oleh: form.dilaporkan_oleh.trim(),
                jenis_pelanggaran: form.jenis_pelanggaran.trim(),
                tingkat: form.tingkat,
                poin: form.poin,
                tanggal: form.tanggal,
                waktu: form.waktu,
                lokasi: form.lokasi.trim() || "",
                deskripsi: form.deskripsi.trim() || "",
                status: form.status,
                tindakan: form.tindakan?.trim() || null,
                tanggal_tindak_lanjut: form.tanggal_tindak_lanjut?.trim() || null,
                catatan: form.catatan?.trim() || null,
                url: uploadedUrl || null,
            };

            await onAdd(cleanedData);
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Gagal menyimpan data: ' + (error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-[5px]">
                    + Tambah Pelanggaran
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[10px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Tambah Pelanggaran</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <FormFieldsPelanggaran
                        form={form}
                        onChange={handleChange}
                        dataSiswa={dataSiswa}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        previewUrl={previewUrl}
                        onFileChange={handleFileChange}
                        onRemoveFile={removeFile}
                        showSiswaField={true}
                        showOptionalFields={false}
                        showFileUpload={false}
                    />

                    {/* Custom File Upload Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Bukti Pelanggaran (Foto)
                        </label>
                        
                        {!previewUrl ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-[5px] p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload-custom"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="file-upload-custom"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-10 h-10 text-gray-400" />
                                    <div className="text-sm text-gray-600">
                                        <span className="text-blue-600 font-medium">Klik untuk upload</span>
                                        {' '}atau drag and drop
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        PNG, JPG, JPEG hingga 5MB
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div className="relative border-2 border-gray-200 rounded-[5px] p-4 bg-gray-50">
                                <div className="relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                                        disabled={uploading}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="truncate flex-1">{selectedFile?.name}</span>
                                    <span className="text-gray-400">
                                        ({((selectedFile?.size || 0) / 1024).toFixed(0)} KB)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button 
                            className="rounded-[5px]" 
                            variant="outline" 
                            onClick={resetForm} 
                            disabled={uploading}
                        >
                            Batal
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700 rounded-[5px] text-white"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}