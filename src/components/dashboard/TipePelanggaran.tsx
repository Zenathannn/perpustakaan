"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Target } from "lucide-react";

const VIOLATIONS_COLORS = ["#dc2626","#ea580c","#d97706","#ca8a04","#65a30d"]

export default function TipePelanggaran({ data, total } : { data: any[], total: number}) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500"/>
            Jenis Pelanggaran
          </CardTitle>
          <Badge variant="secondary">Top 5</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...data]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((violations, index) => {
              const uniqueKey = violations.id 
                ? `violation-${violations.id}` 
                : `${violations.type}-${index}`;

                return (
                  <div key={uniqueKey} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VIOLATIONS_COLORS[index] }}/>
                      <span className="font-medium">{violations.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div>
                        <Progress value={violations.percentage} className="h-2"/>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {violations.count}
                      </span>
                    </div>
                  </div>
                )
            }
              
            )
          }
        </div>
      </CardContent>
      <div className="px-6 pb-4">
        <Separator className="my-4"/>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Total Pelanggaran</span>
          <span className="font-medium">{total}</span>
        </div>
      </div>
    </Card>
  )
}