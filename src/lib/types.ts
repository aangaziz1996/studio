export type Payment = {
  id: string;
  date: string; // ISO string
  amount: number;
  signature?: string; // base64 string
};

export type CustomerStatus = 'Paid' | 'Pending' | 'Overdue';

export type Customer = {
  id: string;
  name: string;
  address: string;
  plan: string;
  installationDate: string; // ISO string
  status: CustomerStatus;
  nextPaymentDate: string; // ISO string
  paymentHistory: Payment[];
};
