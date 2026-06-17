"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import InfoSiswa from "@/components/pelanggaran/detail/infoSiswa";
import BuktiPelanggaran from "@/components/pelanggaran/detail/BuktiPelanggaran";
import TindakanDiambil from "@/components/pelanggaran/detail/TindakanDiambil";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Pelanggaran, EvidenceItem } from "@/types";
import { supabase } from "@/lib/supabase";

export default function DetailPelanggaranPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    
    const [violation, setViolation] = useState<Pelanggaran | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ action: "", note: "", followUp: "" });
    const [selectedImage, setSelectedImage] = useState<null | string>(null);

    useEffect(() => {
        if (id) {
            fetchViolationDetail();
        }
    }, [id]);

    const fetchViolationDetail = async () => {
        try {
            setLoading(true);

            if (!id) {
                alert("ID pelanggaran tidak valid");
                router.push("/pelanggaran");
                return;
            }

            // Fetch pelanggaran detail
            const { data: pelanggaranData, error: pelanggaranError } = await supabase
                .from("pelanggarans")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (pelanggaranError) {
                console.error("Error fetching pelanggaran:", pelanggaranError);
                alert("Gagal memuat data pelanggaran: " + pelanggaranError.message);
                router.push("/pelanggaran");
                return;
            }

            if (!pelanggaranData) {
                alert("Data pelanggaran tidak ditemukan");
                router.push("/pelanggaran");
                return;
            }

            // Fetch siswa data with error handling
            let siswaData = null;
            if (pelanggaranData.siswa_id) {
                const { data, error } = await supabase
                    .from("siswas")
                    .select("*")
                    .eq("id", pelanggaranData.siswa_id)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching siswa:", error);
                } else {
                    siswaData = data;
                }
            }

            // Fetch kelas data with error handling
            let kelasData = null;
            if (siswaData?.kelas_id) {
                const { data, error } = await supabase
                    .from("kelas")
                    .select("*")
                    .eq("id", siswaData.kelas_id)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching kelas:", error);
                } else {
                    kelasData = data;
                }
            }

            // Create user data using dilaporkan_oleh as name
            const userData = pelanggaranData.dilaporkan_oleh ? {
                id: pelanggaranData.dilaporkan_oleh,
                name: pelanggaranData.dilaporkan_oleh, // Use actual name from database
                email: "admin@example.com"
            } : null;

            // Combine all data with proper null checks
            const enrichedViolation = {
                ...pelanggaranData,
                siswa: siswaData ? {
                    ...siswaData,
                    kelas: kelasData || null
                } : null,
                dilaporkan_oleh_user: userData
            };

            setViolation(enrichedViolation);
            
            // Set form data jika sudah ada tindakan
            if (enrichedViolation.tindakan || enrichedViolation.catatan || enrichedViolation.tanggal_tindak_lanjut) {
                setFormData({
                    action: enrichedViolation.tindakan || "",
                    note: enrichedViolation.catatan || "",
                    followUp: enrichedViolation.tanggal_tindak_lanjut || ""
                });
            }

        } catch (error) {
            console.error("Error in fetchViolationDetail:", error);
            alert("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
            router.push("/pelanggaran");
        } finally {
            setLoading(false);
        }
    };

    const Evidence: EvidenceItem[] = violation?.url ? [{
        id: 1,
        pelanggaran_id: violation.id,
        tipe: "image",
        url: violation.url,
        deskripsi: "Foto Bukti Pelanggaran",
        nama: "bukti_pelanggaran.jpg",
        diunggah_oleh: violation.dilaporkan_oleh_user?.name || "Admin",
        waktu_unggah: violation.created_at,
        pelanggaran: violation
    }] : [];

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "ringan": return "bg-green-100 text-green-800";
            case "sedang": return "bg-yellow-100 text-yellow-800";
            case "berat": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Aktif": return "bg-orange-100 text-orange-800";
            case "Selesai": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleInputChange = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleActionSubmit = async () => {
        if (!violation) return;

        try {
            const { error } = await supabase
                .from("pelanggarans")
                .update({
                    tindakan: formData.action || null,
                    tanggal_tindak_lanjut: formData.followUp || null,
                    catatan: formData.note || null,
                    updated_at: new Date().toISOString()
                })
                .eq("id", violation.id);

            if (error) {
                console.error("Error updating tindakan:", error);
                alert("Gagal menyimpan tindakan: " + error.message);
                return;
            }

            setViolation({
                ...violation,
                tindakan: formData.action || null,
                tanggal_tindak_lanjut: formData.followUp || null,
                catatan: formData.note || null,
                updated_at: new Date().toISOString()
            });
            
            setIsEditModalOpen(false);
            alert("Tindakan berhasil disimpan");
        } catch (error) {
            console.error("Error in handleActionSubmit:", error);
            alert("Terjadi kesalahan saat menyimpan tindakan");
        }
    };

    const handleMarkAsComplete = async () => {
        if (!violation) return;
        if (!confirm("Tandai pelanggaran ini sebagai selesai?")) return;

        try {
            const { error } = await supabase
                .from("pelanggarans")
                .update({
                    status: "Selesai",
                    updated_at: new Date().toISOString()
                })
                .eq("id", violation.id);

            if (error) {
                console.error("Error updating status:", error);
                alert("Gagal menandai pelanggaran sebagai selesai: " + error.message);
                return;
            }

            setViolation({
                ...violation,
                status: "Selesai",
                updated_at: new Date().toISOString()
            });
            
            alert("Pelanggaran berhasil ditandai sebagai selesai");
        } catch (error) {
            console.error("Error in handleMarkAsComplete:", error);
            alert("Terjadi kesalahan saat mengupdate status");
        }
    };

    const handleDownloadReport = () => {
        if (!violation) return;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Laporan Pelanggaran Siswa", 14, 20);

        autoTable(doc, {
            startY: 30,
            head: [["Kolom", "Detail"]],
            body: [
                ["Nama Siswa", violation.siswa?.nama ?? 'N/A'],
                ["NIS", violation.siswa?.nis ?? 'N/A'],
                ["Kelas", violation.siswa?.kelas?.kelas ?? 'N/A'],
                ["Jenis Pelanggaran", violation.jenis_pelanggaran],
                ["Tingkat", violation.tingkat],
                ["Poin", violation.poin.toString()],
                ["Tanggal & Waktu", `${violation.tanggal} | ${violation.waktu}`],
                ["Lokasi", violation.lokasi],
                ["Status", violation.status],
                ["Dilaporkan oleh", violation.dilaporkan_oleh_user?.name ?? 'N/A'],
                ["Deskripsi Kejadian", violation.deskripsi]
            ],
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: "bold" } }
        });

        let nextY = (doc as any).lastAutoTable?.finalY + 10 || 100;
        doc.setFontSize(12);
        doc.text("Bukti Pelanggaran:", 14, nextY);
        nextY += 6;

        Evidence.forEach(b => {
            doc.setFontSize(10);
            doc.text(
                `[${b.tipe}] ${b.deskripsi || b.nama || "-"} | oleh: ${b.diunggah_oleh} | ${b.waktu_unggah}`,
                14,
                nextY,
                { maxWidth: 180 }
            );
            nextY += 6;
        });

        nextY += 4;
        doc.setFontSize(12);
        doc.text("Tindakan yang Diambil:", 14, nextY);
        nextY += 6;

        doc.setFontSize(10);
        doc.text(`Sanksi / Tindakan: ${violation.tindakan || '-'}`, 14, nextY);
        nextY += 6;
        doc.text(`Tanggal Tindak Lanjut: ${violation.tanggal_tindak_lanjut || '-'}`, 14, nextY);
        nextY += 6;
        doc.text(`Catatan: ${violation.catatan || '-'}`, 14, nextY, { maxWidth: 180 });

        doc.save(`laporan_pelanggaran_${violation.siswa?.nis ?? 'unknown'}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Memuat data...</div>
            </div>
        );
    }

    if (!violation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Data pelanggaran tidak ditemukan</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <InfoSiswa data={violation} getSeverityColor={getSeverityColor} getStatusColor={getStatusColor} />
                <BuktiPelanggaran bukti={Evidence} onLihat={(url) => setSelectedImage(url)} />
                <TindakanDiambil
                    actionTaken={violation.tindakan}
                    followUpdate={violation.tanggal_tindak_lanjut}
                    notes={violation.catatan}
                    isEditModalOpen={isEditModalOpen}
                    setIsEditModalOpen={setIsEditModalOpen}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleActionSubmit={handleActionSubmit}
                />
                <Button onClick={handleDownloadReport} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white min-w-full rounded-[5px]">
                    <Download className="w-4 mr-2" /> Download Laporan (PDF)
                </Button>
                {violation.status !== "Selesai" && (
                    <Button onClick={handleMarkAsComplete} className="bg-green-600 hover:bg-green-700 text-white min-w-full rounded-[5px]">
                        <Check className="w-4 mr-2" /> Tandai Pelanggaran Selesai
                    </Button>
                )}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <img src={selectedImage} alt="Bukti Pelanggaran" className="max-w-full max-h-full object-contain" />
                    </div>
                )}
            </div>
        </div>
    );
}