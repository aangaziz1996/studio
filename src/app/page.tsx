
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { CustomerListItem } from "@/components/CustomerListItem";
import { BottomNavigationBar, type ActiveTab } from "@/components/BottomNavigationBar";
import { CustomerForm } from "@/components/CustomerForm";
import { PaymentInsightsModal } from "@/components/PaymentInsightsModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Customer, Payment } from "@/lib/types";
import { addMonths, formatISO, subDays, isWithinInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, UserCircle } from "lucide-react";

// Beranda Components
import { DashboardSummarySection } from "@/components/DashboardSummarySection";
import { NewCustomersSection } from "@/components/NewCustomersSection";
import { RecentPaymentsSection, type EnrichedPayment } from "@/components/RecentPaymentsSection";


interface DashboardData {
  totalIncomeThisMonth: number;
  activeCustomersCount: number;
  newCustomers: Customer[];
  recentPayments: EnrichedPayment[];
}

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [customers, setCustomers] = useLocalStorage<Customer[]>("elanet_customers_v2", []);
  
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("beranda"); // Default to beranda
  const [searchTerm, setSearchTerm] = useState("");

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncomeThisMonth: 0,
    activeCustomersCount: 0,
    newCustomers: [],
    recentPayments: [],
  });

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    let incomeThisMonth = 0;
    const allPayments: EnrichedPayment[] = [];

    customers.forEach(customer => {
      customer.paymentHistory.forEach(payment => {
        const paymentDate = parseISO(payment.date);
        if (isWithinInterval(paymentDate, { start: currentMonthStart, end: currentMonthEnd })) {
          incomeThisMonth += payment.amount;
        }
        allPayments.push({
          ...payment,
          customerName: customer.name,
          customerId: customer.id,
        });
      });
    });

    const calculatedNewCustomers = customers
      .filter(c => isWithinInterval(parseISO(c.installationDate), { start: thirtyDaysAgo, end: now }))
      .sort((a,b) => parseISO(b.installationDate).getTime() - parseISO(a.installationDate).getTime())
      .slice(0, 5); // Limit to 5 for display

    const sortedRecentPayments = allPayments
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5); // Limit to 5 for display

    setDashboardData({
      totalIncomeThisMonth: incomeThisMonth,
      activeCustomersCount: customers.length, // Simplified: all customers are "active" for this count
      newCustomers: calculatedNewCustomers,
      recentPayments: sortedRecentPayments,
    });

  }, [customers]);


  const handleAddCustomer = () => {
    setIsCustomerFormOpen(true);
  };

  const handleSaveCustomer = (data: Omit<Customer, "id" | "status" | "nextPaymentDate" | "paymentHistory"> & { installationDate: string }) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
      plan: data.plan,
      installationDate: data.installationDate, // This should be included from the form
      monthlyFee: Number(data.monthlyFee), // This should be included from the form
      status: "Pending",
      nextPaymentDate: formatISO(addMonths(new Date(data.installationDate), 1)),
      paymentHistory: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
    toast({ title: "Pelanggan Ditambahkan", description: `${data.name} telah ditambahkan.` });
    setIsCustomerFormOpen(false);
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
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDeleteId(null);
  };
  
  const handleShowInsights = () => {
    setIsInsightsModalOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "laporan") {
      handleShowInsights();
    }
    // Beranda toast removed as it's now implemented
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
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm]);

  const getPageTitle = () => {
    switch (activeTab) {
      case "beranda": return "Beranda";
      case "pelanggan": return "Pelanggan";
      case "pembayaran": return "Pembayaran";
      case "laporan": return "Laporan";
      default: return "ELANET";
    }
  };

  const getHeaderRightContent = () => {
    if (activeTab === "pelanggan") {
      return (
        <Button onClick={handleAddCustomer} variant="ghost" size="icon">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Tambah Pelanggan</span>
        </Button>
      );
    }
    if (activeTab === "beranda") {
      return (
        <Button variant="ghost" size="icon" onClick={() => toast({title: "Profil", description: "Halaman profil belum diimplementasikan."})}>
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">Profil Pengguna</span>
        </Button>
      );
    }
    return <div className="w-10 h-10" />; // Placeholder for spacing
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <PageHeader 
        title={getPageTitle()}
        rightContent={getHeaderRightContent()}
      />
      
      {activeTab === "beranda" && (
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-6">
            <div className="p-4 bg-card rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-foreground">Selamat datang, Admin!</h2>
                <p className="text-muted-foreground">Lihat ringkasan aktivitas terbaru Anda.</p>
            </div>
            <DashboardSummarySection 
              totalIncomeThisMonth={dashboardData.totalIncomeThisMonth}
              activeCustomersCount={dashboardData.activeCustomersCount}
            />
            <NewCustomersSection newCustomers={dashboardData.newCustomers} />
            <RecentPaymentsSection recentPayments={dashboardData.recentPayments} />
          </div>
        </ScrollArea>
      )}

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
      
      {activeTab === "pembayaran" && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Halaman Pembayaran (Akses melalui Detail Pelanggan)</p></div>}
      {activeTab === "laporan" && !isInsightsModalOpen && <div className="flex-grow flex items-center justify-center"><p className="text-muted-foreground">Memuat Laporan...</p></div>}


      <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => {
          setIsCustomerFormOpen(false);
        }}
        onSubmit={handleSaveCustomer}
        // Pass all fields required by CustomerForm, installationDate and monthlyFee are needed for new customers
        // For editing, these would come from defaultValues if the form was used for editing.
        // Since this CustomerForm instance is only for adding, we don't set defaultValues.
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
