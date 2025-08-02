'use client'; 

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'sonner';

// This is a special layout that ONLY applies to routes inside the (consultation) group.
// It should NOT contain <html> or <body> tags, as those are already in the root layout.
export default function ConsultationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We only need the providers and the children here.
    // The parent layout will handle the rest.
    <>
      <Toaster position="top-right" richColors />
      <AuthProvider>
          {children}
      </AuthProvider>
    </>
  );
}