
"use client";

import type { Customer } from "@/lib/types";
import Image from "next/image";

interface CustomerListItemProps {
  customer: Customer;
  onClick: (customer: Customer) => void;
}

export function CustomerListItem({ customer, onClick }: CustomerListItemProps) {
  // Simple hashing function to get a somewhat consistent placeholder image variant
  const getPlaceholderVariant = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    // Use a few variants based on the hash
    return Math.abs(hash % 3); // 0, 1, or 2
  };
  
  const variant = getPlaceholderVariant(customer.id);
  // For simplicity, we'll use the same male/female hint but vary the placeholder slightly
  const placeholderGenderHint = variant % 2 === 0 ? "man portrait" : "woman portrait";


  return (
    <div
      className="flex items-center p-4 space-x-4 hover:bg-muted cursor-pointer border-b border-border"
      onClick={() => onClick(customer)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(customer);}}
    >
      <Image
        src={`https://placehold.co/40x40.png?variant=${variant}`}
        alt={`Avatar for ${customer.name}`}
        width={40}
        height={40}
        className="rounded-full"
        data-ai-hint={placeholderGenderHint}
      />
      <div>
        <p className="font-medium text-foreground">{customer.name}</p>
        <p className="text-sm text-muted-foreground">ID Pelanggan: {customer.id.slice(-5)}</p>
      </div>
    </div>
  );
}
