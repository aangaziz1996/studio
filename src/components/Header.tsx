
"use client";
// This component is being replaced by PageHeader.tsx for the main page.
// Keeping the old file in case it's used elsewhere or for reference.
// For new main page header, see src/components/PageHeader.tsx

import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { PlusCircle, BarChartBig } from "lucide-react";

type HeaderProps = {
  onAddCustomer: () => void;
  onShowInsights: () => void;
};

export function Header({ onAddCustomer, onShowInsights }: HeaderProps) {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <AppLogo />
        <div className="space-x-2">
          <Button onClick={onAddCustomer} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Button>
          <Button onClick={onShowInsights}>
            <BarChartBig className="mr-2 h-4 w-4" /> Payment Insights
          </Button>
        </div>
      </div>
    </header>
  );
}
