"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import KelasTable from "@/components/kelas/KelasTable";
import AddKelasDialog from "@/components/kelas/AddKelasDialog";
import EditKelasDialog from "@/components/kelas/EditKelasDialog";
import { Kelas } from "@/types";
import { supabase } from "@/lib/supabase";

type KelasFormData = {
    kelas: string;
};

const initialFormData: KelasFormData = {
    kelas: "",
};

export default function KelasPage() {
    const [kelas, setKelas] = useState<Kelas[]>([]);
    const [addForm, setAddForm] = useState<KelasFormData>(initialFormData);
    const [editForm, setEditForm] = useState<KelasFormData>(initialFormData);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKelas();
    }, []);

    const fetchKelas = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("kelas")
                .select("*")
                .order("id", { ascending: true });

            if (error) throw error;
            setKelas(data || []);
        } catch (error: any) {
            console.error("Failed to fetch kelas:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChange = (key: string, value: string) => {
        setAddForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEditChange = (key: string, value: string) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAdd = async () => {
        try {
            const trimmedNama = addForm.kelas.trim();
            if (!trimmedNama) {
                alert("Nama kelas tidak boleh kosong");
                return;
            }

            const { data, error } = await supabase
                .from("kelas")
                .insert([{ kelas: trimmedNama }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setKelas((prev) => [...prev, data]);
                setAddDialogOpen(false);
                setAddForm(initialFormData);
            }
        } catch (err: any) {
            console.error("Error adding data:", err.message);
            alert("Gagal menambah data: " + err.message);
        }
    };

    const handleEditClick = (item: Kelas) => {
        setEditingId(item.id);
        setEditForm({ kelas: item.kelas });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        try {
            if (editingId === null) return;

            const trimmedNama = editForm.kelas.trim();
            if (!trimmedNama) {
                alert("Nama kelas tidak boleh kosong");
                return;
            }

            const { data, error } = await supabase
                .from("kelas")
                .update({ kelas: trimmedNama })
                .eq("id", editingId)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setKelas((prev) =>
                    prev.map((k) => (k.id === editingId ? data : k))
                );
                setEditDialogOpen(false);
                setEditingId(null);
                setEditForm(initialFormData);
            }
        } catch (err: any) {
            console.error("Error updating data:", err.message);
            alert("Gagal memperbarui data: " + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;

        try {
            const { error } = await supabase
                .from("kelas")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setKelas((prev) => prev.filter((k) => k.id !== id));
        } catch (err: any) {
            console.error("Error deleting data:", err.message);
            alert("Gagal menghapus data: " + err.message);
        }
    };

    const handleAddDialogClose = (open: boolean) => {
        setAddDialogOpen(open);
        if (!open) setAddForm(initialFormData);
    };

    const handleEditDialogClose = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
            setEditForm(initialFormData);
            setEditingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-lg">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Data Kelas</h1>

            <Card className="p-4 shadow rounded-2xl">
                <KelasTable
                    data={kelas}
                    handleEditClick={handleEditClick}
                    handleDelete={handleDelete}
                    addDialog={
                        <AddKelasDialog
                            open={addDialogOpen}
                            setOpen={handleAddDialogClose}
                            form={addForm}
                            handleChange={handleAddChange}
                            handleAdd={handleAdd}
                        />
                    }
                />
                <EditKelasDialog
                    open={editDialogOpen}
                    setOpen={handleEditDialogClose}
                    form={editForm}
                    handleChange={handleEditChange}
                    handleUpdate={handleUpdate}
                />
            </Card>
        </div>
    );
}