"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CustomerTable } from "@/components/CustomerTable";
import { CustomerForm } from "@/components/CustomerForm";
import { PaymentDialog } from "@/components/PaymentDialog";
import { PaymentInsightsModal } from "@/components/PaymentInsightsModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Customer, Payment } from "@/lib/types";
import { addMonths, formatISO } from "date-fns";

export default function Home() {
  const { toast } = useToast();
  const [customers, setCustomers] = useLocalStorage<Customer[]>("elanet_customers", []);
  
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

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
        prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...data } : c)
      );
      toast({ title: "Customer Updated", description: `${data.name}'s details have been updated.` });
    } else {
      const newCustomer: Customer = {
        ...data,
        id: Date.now().toString(), // Simple ID generation
        status: "Pending",
        nextPaymentDate: formatISO(addMonths(new Date(data.installationDate), 1)),
        paymentHistory: [],
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast({ title: "Customer Added", description: `${data.name} has been added.` });
    }
    setIsCustomerFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomerToDeleteId(customerId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCustomer = () => {
    if (customerToDeleteId) {
      const customerName = customers.find(c => c.id === customerToDeleteId)?.name || "Customer";
      setCustomers(prev => prev.filter(c => c.id !== customerToDeleteId));
      toast({ title: "Customer Deleted", description: `${customerName} has been removed.`, variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDeleteId(null);
  };

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
            nextPaymentDate: formatISO(addMonths(new Date(c.nextPaymentDate), 1)) // Assuming monthly cycle
          } 
        : c
      )
    );
    toast({ title: "Payment Recorded", description: `Payment for ${payingCustomer.name} has been recorded.` });
    setIsPaymentDialogOpen(false);
    setPayingCustomer(null);
  };
  
  const handleShowInsights = () => {
    setIsInsightsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onAddCustomer={handleAddCustomer}
        onShowInsights={handleShowInsights}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CustomerTable
          customers={customers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onRecordPayment={handleOpenPaymentDialog}
        />
      </main>

      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => {
          setIsCustomerFormOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleSaveCustomer}
        defaultValues={editingCustomer || undefined}
      />

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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
