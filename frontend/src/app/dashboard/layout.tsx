import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header'; // Import the main header

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Main dashboard container takes full screen height */}
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header /> {/* We'll use the main header here for consistency */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-8">
                {children}
            </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}