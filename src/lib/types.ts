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
  phoneNumber: string; // Added new field
  address: string;
  plan: string; // Represents "Paket WiFi"
  installationDate: string; // ISO string
  monthlyFee: number; // Added new field
  status: CustomerStatus;
  nextPaymentDate: string; // ISO string
  paymentHistory: Payment[];
};
