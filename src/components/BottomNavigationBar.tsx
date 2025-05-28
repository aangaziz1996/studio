
"use client";

import { Home, Users, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveTab = "beranda" | "pelanggan" | "pembayaran" | "laporan";

interface BottomNavigationBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const navItems = [
  { id: "beranda" as ActiveTab, label: "Beranda", icon: Home },
  { id: "pelanggan" as ActiveTab, label: "Pelanggan", icon: Users },
  { id: "pembayaran" as ActiveTab, label: "Pembayaran", icon: DollarSign },
  { id: "laporan" as ActiveTab, label: "Laporan", icon: FileText },
];

export function BottomNavigationBar({ activeTab, onTabChange }: BottomNavigationBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-md">
      <div className="container mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 p-2 rounded-md transition-colors",
              "w-1/4", // Distribute width equally
              activeTab === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
