"use client";

import React, { useState, useEffect } from "react";
import { Users, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Statcard from "@/components/dashboard/StatCard";
import SiswaChart from "@/components/dashboard/SiswaChart";
import GenderRatioChart from "@/components/dashboard/GenderRatioChart";
import TrenPelanggaran from "@/components/dashboard/TrenPelanggaran";
import TipePelanggaran from "@/components/dashboard/TipePelanggaran";
import SeverityDistributionList from "@/components/dashboard/TingkatPelanggaran";
import TopViolatorsList from "@/components/dashboard/TopPelanggaran";
import BirthYearDistribution from "@/components/dashboard/BirthYearDistribution";

import { DataTahunLahir, DataBar, DataPie, ViolationStats } from "@/types";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  badge?: string;
}

export default function DashboardPage() {
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalKelas, setTotalKelas] = useState(0);
  const [barData, setBarData] = useState<DataBar[]>([]);
  const [pieData, setPieData] = useState<DataPie[]>([]);
  const [violationStats, setViolationStats] = useState<ViolationStats>({
    totalViolations: 0,
    monthlyViolations: [],
    violationTypes: [],
    severityDistribution: [],
    topViolators: [],
  });
  const [birthYearData, setBirthYearData] = useState<DataTahunLahir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        console.log("Dashboard data received:", data);
        console.log("Birth year data:", data.bar_data_birtyear);

        setTotalSiswa(data.totalSiswa || 0);
        setTotalKelas(data.totalKelas || 0);
        setPieData(data.pie_data || []);
        setBarData(data.bar_data || []);

        // Fixed: Properly set birth year data with correct structure
        const birthYearRaw = data.bar_data_birthyear || [];
        const formattedBirthYearData = birthYearRaw.map((item: any) => ({
          year: item.year || item.tahun || item.Year || item.Tahun,
          count: item.count || item.jumlah || item.Count || item.Jumlah || 0
        })).filter((item: any) => item.year && item.count);

        console.log("Formatted birth year data:", formattedBirthYearData);
        setBirthYearData(formattedBirthYearData);

        setViolationStats({
          totalViolations: data.totalPelanggaran || 0,
          monthlyViolations: (data.pelanggaranTren || []).map((item: any) => ({
            month: item.bulan,
            violations: item.Aktif,
            resolved: item.Selesai,
          })),
          violationTypes: (data.pelanggaranPerJenis || []).map((item: any) => ({
            type: item.jenis_pelanggaran,
            count: item.total,
            percentage: 0,
          })),
          severityDistribution: (data.pelanggaranPerTingkat || []).map((item: any) => ({
            severity: item.tingkat,
            count: item.total,
            color:
              item.tingkat === "Ringan"
                ? "#22c55e"
                : item.tingkat === "Sedang"
                  ? "#3b82f6"
                  : "#ef4444"
          })),
          topViolators: (data.pelanggaranPerKelas || []).map((item: any) => ({
            name: item.kelas,
            violations: item.total,
          })),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard Siswa
        </h1>

        {/* Statistik Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Statcard title="Siswa" value={totalSiswa} icon={Users} color="bg-blue-500" subtitle="Siswa Aktif" />
          <Statcard title="Kelas" value={totalKelas} icon={GraduationCap} color="bg-green-500" subtitle="Kelas Aktif" />
          <Statcard title="Rata-Rata/Kelas" value={totalKelas ? Math.round(totalSiswa / totalKelas) : 0} icon={TrendingUp} color="bg-amber-500" subtitle="Siswa per Kelas" />
          <Statcard title="Pelanggaran" value={violationStats.totalViolations} icon={AlertTriangle} color="bg-red-500" subtitle="Total Pelanggaran" />
        </div>

        {/* Chart and Lists */}
        <div className="grid grid-cols-1 gap-8">
          <SiswaChart data={barData} />
          <GenderRatioChart data={pieData} />
          <TrenPelanggaran data={violationStats.monthlyViolations} />
          <TipePelanggaran data={violationStats.violationTypes} total={violationStats.totalViolations} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SeverityDistributionList data={violationStats.severityDistribution} />
          <TopViolatorsList data={violationStats.topViolators} />
        </div>

        {/* Birth Year Distribution - Added at the bottom as per original layout */}
        <div className="grid grid-cols-1 gap-8">
          <BirthYearDistribution data={birthYearData} />
        </div>
      </div>
    </div>
  );
}