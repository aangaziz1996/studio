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
  phoneNumber: string;
  email?: string; // Added email field, optional
  address: string;
  plan: string; // Represents "Paket WiFi"
  installationDate: string; // ISO string
  monthlyFee: number;
  status: CustomerStatus;
  nextPaymentDate: string; // ISO string
  paymentHistory: Payment[];
};
