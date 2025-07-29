// frontend/src/app/layout.tsx
'use client'; 

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Script from 'next/script'; // Import the Next.js Script component

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Add the Razorpay script here */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        
        <AuthProvider>
          {!isDashboard && <Header />}
          <main className={`flex-grow ${!isDashboard ? 'container mx-auto px-6 py-8' : ''}`}>
            {children}
          </main>
          {!isDashboard && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}