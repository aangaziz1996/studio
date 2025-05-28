
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface NewCustomersSectionProps {
  newCustomers: Customer[];
}

const getPlaceholderVariant = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return Math.abs(hash % 3);
};

export function NewCustomersSection({ newCustomers }: NewCustomersSectionProps) {
  const router = useRouter();

  const handleViewCustomer = (customerId: string) => {
    router.push(`/pelanggan/${customerId}`);
  };
  
  const handleViewAll = () => {
    // Assuming clicking "Lihat Semua" in new customers should go to the main customer list page
    // and potentially activate a filter or sort if that functionality is added later.
    // For now, it navigates to the main customer list page. The activeTab logic in page.tsx
    // will also need to be updated if we want this to switch tabs.
    // For simplicity, this button might be better if it just changed the activeTab to 'pelanggan'
    // if that functionality is passed down or handled via a global state.
    // Let's make it navigate to `/` which shows the customer list by default if `pelanggan` tab is active.
    // Or, for now, let's make it a placeholder button.
    // console.log("View all new customers - navigate to customer list");
    router.push("/"); // This will show customer list if page.tsx defaultTab or logic handles it
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Pelanggan Baru (30 Hari Terakhir)</CardTitle>
         <Button variant="ghost" size="sm" onClick={handleViewAll} className="text-primary hover:text-primary/90">
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {newCustomers.length > 0 ? (
          <ul className="space-y-3">
            {newCustomers.map((customer) => {
               const variant = getPlaceholderVariant(customer.id);
               const placeholderGenderHint = variant % 2 === 0 ? "man portrait" : "woman portrait";
              return (
              <li 
                key={customer.id} 
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleViewCustomer(customer.id)}
              >
                <Image
                  src={`https://placehold.co/40x40.png?variant=${variant}`}
                  alt={customer.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  data-ai-hint={placeholderGenderHint}
                />
                <div>
                  <p className="font-medium text-sm text-foreground">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.plan}</p>
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pelanggan baru dalam 30 hari terakhir.</p>
        )}
      </CardContent>
    </Card>
  );
}
