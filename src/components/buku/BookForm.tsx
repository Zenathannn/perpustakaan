// components/buku/BookForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Book, BookInput } from '@/types'  // ganti dari @/types/book
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'  // ganti dari 'uid' ke 'uuid'
import { ImageUp, X } from 'lucide-react'
import Image from 'next/image'

interface BookFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: BookInput) => Promise<void>
    initialData?: Book | null
    title: string
}

export default function BookForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    title
}: BookFormProps) {
    const [formData, setFormData] = useState<BookInput>({
        title: '',
        author: '',
        stock: 1,
        cover_url: ''
    })
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                author: initialData.author,
                stock: initialData.stock,
                cover_url: initialData.cover_url || ''
            })
            setPreviewUrl(initialData.cover_url || '')
        } else {
            setFormData({
                title: '',
                author: '',
                stock: 1,
                cover_url: ''
            })
            setPreviewUrl('')
        }
    }, [initialData, open])

    const uploadImage = async (file: File): Promise<string> => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${uuidv4()}.${fileExt}`
            const filePath = `covers/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('book-covers')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('book-covers')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Gagal upload gambar')
            return ''
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 2MB')
            return
        }

        const localPreview = URL.createObjectURL(file)
        setPreviewUrl(localPreview)

        const publicUrl = await uploadImage(file)

        if (publicUrl) {
            setFormData({ ...formData, cover_url: publicUrl })
            setPreviewUrl(publicUrl)
        }
    }

    const removeImage = () => {
        setFormData({ ...formData, cover_url: '' })
        setPreviewUrl('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving book:', error)
            alert('Gagal menyimpan buku')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 p-0 gap-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        {initialData ? "Ubah informasi buku di bawah ini." : "Isi data buku baru di bawah ini."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Judul Buku
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Masukkan judul buku"
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author" className="text-sm font-medium">
                            Pengarang
                        </Label>
                        <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            placeholder="Masukkan nama pengarang"
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-medium">
                            Stok
                        </Label>
                        <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Upload Gambar */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Cover Buku <span className="text-xs text-gray-400">(Opsional)</span>
                        </Label>

                        {previewUrl && (
                            <div className="relative inline-block mb-2">
                                <Image
                                    src={previewUrl}
                                    alt="Preview cover"
                                    width={80}
                                    height={100}
                                    className="rounded-md border border-gray-200 object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                    onClick={removeImage}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="border-gray-200 hover:bg-gray-50"
                            >
                                <ImageUp className="mr-2 h-3 w-3" />
                                {uploading ? 'Uploading...' : 'Pilih Gambar'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <span className="text-xs text-gray-400">
                                JPG, PNG (Max 2MB)
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}