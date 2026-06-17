"use client";

import React from "react";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#ec4899"];

export default function GenderRatioChart({ data }: { data: any[] }) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-green-500" />
            Jenis Kelamin 
          </CardTitle>
          <Badge variant="outline">Total ratio</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
            <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                 `${name} (${percent ? (typeof percent === "number" ? (percent * 100).toFixed(1) : 0) : 0}%)`}
                  outerRadius={100}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
            >
                     {data.map((_, index) => (
                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}