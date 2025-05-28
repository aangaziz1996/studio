// use server'
'use server';
/**
 * @fileOverview AI-powered payment insights generator.
 *
 * - generatePaymentInsights - A function that generates insights based on customer payment history.
 * - PaymentInsightsInput - The input type for the generatePaymentInsights function.
 * - PaymentInsightsOutput - The return type for the generatePaymentInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PaymentInsightsInputSchema = z.object({
  customerPaymentHistory: z
    .string()
    .describe(
      'A string containing the payment history of customers. Each customer record should include customer ID, payment dates, and payment amounts.'
    ),
});
export type PaymentInsightsInput = z.infer<typeof PaymentInsightsInputSchema>;

const PaymentInsightsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the insights generated from the customer payment history, including potential late payments and predicted churn.'
    ),
  latePayments: z
    .array(z.object({customerId: z.string(), numberOfLatePayments: z.number()}))
    .describe('List of customers with late payments and the number of late payments.'),
  predictedChurn: z
    .array(z.object({customerId: z.string(), churnRiskScore: z.number()}))
    .describe('List of customers with predicted churn risk and their churn risk score.'),
});
export type PaymentInsightsOutput = z.infer<typeof PaymentInsightsOutputSchema>;

export async function generatePaymentInsights(input: PaymentInsightsInput): Promise<PaymentInsightsOutput> {
  return paymentInsightsFlow(input);
}

const paymentInsightsPrompt = ai.definePrompt({
  name: 'paymentInsightsPrompt',
  input: {schema: PaymentInsightsInputSchema},
  output: {schema: PaymentInsightsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing customer payment history to provide insights on potential issues like late payments or predicted churn.

Analyze the following customer payment history and provide a summary of insights, including potential late payments and predicted churn. Each customer record includes customer ID, payment dates, and payment amounts.

Payment History: {{{customerPaymentHistory}}}

Based on the payment history, provide the following:

1.  A summary of the insights generated from the customer payment history, including potential late payments and predicted churn.
2.  A list of customers with late payments and the number of late payments.
3.  A list of customers with predicted churn risk and their churn risk score.

Ensure that the latePayments and predictedChurn arrays are populated based on your analysis.`,
});

const paymentInsightsFlow = ai.defineFlow(
  {
    name: 'paymentInsightsFlow',
    inputSchema: PaymentInsightsInputSchema,
    outputSchema: PaymentInsightsOutputSchema,
  },
  async input => {
    const {output} = await paymentInsightsPrompt(input);
    return output!;
  }
);
