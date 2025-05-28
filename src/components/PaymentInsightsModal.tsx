"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generatePaymentInsights, type PaymentInsightsOutput } from "@/ai/flows/payment-insights";
import type { Customer } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PaymentInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
}

// Helper function to format customer payment history for AI
const formatCustomerPaymentHistoryForAI = (customers: Customer[]): string => {
  return customers
    .map(customer => {
      const paymentsString = customer.paymentHistory
        .map(p => `[Date: ${p.date}, Amount: ${p.amount}]`)
        .join(', ');
      return `Customer ID: ${customer.id}, Name: ${customer.name}, Payments: ${paymentsString || 'No payments recorded'}`;
    })
    .join('; ');
};

export function PaymentInsightsModal({ isOpen, onClose, customers }: PaymentInsightsModalProps) {
  const [insights, setInsights] = useState<PaymentInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customers.length > 0) {
      const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);
        setInsights(null);
        try {
          const customerPaymentHistory = formatCustomerPaymentHistoryForAI(customers);
          const result = await generatePaymentInsights({ customerPaymentHistory });
          setInsights(result);
        } catch (err) {
          console.error("Error generating payment insights:", err);
          setError("Failed to generate insights. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchInsights();
    }
  }, [isOpen, customers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Payment Insights</DialogTitle>
          <DialogDescription>
            Analysis of customer payment history to identify trends, potential late payments, and churn risks.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating insights...</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {insights && !isLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{insights.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potential Late Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {insights.latePayments.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {insights.latePayments.map((lp, index) => (
                          <li key={index}>
                            Customer ID {lp.customerId}: {lp.numberOfLatePayments} late payment(s)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific late payments identified.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Predicted Churn Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {insights.predictedChurn.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {insights.predictedChurn.map((cr, index) => (
                          <li key={index}>
                            Customer ID {cr.customerId}: Risk Score {cr.churnRiskScore.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific churn risks identified.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
             {!insights && !isLoading && !error && customers.length === 0 && (
                <p className="text-center text-muted-foreground">No customer data available to generate insights.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
