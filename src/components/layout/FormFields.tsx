"use client"

import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import type { Kelas } from "@/types"

interface FormFieldsProps {
  data: any
  onChange: (key: string, value: string | number) => void
  kelas: Kelas[]
}

export default function FormFields({ data, onChange, kelas }: FormFieldsProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="nama" className="text-sm font-medium">
          Nama
        </Label>
        <Input
          id="nama"
          type="text"
          value={data.nama || ""}
          placeholder="Masukan nama lengkap"
          onChange={(e) => onChange("nama", e.target.value)}
          className="w-full rounded-[5px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nis" className="text-sm font-medium">
          NIS
        </Label>
        <Input
          id="nis"
          type="text"
          value={data.nis || ""}
          placeholder="Masukan NIS"
          onChange={(e) => onChange("nis", e.target.value)}
          className="w-full rounded-[5px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tanggal_lahir" className="text-sm font-medium">
          Tanggal Lahir
        </Label>
        <Input
          id="tanggal_lahir"
          type="date"
          value={data.tanggal_lahir || ""}
          onChange={(e) => onChange("tanggal_lahir", e.target.value)}
          className="w-full rounded-[5px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alamat" className="text-sm font-medium">
          Alamat
        </Label>
        <Input
          id="alamat"
          type="text"
          value={data.alamat || ""}
          placeholder="Masukan alamat lengkap"
          onChange={(e) => onChange("alamat", e.target.value)}
          className="w-full rounded-[5px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kelas" className="text-sm font-medium">
          Kelas
        </Label>
        <Select value={String(data.kelas_id || "")} onValueChange={(val) => onChange("kelas_id", Number(val))}>
          <SelectTrigger id="kelas" className="w-full rounded-[5px]">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-[10px]">
            {kelas.map((k) => (
              <SelectItem className='cursor-pointer hover:bg-gray-50 focus:bg-blue-50 transition-colors rounded-[5px]' key={k.id} value={String(k.id)}>
                {k.kelas}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_kelamin" className="text-sm font-medium">
          Jenis Kelamin
        </Label>
        <Select value={String(data.jenis_kelamin || "")} onValueChange={(val) => onChange("jenis_kelamin", val)}>
          <SelectTrigger id="jenis_kelamin" className="w-full rounded-[5px]">
            <SelectValue placeholder="Pilih Jenis Kelamin" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-[10px]">
            <SelectItem className='cursor-pointer hover:bg-gray-50 focus:bg-blue-50 transition-colors rounded-[5px]' value="L">Laki-Laki</SelectItem>
            <SelectItem className='cursor-pointer hover:bg-gray-50 focus:bg-blue-50 transition-colors rounded-[5px]' value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
