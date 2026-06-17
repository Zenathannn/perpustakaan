"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  tren?: number;
  badge?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  tren,
  badge
}: StatCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <div
          className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-foreground">
            {value}
          </div>
          {tren !== undefined && (
            <div className={`text-sm font-medium ${tren > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tren > 0 ? `+${tren}%` : `${tren}%`}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}