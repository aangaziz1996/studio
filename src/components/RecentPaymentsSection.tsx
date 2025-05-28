
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Payment, Customer } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id as indonesiaLocale } from "date-fns/locale";
import { ChevronRight } from "lucide-react";

export interface EnrichedPayment extends Payment {
  customerName: string;
  customerId: string;
}

interface RecentPaymentsSectionProps {
  recentPayments: EnrichedPayment[];
}

export function RecentPaymentsSection({ recentPayments }: RecentPaymentsSectionProps) {
  const router = useRouter();

  const handleViewCustomer = (customerId: string) => {
    router.push(`/pelanggan/${customerId}`);
  };
  
  const handleViewAllPayments = () => {
    // Placeholder for now, could navigate to a dedicated payments page or tab
    // console.log("View all payments - navigate to payments page/tab");
    // For now, let's make it a placeholder or link to a non-existent payments page.
    // Or change the active tab to "pembayaran" if possible.
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Pembayaran Terakhir</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleViewAllPayments} className="text-primary hover:text-primary/90">
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentPayments.length > 0 ? (
          <ul className="space-y-3">
            {recentPayments.map((payment) => (
              <li 
                key={payment.id} 
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleViewCustomer(payment.customerId)}
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{payment.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(payment.date), "dd MMM yyyy", { locale: indonesiaLocale })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran.</p>
        )}
      </CardContent>
    </Card>
  );
}
