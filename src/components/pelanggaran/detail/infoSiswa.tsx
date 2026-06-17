"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Award, Calendar, FileText, MapPin, User, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pelanggaran } from "@/types";

type Props = {
    data: Pelanggaran;
    getSeverityColor: (severity: string) => string;
    getStatusColor: (status: string) => string;
}

export default function InfoSiswa({ data, getSeverityColor, getStatusColor }: Props) {
    return (
        <div className="mb-4">
            <div className="flex items-center mb-4 gap-4">
                <Link href="/dashboard/pelanggaran">
                    <Button className="rounded-[5px]"  variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Kembali</span>
                    </Button>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Detail Pelanggaran Siswa
                </h1>
            </div>

            <Card className="shadow-md rounded-[10px]">
                <CardHeader className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {data.siswa?.nama ?? 'Nama Tidak Tersedia'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            NIS: {data.siswa?.nis ?? 'NIS Tidak Tersedia'}
                        </p>
                    </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Badge className={getSeverityColor(data.tingkat)}>
                            {data.tingkat}
                        </Badge>
                        <Badge className={getStatusColor(data.status)}>
                            {data.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                            icon={<FileText className="w-5 h-5 text-gray-400" />}
                            label="Jenis Pelanggaran"
                            value={data.jenis_pelanggaran}
                            warna="text-blue-600"
                        />
                        <InfoItem
                            icon={<Award className="w-5 h-5 text-gray-400" />}
                            label="Poin Pelanggaran"
                            value={`${data.poin} Poin`}
                            warna="text-red-600"
                        />
                        <InfoItem
                            icon={<Calendar className="w-5 h-5 text-gray-400" />}
                            label="Tanggal & Waktu"
                            value={`${data.tanggal} | ${data.waktu}`} 
                        />
                        <InfoItem
                            icon={<MapPin className="w-5 h-5 text-gray-400" />}
                            label="Lokasi"
                            value={data.lokasi}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Deskripsi Kegiatan</p>
                        <p className="font-medium text-gray-800">{data.deskripsi ?? 'Tidak Ada Deskripsi'}</p>
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-gray-600 mb-1">Dilaporkan Oleh</p>
                        <p className="font-medium text-gray-800">{data.dilaporkan_oleh_user?.name ?? 'N/A'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function InfoItem({
    icon,
    label,
    value,
    warna,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    warna?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className={`font-medium ${warna ?? "text-gray-800"}`}>{value}</p>
            </div>
        </div>
    )
}