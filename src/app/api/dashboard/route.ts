import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        // Fetch data dengan relasi yang benar
        const [siswasResult, kelasResult, pelanggaranResult] = await Promise.all([
            supabase.from('siswas').select('*, kelas:kelas_id(*)'),
            supabase.from('kelas').select('*'),
            supabase.from('pelanggarans').select('*, siswa:siswa_id(*)'),
        ]);

        if (siswasResult.error) {
            console.error('Error fetching siswas:', siswasResult.error);
            return NextResponse.json({ error: 'Gagal mengambil data siswa', details: siswasResult.error.message }, { status: 500 });
        }

        if (kelasResult.error) {
            console.error('Error fetching kelas:', kelasResult.error);
            return NextResponse.json({ error: 'Gagal mengambil data kelas', details: kelasResult.error.message }, { status: 500 });
        }

        if (pelanggaranResult.error) {
            console.error('Error fetching pelanggarans:', pelanggaranResult.error);
            return NextResponse.json({ error: 'Gagal mengambil data pelanggaran', details: pelanggaranResult.error.message }, { status: 500 });
        }

        const siswas = siswasResult.data || [];
        const kelas = kelasResult.data || [];
        const pelanggaran = pelanggaranResult.data || [];

        console.log('Data fetched:', {
            siswaCount: siswas.length,
            kelasCount: kelas.length,
            pelanggaranCount: pelanggaran.length
        });

        const totalSiswa = siswas.length;
        const totalKelas = kelas.length;

        // ============================================
        // 1. PIE DATA - Gender distribution
        // ============================================
        const pie_data = [
            { name: 'Laki-laki', value: siswas.filter(s => s.jenis_kelamin === 'L').length },
            { name: 'Perempuan', value: siswas.filter(s => s.jenis_kelamin === 'P').length },
        ];

        // ============================================
        // 2. BAR DATA - Students per class by gender
        // ============================================
        const kelasMap = new Map(kelas.map(k => [k.id, k.kelas]));

        const kelasGrouped = siswas.reduce((acc, siswa) => {
            const namaKelas = kelasMap.get(siswa.kelas_id) || 'Tidak Diketahui';
            if (!acc[namaKelas]) {
                acc[namaKelas] = { 'L': 0, 'P': 0 };
            }
            if (siswa.jenis_kelamin === 'L') {
                acc[namaKelas]['L']++;
            } else if (siswa.jenis_kelamin === 'P') {
                acc[namaKelas]['P']++;
            }
            return acc;
        }, {} as Record<string, { 'L': number; 'P': number }>);

        const bar_data = Object.entries(kelasGrouped).map(([nama_kelas, counts]) => ({
            nama_kelas,
            'Laki-Laki': counts['L'],
            'Perempuan': counts['P'],
        }));

        // ============================================
        // 3. BIRTH YEAR DATA
        // ============================================
        const birthYearGrouped = siswas.reduce((acc, siswa) => {
            if (siswa.tanggal_lahir) {
                try {
                    const year = new Date(siswa.tanggal_lahir).getFullYear();
                    if (!isNaN(year)) {
                        acc[year] = (acc[year] || 0) + 1;
                    }
                } catch (e) {
                    console.warn('Invalid date format:', siswa.tanggal_lahir);
                }
            }
            return acc;
        }, {} as Record<number, number>);

        const bar_data_birthyear = Object.entries(birthYearGrouped)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);

        // ============================================
        // 4. TREN PELANGGARAN (Monthly)
        // ============================================
        const totalPelanggaran = pelanggaran.length;

        // Get last 6 months
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }).reverse();

        const pelanggaranTren = months.map(month => {
            const filtered = pelanggaran.filter(p => {
                if (!p.tanggal) return false;
                const pMonth = p.tanggal.substring(0, 7);
                return pMonth === month;
            });
            return {
                bulan: month,
                Aktif: filtered.filter(p => p.status === 'Aktif').length,
                Selesai: filtered.filter(p => p.status === 'Selesai').length,
            };
        });

        // ============================================
        // 5. PELANGGARAN PER JENIS
        // ============================================
        const jenisGrouped = pelanggaran.reduce((acc, p) => {
            if (p.jenis_pelanggaran) {
                acc[p.jenis_pelanggaran] = (acc[p.jenis_pelanggaran] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerJenis = Object.entries(jenisGrouped)
            .map(([jenis_pelanggaran, total]) => ({ jenis_pelanggaran, total }))
            .sort((a, b) => b.total - a.total);

        // ============================================
        // 6. PELANGGARAN PER TINGKAT
        // ============================================
        const tingkatGrouped = pelanggaran.reduce((acc, p) => {
            if (p.tingkat) {
                acc[p.tingkat] = (acc[p.tingkat] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerTingkat = Object.entries(tingkatGrouped)
            .map(([tingkat, total]) => ({ tingkat, total }));

        // ============================================
        // 7. PELANGGARAN PER KELAS (Top violators)
        // ============================================
        const kelasPelanggaran = pelanggaran.reduce((acc, p) => {
            const siswa = siswas.find(s => s.id === p.siswa_id);
            const namaKelas = siswa ? (kelasMap.get(siswa.kelas_id) || 'Tidak Diketahui') : 'Tidak Diketahui';
            acc[namaKelas] = (acc[namaKelas] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerKelas = Object.entries(kelasPelanggaran)
            .map(([kelas, total]) => ({ kelas, total }))
            .sort((a, b) => b.total - a.total);

        // ============================================
        // 8. RESPONSE
        // ============================================
        return NextResponse.json({
            success: true,
            totalSiswa,
            totalKelas,
            totalPelanggaran,
            pie_data,
            bar_data,
            bar_data_birthyear,  // ← perhatikan ini, bukan bar_data_birtyear
            pelanggaranTren,
            pelanggaranPerJenis,
            pelanggaranPerTingkat,
            pelanggaranPerKelas,
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}