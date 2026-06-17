"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity } from "lucide-react";

export default function TrenPelanggaran({ data }: { data: any[] }) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Tren Pelanggaran Siswa
          </CardTitle>
          <Badge variant="outline">6 Bulan Terakhir</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-50" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
            />
            <Tooltip />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Area type="monotone"
              dataKey="violations"
              stroke="#ef4444" 
              fill="#ef4444"
              fillOpacity={0.2} name="Pelanggaran"
            />
            <Area type="monotone"
              dataKey="resolved"
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.2} name="Diselesaikan"

            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}