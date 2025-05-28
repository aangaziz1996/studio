"use client";

import { useState } from 'react';
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

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onRecordPayment: (payment: Omit<Payment, "id" | "date">, signature: string) => void;
}

export function PaymentDialog({ isOpen, onClose, customer, onRecordPayment }: PaymentDialogProps) {
  const [amount, setAmount] = useState<number | string>("");
  const [signature, setSignature] = useState<string | undefined>(undefined);

  if (!customer) return null;

  const handleSaveSignature = (sigDataUrl: string) => {
    setSignature(sigDataUrl);
  };

  const handleSubmit = () => {
    if (typeof amount !== 'number' || amount <= 0) {
      // Basic validation, can be improved with react-hook-form if complex
      alert("Please enter a valid amount.");
      return;
    }
    if (!signature) {
      alert("Please capture a signature.");
      return;
    }
    onRecordPayment({ amount }, signature);
    setAmount("");
    setSignature(undefined);
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAmount("");
      setSignature(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment for {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Digital Signature</Label>
            <SignaturePad onSave={handleSaveSignature} />
            {signature && (
              <p className="text-xs text-green-600 mt-1">Signature captured.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={!signature || !amount}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
