
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import SignaturePad from "@/components/SignaturePad";
import type { Customer, Payment } from "@/lib/types";
import { XIcon, Save } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { ScrollArea } from './ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onRecordPayment: (payment: Omit<Payment, "id" | "date">, signature: string) => void;
}

export function PaymentDialog({ isOpen, onClose, customer, onRecordPayment }: PaymentDialogProps) {
  const [amount, setAmount] = useState<number | string>("");
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [isSignaturePadEmpty, setIsSignaturePadEmpty] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && customer) {
      setAmount(customer.monthlyFee); // Pre-fill amount with monthly fee
      setSignature(undefined);
      setIsSignaturePadEmpty(true);
    }
  }, [isOpen, customer]);

  if (!customer) return null;

  const handleSaveSignature = (sigDataUrl: string, isEmpty: boolean) => {
    setSignature(sigDataUrl);
    setIsSignaturePadEmpty(isEmpty);
  };

  const handleSubmit = () => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof numericAmount !== 'number' || numericAmount <= 0) {
      toast({ title: "Error", description: "Silakan masukkan jumlah pembayaran yang valid.", variant: "destructive" });
      return;
    }
    if (!signature || isSignaturePadEmpty) {
      toast({ title: "Error", description: "Tanda tangan digital wajib diisi.", variant: "destructive" });
      return;
    }
    onRecordPayment({ amount: numericAmount }, signature);
    // Reset state handled by useEffect on open
    onClose(); // Close dialog after successful submission
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-full h-full flex flex-col p-0 overflow-hidden bg-slate-50">
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm sticky top-0 z-10">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
              <XIcon className="h-6 w-6" />
            </Button>
          </DialogClose>
          <h2 className="text-lg font-semibold text-slate-800">
            Pembayaran
          </h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <ScrollArea className="flex-grow">
          <div className="bg-emerald-700 text-white py-8 px-4 flex flex-col items-center justify-center">
            <AppLogo textClassName="text-4xl text-white" className="text-white" hideIcon={false} iconClassName="h-10 w-10" />
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Detail Pembayaran</h3>
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nama Pelanggan</Label>
                  <p className="font-medium text-slate-700">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">ID Pelanggan: {customer.id.slice(-8)}</p>
                </div>
                <hr/>
                <div>
                  <Label className="text-xs text-muted-foreground">Nomor Telepon</Label>
                  <p className="font-medium text-slate-700">{customer.phoneNumber}</p>
                   <p className="text-xs text-muted-foreground">Paket: {customer.plan}</p>
                </div>
                 <hr/>
                <div>
                  <Label className="text-xs text-muted-foreground">Jumlah Tagihan</Label>
                  <p className="font-medium text-slate-700">{formatCurrency(customer.monthlyFee)}</p>
                </div>
                 <hr/>
                <div>
                  <Label className="text-xs text-muted-foreground">Tanggal Jatuh Tempo</Label>
                  <p className="font-medium text-slate-700">{format(parseISO(customer.nextPaymentDate), "dd MMMM yyyy", { locale: indonesiaLocale })}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-slate-700 block mb-1">Jumlah Dibayar</Label>
               <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                <span className="text-slate-500 mr-2">Rp</span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                  placeholder="Masukkan Jumlah"
                  className="border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full text-base"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Tanda Tangan Digital</h3>
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-3 text-center">Mohon minta pelanggan untuk tanda tangan di bawah ini sebagai bukti pembayaran.</p>
                <SignaturePad onSave={handleSaveSignature} backgroundColor="hsl(var(--card))" penColor="hsl(var(--card-foreground))" />
                {signature && !isSignaturePadEmpty && (
                  <p className="text-xs text-green-600 mt-2">Tanda tangan telah disimpan.</p>
                )}
                 {signature && isSignaturePadEmpty && (
                  <p className="text-xs text-yellow-600 mt-2">Kanvas tanda tangan kosong.</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 sm:p-6 border-t bg-white sticky bottom-0 z-10">
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            size="lg"
            disabled={!signature || isSignaturePadEmpty || !(typeof amount === 'number' && amount > 0)}
          >
            <Save className="mr-2 h-5 w-5" />
            Simpan Pembayaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
