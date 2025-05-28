
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export function SearchBar({ searchTerm, onSearchChange, placeholder = "Cari..." }: SearchBarProps) {
  return (
    <div className="relative p-4">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 py-3 text-base bg-muted border-transparent focus-visible:border-primary focus-visible:ring-primary rounded-lg"
      />
    </div>
  );
}
