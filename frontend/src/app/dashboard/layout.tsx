'use client';

import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // --- ADD THIS STATE ---
  // This state will control the collapsed/expanded view on desktop.
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isMobileOpen={sidebarOpen} 
          setMobileOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed} // Pass the new state and setter down
        />

        {/* --- UPDATE THIS DIV --- */}
        {/* The main content area will now adjust its left margin based on the sidebar's state */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8 relative">
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-200 absolute top-4 left-4 z-10"
              >
                <Menu size={24} />
              </button>
              
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}