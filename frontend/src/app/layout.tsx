'use client'; 

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from '@/context/NotificationContext'; 
import { usePathname } from "next/navigation";
import { Toaster } from 'sonner';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // --- THIS IS THE FIX ---
  // We check if the path is for the dashboard or the call page
  const isDashboard = pathname.startsWith('/dashboard');
  const isCall = pathname.startsWith('/call'); // New check for the call page

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
        
        <Toaster position="top-right" richColors />
        
        <AuthProvider>
          <NotificationProvider>
          {!isDashboard && !isCall && <Header />}
          <main className={`flex-grow ${!isDashboard && !isCall ? 'container mx-auto px-6 py-8' : ''}`}>
            {children}
          </main>
          {!isDashboard && !isCall && <Footer />}
        </NotificationProvider>
      </AuthProvider>
    </body>
  </html>
);
}