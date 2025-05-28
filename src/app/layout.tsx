
import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Using Geist Sans only for simplicity as per image
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Adjusted weights
});

// const geistMono = Geist_Mono({ // Removing Mono for now, not prominent in new design
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'ELANET Digital Ledger',
  description: 'Kelola pembayaran pelanggan untuk layanan WiFi ELANET.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
