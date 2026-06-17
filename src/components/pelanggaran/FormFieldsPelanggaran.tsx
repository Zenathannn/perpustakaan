'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import type { Siswa } from '@/types';

const TINGKAT_OPTIONS = ['Ringan', 'Sedang', 'Berat'] as const;
const STATUS_OPTIONS = ['Aktif', 'Selesai'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface PelanggaranFormData {
    siswa_id: number;
    jenis_pelanggaran: string;
    tingkat: string;
    poin: number;
    tanggal: string;
    waktu: string;
    lokasi: string;
    deskripsi: string;
    status: string;
    tindakan: string | null;
    tanggal_tindak_lanjut: string | null;
    catatan: string | null;
    url: string | null;
    dilaporkan_oleh: string;
}

interface FormFieldsPelanggaranProps {
    form: PelanggaranFormData;
    onChange: <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => void;
    dataSiswa?: Siswa[];
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    previewUrl?: string;
    onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile?: () => void;
    showSiswaField?: boolean;
    showOptionalFields?: boolean;
    showFileUpload?: boolean;
    isDetailView?: boolean; // New prop untuk mode detail view
}

export function FormFieldsPelanggaran({
    form,
    onChange,
    dataSiswa = [],
    searchQuery = '',
    onSearchChange,
    previewUrl,
    onFileChange,
    onRemoveFile,
    showSiswaField = true,
    showOptionalFields = false,
    showFileUpload = true,
    isDetailView = false,
}: FormFieldsPelanggaranProps) {
    const filteredSiswa = useMemo(() => {
        if (!searchQuery.trim() || !dataSiswa.length) return dataSiswa;
        const query = searchQuery.toLowerCase();
        return dataSiswa.filter(siswa =>
            siswa.nama.toLowerCase().includes(query) ||
            siswa.nis.toLowerCase().includes(query)
        );
    }, [dataSiswa, searchQuery]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert('Ukuran file terlalu besar. Maximal 5mb.');
            e.target.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar.');
            e.target.value = '';
            return;
        }

        onFileChange?.(e);
    };

    return (
        <div className="space-y-4">
            {showSiswaField && (
                <div className="space-y-2">
                    <Label htmlFor="siswa" className="text-sm font-medium">
                        Siswa <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="siswa"
                            placeholder="Ketik nama atau NIS siswa..."
                            value={searchQuery}
                            onChange={(e) => {
                                onSearchChange?.(e.target.value);
                                onChange('siswa_id', 0);
                            }}
                            className="pl-9 w-full rounded-[5px]"
                        />
                    </div>
                    {searchQuery && !form.siswa_id && (
                        <div className="max-h-48 overflow-y-auto border rounded-[5px] bg-white shadow-lg">
                            {filteredSiswa.length > 0 ? (
                                filteredSiswa.map((siswa) => (
                                    <button
                                        key={siswa.id}
                                        type="button"
                                        onClick={() => {
                                            onChange('siswa_id', siswa.id);
                                            onSearchChange?.(`${siswa.nama} - ${siswa.nis}`);
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b last:border-b-0 ${form.siswa_id === siswa.id ? 'bg-blue-100' : ''
                                            }`}
                                    >
                                        <div className="font-medium text-sm">{siswa.nama}</div>
                                        <div className="text-xs text-gray-500">{siswa.nis}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">Tidak ada siswa ditemukan.</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jenis" className="text-sm font-medium">
                        Jenis Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="jenis"
                        value={form.jenis_pelanggaran || ''}
                        onChange={e => onChange('jenis_pelanggaran', e.target.value)}
                        placeholder="contoh: Terlambat, Tidak berseragam"
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tingkat" className="text-sm font-medium">
                        Tingkat Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                        value={form.tingkat || ''} 
                        onValueChange={v => onChange('tingkat', v)}
                        disabled={isDetailView}
                    >
                        <SelectTrigger id="tingkat" className="w-full rounded-[5px]">
                            <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                        <SelectContent className='bg-white rounded-[5px] shadow-[5px]'>
                            {TINGKAT_OPTIONS.map(tingkat => (
                                <SelectItem
                                    key={tingkat} value={tingkat}
                                    className='cursor-pointer hover:bg-gray-50 focus:bg-blue-50 transition-colors rounded-[5px]'
                                >
                                    {tingkat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="poin" className="text-sm font-medium">
                        Poin Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="poin"
                        type="number"
                        min="0"
                        value={form.poin || 0}
                        onChange={e => onChange('poin', parseInt(e.target.value) || 0)}
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tanggal" className="text-sm font-medium">
                        Tanggal Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="tanggal"
                        type="date"
                        value={form.tanggal || ''}
                        onChange={e => onChange('tanggal', e.target.value)}
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="waktu" className="text-sm font-medium">
                        Waktu Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="waktu"
                        type="time"
                        value={form.waktu || ''}
                        onChange={e => onChange('waktu', e.target.value)}
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lokasi" className="text-sm font-medium">
                        Lokasi Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lokasi"
                        value={form.lokasi || ''}
                        onChange={e => onChange('lokasi', e.target.value)}
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dilaporkan_oleh" className="text-sm font-medium">
                        Dilaporkan Oleh <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="dilaporkan_oleh"
                        value={form.dilaporkan_oleh || ''}
                        onChange={e => onChange('dilaporkan_oleh', e.target.value)}
                        placeholder="Nama pelapor (Guru/Staff)"
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deskripsi" className="text-sm font-medium">
                        Deskripsi
                    </Label>
                    <Input
                        id="deskripsi"
                        value={form.deskripsi || ''}
                        onChange={e => onChange('deskripsi', e.target.value)}
                        placeholder="Deskripsi detail pelanggaran"
                        className="w-full rounded-[5px]"
                        readOnly={isDetailView}
                    />
                </div>

                {showOptionalFields && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="tindakan" className="text-sm font-medium">
                                Tindakan
                            </Label>
                            <Input
                                id="tindakan"
                                value={form.tindakan || ''}
                                onChange={e => onChange('tindakan', e.target.value || null)}
                                placeholder="Tindakan yang diambil"
                                className="w-full rounded-[5px]"
                                readOnly={isDetailView}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tanggal_tindak_lanjut" className="text-sm font-medium">
                                Tanggal Tindak Lanjut
                            </Label>
                            <Input
                                id="tanggal_tindak_lanjut"
                                type="date"
                                value={form.tanggal_tindak_lanjut || ''}
                                onChange={e => onChange('tanggal_tindak_lanjut', e.target.value || null)}
                                className="w-full rounded-[5px]"
                                readOnly={isDetailView}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="catatan" className="text-sm font-medium">
                                Catatan
                            </Label>
                            <Input
                                id="catatan"
                                value={form.catatan || ''}
                                onChange={e => onChange('catatan', e.target.value || null)}
                                className="w-full rounded-[5px]"
                                readOnly={isDetailView}
                            />
                        </div>
                    </>
                )}

                {showFileUpload && (
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium">
                            Foto Bukti <span className="text-gray-500 text-xs">(Opsional)</span>
                        </Label>
                        {previewUrl ? (
                            <div className="relative w-full h-64 border-2 border-gray-200 rounded-[5px] overflow-hidden">
                                <Image
                                    src={previewUrl}
                                    alt="preview"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                                {!isDetailView && (
                                    <button
                                        type="button"
                                        onClick={onRemoveFile}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : !isDetailView ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-[5px] p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Klik untuk upload foto bukti
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF, WEBP (max 5mb)
                                    </p>
                                </label>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export { TINGKAT_OPTIONS, STATUS_OPTIONS, MAX_FILE_SIZE };