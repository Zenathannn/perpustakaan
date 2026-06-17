"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SiswaTable from "@/components/siswa/SiswaTable"
import EditSiswaDialog from "@/components/siswa/EditSiswaDialog"
import type { Siswa, Kelas } from "@/types"
import { supabase } from "@/lib/supabase"

type SiswaFormData = Omit<Siswa, "id" | "kelas">

const initialFormData: SiswaFormData = {
  nama: "",
  nis: "",
  kelas_id: 0,
  jenis_kelamin: "",
  tanggal_lahir: "",
  alamat: "",
}

export default function SiswaPage() {
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([])
  const [dataKelas, setDataKelas] = useState<Kelas[]>([])
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [addData, setAddData] = useState<SiswaFormData>(initialFormData)
  const [editData, setEditData] = useState<SiswaFormData>(initialFormData)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])
  
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: kelasData, error: kelasError } = await supabase
        .from("kelas")
        .select("*")
        .order("id", { ascending: true })

      if (kelasError) {
        console.error("Error fetching kelas:", kelasError)
        setError("Gagal mengambil data kelas: " + kelasError.message)
        return
      }

      const { data: siswaData, error: siswaError } = await supabase
        .from("siswas")
        .select("*, kelas(*)")
        .order("id", { ascending: true })

      if (siswaError) {
        console.error("Error fetching siswa:", siswaError)
        setError("Gagal mengambil data siswa: " + siswaError.message)
        return
      }

      setDataKelas(kelasData || [])
      setDataSiswa(siswaData || [])
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Terjadi kesalahan yang tidak terduga")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddChange = (key: string, value: string | number) => {
    setAddData((prev) => ({ ...prev, [key]: value }))
  }

  const handleEditChange = (key: string, value: string | number) => {
    setEditData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAdd = async () => {
    try {
      setError(null)
      setSuccess(null)

      if (!addData.nama || !addData.nis || !addData.kelas_id || addData.kelas_id === 0) {
        setError("Nama, NIS, dan Kelas harus diisi")
        return
      }

      const dataToInsert = {
        nama: addData.nama,
        nis: addData.nis,
        kelas_id: Number(addData.kelas_id),
        jenis_kelamin: addData.jenis_kelamin || "",
        tanggal_lahir: addData.tanggal_lahir || "",
        alamat: addData.alamat || "",
      }

      const { data: inserted, error: insertError } = await supabase
        .from("siswas")
        .insert([dataToInsert])
        .select("*, kelas(*)")
        .single()

      if (insertError) {
        console.error("Error inserting siswa:", insertError)
        setError("Gagal menambah siswa: " + insertError.message)
        return
      }

      setDataSiswa((prev) => [...prev, inserted])
      setAddDialogOpen(false)
      setAddData(initialFormData)
      setSuccess("Data siswa berhasil ditambahkan")
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Terjadi kesalahan yang tidak terduga: " + (err as Error).message)
    }
  }

  const handleEdit = (siswa: Siswa) => {
    setEditData({
      nama: siswa.nama,
      nis: siswa.nis,
      kelas_id: siswa.kelas_id,
      jenis_kelamin: siswa.jenis_kelamin || "",
      tanggal_lahir: siswa.tanggal_lahir || "",
      alamat: siswa.alamat || "",
    })
    setEditingId(siswa.id)
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingId) {
      setError("ID siswa tidak ditemukan")
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Validasi data
      if (!editData.nama?.trim()) {
        setError("Nama harus diisi")
        return
      }

      if (!editData.nis?.trim()) {
        setError("NIS harus diisi")
        return
      }

      if (!editData.kelas_id || editData.kelas_id === 0) {
        setError("Kelas harus dipilih")
        return
      }

      // Siapkan data untuk update
      const dataToUpdate: any = {
        nama: editData.nama.trim(),
        nis: editData.nis.trim(),
        kelas_id: Number(editData.kelas_id),
      }

      // Tambahkan field optional jika ada
      if (editData.jenis_kelamin) {
        dataToUpdate.jenis_kelamin = editData.jenis_kelamin
      }

      if (editData.tanggal_lahir) {
        dataToUpdate.tanggal_lahir = editData.tanggal_lahir
      }

      if (editData.alamat) {
        dataToUpdate.alamat = editData.alamat.trim()
      }

      console.log("=== DEBUG UPDATE ===")
      console.log("ID:", editingId)
      console.log("Data:", dataToUpdate)

      const { data: updated, error: updateError } = await supabase
        .from("siswas")
        .update(dataToUpdate)
        .eq("id", editingId)
        .select("*, kelas(*)")
        .single()

      if (updateError) {
        console.error("=== SUPABASE ERROR ===")
        console.error("Code:", updateError.code)
        console.error("Message:", updateError.message)
        console.error("Details:", updateError.details)
        console.error("Hint:", updateError.hint)
        
        // Tampilkan error yang lebih spesifik
        let errorMessage = "Gagal mengupdate siswa"
        
        if (updateError.code === "23505") {
          errorMessage = "NIS sudah digunakan oleh siswa lain"
        } else if (updateError.code === "23503") {
          errorMessage = "Kelas yang dipilih tidak valid"
        } else if (updateError.message) {
          errorMessage = `Gagal mengupdate siswa: ${updateError.message}`
        }
        
        setError(errorMessage)
        return
      }

      if (!updated) {
        setError("Data tidak ditemukan")
        return
      }

      console.log("=== UPDATE SUCCESS ===")
      console.log("Updated data:", updated)

      setDataSiswa((prev) => prev.map((s) => (s.id === editingId ? updated : s)))
      setEditDialogOpen(false)
      setEditingId(null)
      setEditData(initialFormData)
      setSuccess("Data siswa berhasil diupdate")
    } catch (err) {
      console.error("=== UNEXPECTED ERROR ===")
      console.error(err)
      
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga"
      setError(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error: deleteError } = await supabase
        .from("siswas")
        .delete()
        .eq("id", id)

      if (deleteError) {
        console.error("Error deleting siswa:", deleteError)
        setError("Gagal menghapus siswa: " + deleteError.message)
        return
      }

      setDataSiswa((prev) => prev.filter((s) => s.id !== id))
      setSuccess("Data siswa berhasil dihapus")
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Terjadi kesalahan yang tidak terduga: " + (err as Error).message)
    }
  }

  const handleAddDialogClose = (open: boolean) => {
    setAddDialogOpen(open)
    if (!open) {
      setAddData(initialFormData)
    }
  }

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      setEditData(initialFormData)
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Siswa</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="p-4 rounded-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        ) : (
          <SiswaTable
            dataSiswa={dataSiswa}
            dataKelas={dataKelas}
            selectKelasId={selectedKelasId}
            setSelectKelasId={setSelectedKelasId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            addDialogOpen={addDialogOpen}
            setAddDialogOpen={handleAddDialogClose}
            data={addData}
            handleChange={handleAddChange}
            handleAdd={handleAdd}
          />
        )}
      </Card>

      <EditSiswaDialog
        open={editDialogOpen}
        setOpen={handleEditDialogClose}
        data={editData}
        handleChange={handleEditChange}
        handleUpdate={handleUpdate}
        dataKelas={dataKelas}
      />
    </div>
  )
}