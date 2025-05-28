
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { CustomerListItem } from "@/components/CustomerListItem";
import { BottomNavigationBar, type ActiveTab } from "@/components/BottomNavigationBar";
import { CustomerForm } from "@/components/CustomerForm";
import { PaymentDialog } from "@/components/PaymentDialog"; // Kept for potential future use
import { PaymentInsightsModal } from "@/components/PaymentInsightsModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Customer, Payment } from "@/lib/types";
import { addMonths, formatISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { toast } = useToast();
  const [customers, setCustomers] = useLocalStorage<Customer[]>("elanet_customers", []);
  
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // PaymentDialog state is kept, but its trigger is currently removed from the main list.
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("pelanggan");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsCustomerFormOpen(true);
  };

  const handleSaveCustomer = (data: Omit<Customer, "id" | "status" | "nextPaymentDate" | "paymentHistory"> & { installationDate: string }) => {
    if (editingCustomer) {
      setCustomers(prev => 
        prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...data, installationDate: data.installationDate } : c)
      );
      toast({ title: "Pelanggan Diperbarui", description: `Detail ${data.name} telah diperbarui.` });
    } else {
      const newCustomer: Customer = {
        ...data,
        id: Date.now().toString(), // Simple ID generation
        status: "Pending",
        nextPaymentDate: formatISO(addMonths(new Date(data.installationDate), 1)),
        paymentHistory: [],
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast({ title: "Pelanggan Ditambahkan", description: `${data.name} telah ditambahkan.` });
    }
    setIsCustomerFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomerRequest = (customerId: string) => {
    setCustomerToDeleteId(customerId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCustomer = () => {
    if (customerToDeleteId) {
      const customerName = customers.find(c => c.id === customerToDeleteId)?.name || "Pelanggan";
      setCustomers(prev => prev.filter(c => c.id !== customerToDeleteId));
      toast({ title: "Pelanggan Dihapus", description: `${customerName} telah dihapus.`, variant: "destructive" });
      // If deleting the customer being edited, close the form
      if (editingCustomer?.id === customerToDeleteId) {
        setIsCustomerFormOpen(false);
        setEditingCustomer(null);
      }
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDeleteId(null);
  };

  // This function's trigger from the main list is removed. Kept for potential future use.
  const handleOpenPaymentDialog = (customer: Customer) => {
    setPayingCustomer(customer);
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = (paymentData: Omit<Payment, "id" | "date">, signature: string) => {
    if (!payingCustomer) return;

    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      date: formatISO(new Date()),
      signature: signature,
    };

    setCustomers(prev => 
      prev.map(c => 
        c.id === payingCustomer.id 
        ? { 
            ...c, 
            status: "Paid",
            paymentHistory: [...c.paymentHistory, newPayment],
            nextPaymentDate: formatISO(addMonths(new Date(c.nextPaymentDate), 1))
          } 
        : c
      )
    );
    toast({ title: "Pembayaran Dicatat", description: `Pembayaran untuk ${payingCustomer.name} telah dicatat.` });
    setIsPaymentDialogOpen(false);
    setPayingCustomer(null);
  };
  
  const handleShowInsights = () => {
    setIsInsightsModalOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "laporan") {
      handleShowInsights();
    }
    // Placeholder for other tab actions
    if (tab === "beranda") {
      toast({ title: "Beranda", description: "Halaman Beranda belum diimplementasikan."});
    }
    if (tab === "pembayaran") {
      toast({ title: "Pembayaran", description: "Fungsi Pembayaran belum diimplementasikan di tab ini."});
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16"> {/* Added pb-16 for bottom nav */}
      <PageHeader 
        title="Pelanggan"
        onAddCustomer={handleAddCustomer}
      />
      
      {activeTab === "pelanggan" && (
        <>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Cari pelanggan..."
          />
          <ScrollArea className="flex-grow">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <CustomerListItem 
                  key={customer.id} 
                  customer={customer} 
                  onClick={handleEditCustomer}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                {searchTerm ? "Pelanggan tidak ditemukan." : "Belum ada pelanggan. Tambahkan pelanggan baru."}
              </p>
            )}
          </ScrollArea>
        </>
      )}

      {/* Placeholder content for other tabs - can be expanded later */}
      {activeTab === "beranda" && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Halaman Beranda</p></div>}
      {activeTab === "pembayaran" && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Halaman Pembayaran</p></div>}
      {/* Laporan tab content is handled by PaymentInsightsModal */}
       {activeTab === "laporan" && !isInsightsModalOpen && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Memuat Laporan...</p></div>}


      <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => {
          setIsCustomerFormOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleSaveCustomer}
        defaultValues={editingCustomer || undefined}
        onDelete={editingCustomer ? handleDeleteCustomerRequest : undefined}
      />

      {/* PaymentDialog is kept but not actively triggered from the main list in this new UI */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setPayingCustomer(null);
        }}
        customer={payingCustomer}
        onRecordPayment={handleRecordPayment}
      />
      
      <PaymentInsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
        customers={customers}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pelanggan secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDeleteId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
