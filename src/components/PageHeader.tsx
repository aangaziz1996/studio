
"use client";

import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { Plus } from "lucide-react";

type PageHeaderProps = {
  title: string;
  onAddCustomer: () => void;
};

export function PageHeader({ title, onAddCustomer }: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <AppLogo />
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button onClick={onAddCustomer} variant="ghost" size="icon">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Tambah Pelanggan</span>
        </Button>
      </div>
    </header>
  );
}
