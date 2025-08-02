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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isMobileOpen={sidebarOpen} 
          setMobileOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* This div now correctly fills the remaining space without extra margin */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {/* By removing 'container' and 'mx-auto', this div will fill its parent */}
            <div className="px-6 py-8 relative h-full">
              
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