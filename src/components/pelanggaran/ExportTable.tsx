"use client";

import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pelanggaran } from '@/types';

interface ExportButtonsProps {
    data: Pelanggaran[];
}

export default function ExportTable({ data }: ExportButtonsProps) {
    const exportToExcel = () => {
        const worksheetData = XLSX.utils.json_to_sheet(
            data.map((v) => ({
                ID: v.id,
                "Nama siswa": v.siswa?.nama,
                NIS: v.siswa?.nis,
                Kelas: v.siswa?.kelas?.kelas,
                "Jenis Pelanggaran": v.jenis_pelanggaran,
                Tingkat: v.tingkat,
                Poin: v.poin,
                Tanggal: v.tanggal,
                Waktu: v.waktu,
                Lokasi: v.lokasi,
                Deskripsi: v.deskripsi,
                Status: v.status,
                "Dilaporkan Oleh": v.dilaporkan_oleh,
                "Tanggal Tindak Lanjut": v.tanggal_tindak_lanjut,
                Catatan: v.catatan,
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheetData, 'Pelanggaran');
        XLSX.writeFile(workbook, 'pelanggaran_${new Date().toISOString().slice(0,10)}.xlsx');
    }

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Laporan Data Pelanggaran', 14, 16);

        autoTable(doc, {
            startY: 20,
            head: [[
                "ID", "Nama Siswa", "NIS", "Kelas", "Jenis Pelanggaran",
                "Tingkat", "Poin", "Tanggal", "Waktu", "Lokasi",
                "Deskripsi", "Status", "Dilaporkan Oleh", "Tanggal Tindak Lanjut", "Catatan"
            ]],
            body: data.map((v) => [
                v.id ?? '',
                v.siswa?.nama ?? '',
                v.siswa?.nis ?? '',
                v.siswa?.kelas?.kelas ?? '',
                v.jenis_pelanggaran ?? '',
                v.tingkat ?? '',
                v.poin ?? 0,
                v.tanggal ?? '',
                v.waktu ?? '',
                v.lokasi ?? '',
                v.deskripsi ?? '',
                v.status ?? '',
                v.dilaporkan_oleh ?? '',
                v.tanggal_tindak_lanjut ?? '',
                v.catatan ?? '',
            ]),
            styles: { fontSize: 7 },
        });
        doc.save(`pelanggaran_${new Date().toISOString().slice(0, 10)}.pdf`)
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className='flex items-center gap-1 bg-green-100 text-green-800 hover:bg-screen-200 border-green-200 rounded-[5px]'>
                Export Excel
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className='flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 rounded-[5px]'>
                Export PDF
            </Button>
        </div>
    );
}