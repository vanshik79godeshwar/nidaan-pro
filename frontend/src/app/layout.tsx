'use client'; // <-- Add this line at the top

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation"; // <-- Import usePathname

const inter = Inter({ subsets: ["latin"] });

// Metadata can be exported separately in new Next.js versions
// export const metadata = { ... };

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
        <AuthProvider>
          {!isDashboard && <Header />} {/* Conditionally render Header */}
          <main className={`flex-grow ${!isDashboard ? 'container mx-auto px-6 py-8' : ''}`}>
            {children}
          </main>
          {!isDashboard && <Footer />} {/* Conditionally render Footer */}
        </AuthProvider>
      </body>
    </html>
  );
}