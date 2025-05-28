
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format, parseISO, addMonths, formatISO } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { PaymentDialog } from "@/components/PaymentDialog";
import { CustomerForm, type CustomerFormValues } from "@/components/CustomerForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Customer, Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const customerId = params.id as string;

  const [customers, setCustomers] = useLocalStorage<Customer[]>("elanet_customers_v2", []);
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === customerId);
    if (foundCustomer) {
      setCustomer(foundCustomer);
    } else if (customers.length > 0 && !foundCustomer) { 
      toast({ title: "Error", description: "Pelanggan tidak ditemukan.", variant: "destructive" });
      router.replace("/"); 
    }
  }, [customerId, customers, router, toast]);

  const handleRecordPayment = (paymentData: Omit<Payment, "id" | "date">, signature: string) => {
    if (!customer) return;

    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      date: formatISO(new Date()),
      signature: signature,
    };

    setCustomers(prevCustomers =>
      prevCustomers.map(c =>
        c.id === customer.id
          ? {
              ...c,
              status: "Paid", // Automatically set to Paid on new payment
              paymentHistory: [...c.paymentHistory, newPayment].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
              nextPaymentDate: formatISO(addMonths(parseISO(c.nextPaymentDate), 1)) // Ensure nextPaymentDate is parsed before adding months
            }
          : c
      )
    );
    toast({ title: "Pembayaran Dicatat", description: `Pembayaran untuk ${customer.name} telah dicatat.` });
    setIsPaymentDialogOpen(false);
  };
  
  // Updated to accept CustomerFormValues (name, phoneNumber, email, address, plan, status)
  const handleSaveCustomer = (data: CustomerFormValues) => {
    if (!customer) return;
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { 
          ...customer, // Keep existing full customer data
          // Update only fields from the form
          name: data.name,
          phoneNumber: data.phoneNumber,
          email: data.email,
          address: data.address,
          plan: data.plan,
          status: data.status, // Update status from form
      } : c)
    );
    toast({ title: "Pelanggan Diperbarui", description: `Detail ${data.name} telah diperbarui.` });
    setIsCustomerFormOpen(false);
  };

  const handleDeleteCustomerRequest = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCustomer = () => {
    if (customer) {
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      toast({ title: "Pelanggan Dihapus", description: `${customer.name} telah dihapus.`, variant: "destructive" });
      router.replace("/"); 
    }
    setIsDeleteDialogOpen(false);
  };


  if (!customer && customers.length === 0) { 
    return <div className="flex items-center justify-center min-h-screen"><p>Memuat data pelanggan...</p></div>;
  }
  if (!customer && customers.length > 0) { 
     return <div className="flex items-center justify-center min-h-screen"><p>Pelanggan tidak ditemukan.</p></div>;
  }
  if (!customer) return null; 

  const paymentStatusText = customer.status === "Paid" ? "Lunas" : 
                            customer.status === "Overdue" ? "Jatuh Tempo" : "Belum Dibayar";
  const paymentStatusColor = customer.status === "Paid" ? "text-green-600" :
                             customer.status === "Overdue" ? "text-red-600" : "text-yellow-600";

  const infoItems = [
    { label: "Nomor Telepon", value: customer.phoneNumber },
    { label: "Email", value: customer.email || "-" },
    { label: "Tanggal Pendaftaran", value: format(parseISO(customer.installationDate), "dd MMMM yyyy", { locale: indonesiaLocale }) },
  ];
  
  const sortedPaymentHistory = [...customer.paymentHistory].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());


  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Detail Pelanggan</h1>
        <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={() => setIsCustomerFormOpen(true)}>
                <Edit className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDeleteCustomerRequest} className="text-destructive hover:text-destructive">
                <Trash2 className="h-5 w-5" />
            </Button>
        </div>
      </header>

      <ScrollArea className="flex-grow pb-24">
        <div className="bg-emerald-700 text-white py-8 px-4 flex flex-col items-center justify-center">
          <AppLogo hideIcon subtitle="Natural" textClassName="text-4xl text-white" subtitleClassName="text-sm text-white opacity-90 tracking-wider" className="text-white"/>
        </div>

        <div className="flex flex-col items-center p-6 bg-white -mt-12 mx-4 rounded-lg shadow-lg relative z-10">
          <Image
            src={`https://placehold.co/100x100.png`}
            alt={`Avatar for ${customer.name}`}
            width={100}
            height={100}
            className="rounded-full border-4 border-white shadow-md"
            data-ai-hint="man portrait"
          />
          <h2 className="text-2xl font-bold mt-4">{customer.name}</h2>
          <p className="text-sm text-muted-foreground">ID Pelanggan: {customer.id.slice(-6)}</p>
          <p className="text-sm text-muted-foreground text-center mt-1">{customer.address}</p>
        </div>

        <div className="p-4 mt-6">
          <h3 className="text-xl font-semibold mb-3 text-slate-800 px-2">Informasi Kontak</h3>
          <div className="bg-white rounded-lg shadow p-2">
            {infoItems.map((item, index) => (
              <div key={item.label} className={`flex justify-between py-3 px-2 ${index < infoItems.length -1 ? 'border-b' : ''}`}>
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm text-slate-700 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 mt-2">
          <h3 className="text-xl font-semibold mb-3 text-slate-800 px-2">Status Pembayaran</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Tagihan Bulan Ini</p>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(customer.monthlyFee)}</p>
              </div>
              <span className={cn("font-semibold px-2 py-1 rounded text-sm", paymentStatusColor, 
                                  customer.status === 'Paid' ? 'bg-green-100' : 
                                  customer.status === 'Overdue' ? 'bg-red-100' : 'bg-yellow-100')}>
                {paymentStatusText}
              </span>
            </div>
             <p className="text-xs text-muted-foreground mt-1">
                Jatuh tempo berikutnya: {format(parseISO(customer.nextPaymentDate), "dd MMMM yyyy", { locale: indonesiaLocale })}
            </p>
          </div>
        </div>

        <div className="p-4 mt-2">
          <h3 className="text-xl font-semibold mb-3 text-slate-800 px-2">Riwayat Pembayaran</h3>
          <div className="bg-white rounded-lg shadow p-2">
            {sortedPaymentHistory.length > 0 ? (
              sortedPaymentHistory.map((payment, index) => (
                <div key={payment.id} className={`flex justify-between py-3 px-2 ${index < sortedPaymentHistory.length -1 ? 'border-b' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Pembayaran {format(parseISO(payment.date), "MMMM yyyy", { locale: indonesiaLocale })}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(payment.date), "dd MMMM yyyy", { locale: indonesiaLocale })}</p>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{formatCurrency(payment.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 px-2">Belum ada riwayat pembayaran.</p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md-top flex space-x-3 z-20">
        <Button 
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" 
          size="lg"
          onClick={() => setIsPaymentDialogOpen(true)}
          disabled={customer.status === 'Paid'}
        >
          Bayar Tagihan
        </Button>
        <Button 
          variant="outline" 
          className="flex-1" 
          size="lg"
          onClick={() => {
            if (customer.phoneNumber) {
              window.location.href = `tel:${customer.phoneNumber}`;
            } else {
              toast({title: "Info", description: "Nomor telepon pelanggan tidak tersedia."})
            }
          }}
        >
          Hubungi Pelanggan
        </Button>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        customer={customer}
        onRecordPayment={handleRecordPayment}
      />
      
      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
        onSubmit={handleSaveCustomer}
        defaultValues={customer} 
        onDelete={undefined} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data {customer.name} secara permanen. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

