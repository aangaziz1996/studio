
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { CustomerListItem } from "@/components/CustomerListItem";
import { BottomNavigationBar, type ActiveTab } from "@/components/BottomNavigationBar";
import { CustomerForm } from "@/components/CustomerForm";
// PaymentDialog is now primarily used in the customer detail page
// import { PaymentDialog } from "@/components/PaymentDialog"; 
import { PaymentInsightsModal } from "@/components/PaymentInsightsModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Customer, Payment } from "@/lib/types";
import { addMonths, formatISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [customers, setCustomers] = useLocalStorage<Customer[]>("elanet_customers_v2", []);
  
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  // Editing customer state is removed, editing will be handled on detail page or if re-introduced here
  // const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Payment Dialog state is removed, it's on detail page now
  // const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  // const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("pelanggan");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCustomer = () => {
    // setEditingCustomer(null); // No longer needed here
    setIsCustomerFormOpen(true);
  };

  // handleEditCustomer now navigates to the detail page
  // const handleEditCustomer = (customer: Customer) => {
  //   router.push(`/pelanggan/${customer.id}`);
  // };

  const handleSaveCustomer = (data: Omit<Customer, "id" | "status" | "nextPaymentDate" | "paymentHistory"> & { installationDate: string }) => {
    // Simplified: assume this is only for new customers from this page for now
    // If editing is re-introduced here, logic for editingCustomer would be needed
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
      plan: data.plan,
      installationDate: data.installationDate,
      monthlyFee: Number(data.monthlyFee),
      status: "Pending",
      nextPaymentDate: formatISO(addMonths(new Date(data.installationDate), 1)),
      paymentHistory: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
    toast({ title: "Pelanggan Ditambahkan", description: `${data.name} telah ditambahkan.` });
    
    setIsCustomerFormOpen(false);
    // setEditingCustomer(null); // No longer needed here
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
      // if (editingCustomer?.id === customerToDeleteId) { // No longer needed here
      //   setIsCustomerFormOpen(false);
      //   setEditingCustomer(null);
      // }
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDeleteId(null);
  };

  // handleOpenPaymentDialog is removed, it's on detail page
  // const handleOpenPaymentDialog = (customer: Customer) => { ... }

  // handleRecordPayment is removed, it's on detail page
  // const handleRecordPayment = (paymentData: Omit<Payment, "id" | "date">, signature: string) => { ... }
  
  const handleShowInsights = () => {
    setIsInsightsModalOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "laporan") {
      handleShowInsights();
    }
    if (tab === "beranda") {
      toast({ title: "Beranda", description: "Halaman Beranda belum diimplementasikan."});
    }
    if (tab === "pembayaran") {
      toast({ title: "Pembayaran", description: "Fungsi Pembayaran belum diimplementasikan di tab ini. Akses melalui Detail Pelanggan."});
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
  }, [customers, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <PageHeader 
        title="Pelanggan"
        onAddCustomer={handleAddCustomer}
      />
      
      {activeTab === "pelanggan" && (
        <>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Cari pelanggan (nama, ID, telepon, email)..."
          />
          <ScrollArea className="flex-grow">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <CustomerListItem 
                  key={customer.id} 
                  customer={customer} 
                  // onClick prop removed, navigation handled internally
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

      {activeTab === "beranda" && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Halaman Beranda</p></div>}
      {activeTab === "pembayaran" && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Halaman Pembayaran</p></div>}
      {activeTab === "laporan" && !isInsightsModalOpen && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Memuat Laporan...</p></div>}


      <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => {
          setIsCustomerFormOpen(false);
          // setEditingCustomer(null); // No longer needed here
        }}
        onSubmit={handleSaveCustomer}
        // defaultValues removed, this form is now only for adding new customer from this page
        // onDelete prop is also removed for add form. Deletion is handled on detail page or via swipe in future.
      />

      {/* PaymentDialog is no longer invoked directly from this page 
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setPayingCustomer(null);
        }}
        customer={payingCustomer}
        onRecordPayment={handleRecordPayment}
      />
      */}
      
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
              Pengguna yang dihapus dari sini mungkin masih perlu konfirmasi dari halaman detail jika dibuka.
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
