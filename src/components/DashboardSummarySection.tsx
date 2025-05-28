
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardSummarySectionProps {
  totalIncomeThisMonth: number;
  activeCustomersCount: number;
}

const SummaryItem: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="flex items-center space-x-3 p-3 bg-background rounded-lg shadow-sm">
    <div className="p-3 bg-primary/10 rounded-full text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

export function DashboardSummarySection({ totalIncomeThisMonth, activeCustomersCount }: DashboardSummarySectionProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Ringkasan Keuangan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryItem
          title="Total Pemasukan Bulan Ini"
          value={formatCurrency(totalIncomeThisMonth)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <SummaryItem
          title="Total Pelanggan Aktif"
          value={activeCustomersCount.toString()}
          icon={<Users className="h-6 w-6" />}
        />
      </CardContent>
    </Card>
  );
}
