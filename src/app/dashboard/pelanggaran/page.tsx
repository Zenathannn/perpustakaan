"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import PelanggaranTable from "@/components/pelanggaran/PelanggaranTable";
import AddPelanggaranDialog from "@/components/pelanggaran/AddPelanggaranDialog";
import EditPelanggaranDialog from "@/components/pelanggaran/EditPelanggaranDialog";
import PelanggaranFilters from "@/components/pelanggaran/FilterTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ExportTable from "@/components/pelanggaran/ExportTable";
import type { Pelanggaran, Siswa, Kelas } from "@/types";
import { supabase } from "@/lib/supabase";

export default function PelanggaranPage() {
    const [violations, setViolations] = useState<Pelanggaran[]>([]);
    const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
    const [dataKelas, setDataKelas] = useState<Kelas[]>([]);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingViolation, setEditingViolation] = useState<Pelanggaran | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "",
        severity: "",
        violationType: "",
    });
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Kelas
            const { data: kelasData, error: kelasError } = await supabase
                .from("kelas")
                .select("*")
                .order("id", { ascending: true });

            if (kelasError) {
                console.error("Error fetching kelas:", kelasError);
            }

            // Fetch Siswa
            const { data: siswaData, error: siswaError } = await supabase
                .from("siswas")
                .select("*")
                .order("id", { ascending: true });

            if (siswaError) {
                console.error("Error fetching siswa:", siswaError);
            } else {
                console.log("Siswa data fetched:", siswaData?.length || 0, "rows");
            }

            // Fetch Pelanggaran
            const { data: pelanggaranData, error: pelanggaranError } = await supabase
                .from("pelanggarans")
                .select("*")
                .order("id", { ascending: true });

            if (pelanggaranError) {
                console.error("Error fetching pelanggaran:", pelanggaranError);
            } else {
                console.log("Pelanggaran data fetched:", pelanggaranData?.length || 0, "rows");
            }

            // Map data secara manual untuk menggabungkan relasi
            let enrichedPelanggaranData = pelanggaranData || [];
            
            if (pelanggaranData && siswaData && kelasData) {
                enrichedPelanggaranData = pelanggaranData.map(pelanggaran => {
                    const siswa = siswaData.find(s => s.id === pelanggaran.siswa_id);
                    const kelas = siswa ? kelasData.find(k => k.id === siswa.kelas_id) : null;
                    
                    // Create user data placeholder since users table doesn't exist
                    const userData = pelanggaran.dilaporkan_oleh ? {
                        id: pelanggaran.dilaporkan_oleh,
                        name: pelanggaran.dilaporkan_oleh,
                        email: "admin@example.com"
                    } : null;
                    
                    return {
                        ...pelanggaran,
                        siswa: siswa ? {
                            ...siswa,
                            kelas: kelas || null
                        } : null,
                        dilaporkan_oleh_user: userData
                    };
                });
            }

            // Enrich siswa data dengan kelas
            let enrichedSiswaData = siswaData || [];
            
            if (siswaData && kelasData) {
                enrichedSiswaData = siswaData.map(siswa => {
                    const kelas = kelasData.find(k => k.id === siswa.kelas_id);
                    return {
                        ...siswa,
                        kelas: kelas || null
                    };
                });
            }

            setDataKelas(kelasData || []);
            setDataSiswa(enrichedSiswaData);
            setViolations(enrichedPelanggaranData);
        } catch (error) {
            console.error("Error in fetchData:", error);
        } finally {
            setLoading(false);
        }
    };

    const violationTypes = useMemo(() => {
        if (!violations || violations.length === 0) return [];
        
        const types = violations
            .map(v => v.jenis_pelanggaran)
            .filter(Boolean);
        
        return Array.from(new Set(types));
    }, [violations]);

    const filteredViolations = useMemo(() => {
        if (!violations || violations.length === 0) return [];

        return violations.filter((v) => {
            // Filter by start date
            if (filters.startDate && filters.startDate !== "") {
                const violationDate = new Date(v.tanggal);
                const startDate = new Date(filters.startDate);
                if (violationDate < startDate) return false;
            }
            
            // Filter by end date
            if (filters.endDate && filters.endDate !== "") {
                const violationDate = new Date(v.tanggal);
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (violationDate > endDate) return false;
            }

            // Filter by status
            if (filters.status && filters.status !== "" && v.status !== filters.status) {
                return false;
            }

            // Filter by severity
            if (filters.severity && filters.severity !== "" && v.tingkat !== filters.severity) {
                return false;
            }

            // Filter by violation type
            if (filters.violationType && filters.violationType !== "" && v.jenis_pelanggaran !== filters.violationType) {
                return false;
            }

            // Search filter
            if (search && search.trim() !== "") {
                const q = search.toLowerCase().trim();
                const searchableFields = [
                    v.siswa?.nama || "",
                    v.siswa?.nis || "",
                    v.siswa?.kelas?.kelas || "",
                    v.jenis_pelanggaran || "",
                    v.status || "",
                    v.deskripsi || "",
                    v.tingkat || "",
                    v.dilaporkan_oleh || ""
                ];

                const matchFound = searchableFields.some(field => 
                    field.toLowerCase().includes(q)
                );

                if (!matchFound) return false;
            }

            return true;
        });
    }, [violations, filters, search]);

    const handleAdd = async (newV: Omit<Pelanggaran, "id" | "created_at" | "updated_at" | "siswa" | "dilaporkan_oleh_user">) => {
        try {
            // Pastikan semua field yang required ada
            const dataToInsert = {
                siswa_id: newV.siswa_id,
                jenis_pelanggaran: newV.jenis_pelanggaran,
                tingkat: newV.tingkat,
                poin: newV.poin,
                tanggal: newV.tanggal,
                waktu: newV.waktu,
                lokasi: newV.lokasi,
                deskripsi: newV.deskripsi || '',
                status: newV.status || 'Aktif',
                tindakan: newV.tindakan || null,
                tanggal_tindak_lanjut: newV.tanggal_tindak_lanjut || null,
                catatan: newV.catatan || null,
                url: newV.url || null,
                dilaporkan_oleh: newV.dilaporkan_oleh || ''
            };

            const { data: inserted, error } = await supabase
                .from("pelanggarans")
                .insert([dataToInsert])
                .select("*")
                .single();

            if (error) {
                console.error("Error inserting pelanggaran:", error);
                alert("Gagal menambahkan pelanggaran: " + error.message);
                return;
            }

            // Enrich dengan data siswa
            const siswa = dataSiswa.find(s => s.id === inserted.siswa_id);
            
            // Create user data placeholder
            const userData = inserted.dilaporkan_oleh ? {
                id: inserted.dilaporkan_oleh,
                name: inserted.dilaporkan_oleh,
                email: "admin@example.com"
            } : null;
            
            const enrichedData = {
                ...inserted,
                siswa: siswa || null,
                dilaporkan_oleh_user: userData
            };

            setViolations((prev) => [enrichedData, ...prev]);
            setAddDialogOpen(false);
            alert("Pelanggaran berhasil ditambahkan.");
        } catch (error) {
            console.error("Error in handleAdd:", error);
            alert("Terjadi kesalahan saat menambahkan pelanggaran.");
        }
    };

    const handleEdit = (violation: Pelanggaran) => {
        setEditingViolation(violation);
        setEditDialogOpen(true);
    };

    const handleUpdate = async (updatedV: Pelanggaran) => {
        if (!editingViolation) return;

        try {
            const { id, siswa, dilaporkan_oleh_user, created_at, updated_at, ...updateData } = updatedV;

            const { data: updatedViolation, error } = await supabase
                .from("pelanggarans")
                .update(updateData)
                .eq("id", editingViolation.id)
                .select("*")
                .single();

            if (error) {
                console.error("Error updating pelanggaran:", error);
                alert("Gagal mengupdate pelanggaran: " + error.message);
                return;
            }

            // Enrich dengan data siswa
            const siswaData = dataSiswa.find(s => s.id === updatedViolation.siswa_id);
            
            // Create user data placeholder
            const userData = updatedViolation.dilaporkan_oleh ? {
                id: updatedViolation.dilaporkan_oleh,
                name: updatedViolation.dilaporkan_oleh,
                email: "admin@example.com"
            } : null;
            
            const enrichedData = {
                ...updatedViolation,
                siswa: siswaData || null,
                dilaporkan_oleh_user: userData
            };
            
            setViolations((prev) => 
                prev.map((v) => (v.id === enrichedData.id ? enrichedData : v))
            );
            setEditDialogOpen(false);
            setEditingViolation(null);
            alert("Pelanggaran berhasil diupdate.");
        } catch (error) {
            console.error("Error in handleUpdate:", error);
            alert("Terjadi kesalahan saat mengupdate pelanggaran.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pelanggaran ini?")) {
            return;
        }

        try {
            const { error } = await supabase
                .from("pelanggarans")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Error deleting pelanggaran:", error);
                alert("Gagal menghapus pelanggaran: " + error.message);
                return;
            }

            setViolations((prev) => prev.filter((v) => v.id !== id));
            alert("Pelanggaran berhasil dihapus.");
        } catch (error) {
            console.error("Error in handleDelete:", error);
            alert("Terjadi kesalahan saat menghapus pelanggaran.");
        }
    };

    const clearFilters = () => {
        setFilters({
            startDate: "", 
            endDate: "", 
            status: "", 
            severity: "", 
            violationType: ""
        });
        setSearch("");
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg">Memuat data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Data Pelanggaran</h1>
            <ExportTable data={filteredViolations} />

            <Card className="p-4 shadow rounded-2xl">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex flex-1 items-center gap-2">
                            <Input
                                placeholder="Cari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 text-sm w-full sm:w-[300px] rounded-[5px]"
                            />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowFilters(!showFilters)}
                                className="rounded-[5px]"
                            >
                                <Filter className="h-4 w-4 mr-1" /> Filter
                            </Button>
                            {(showFilters || search || Object.values(filters).some(f => f !== "")) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 rounded-[5px]"
                                >
                                    <X className="h-4 w-4" /> Reset
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Select 
                                value={pageSize.toString()} 
                                onValueChange={(v) => setPageSize(Number(v))}
                            >
                                <SelectTrigger className="w-20 h-9 text-sm rounded-[5px]">
                                    <SelectValue placeholder="Jumlah" />
                                </SelectTrigger>
                                <SelectContent className="bg-white rounded-[5px] cursor-pointer">
                                    {[10, 25, 50, 100].map((n) => (
                                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <AddPelanggaranDialog
                                open={addDialogOpen}
                                onOpenChange={setAddDialogOpen}
                                onAdd={handleAdd}
                                dataSiswa={dataSiswa}
                            />
                        </div>
                    </div>

                    {showFilters && (
                        <PelanggaranFilters
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            search={search}
                            setSearch={setSearch}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                            filterOptions={{
                                type: violationTypes,
                                severities: ["Ringan", "Sedang", "Berat"],
                                statuses: ["Aktif", "Selesai"],
                            }}
                            filteredCount={filteredViolations.length}
                            totalCount={violations.length}
                        />
                    )}

                    <PelanggaranTable
                        violations={filteredViolations}
                        onEdit={handleEdit}
                        ondelete={handleDelete}
                        pageSize={pageSize}
                    />
                </div>
            </Card>

            {editingViolation && (
                <EditPelanggaranDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    violation={editingViolation}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}