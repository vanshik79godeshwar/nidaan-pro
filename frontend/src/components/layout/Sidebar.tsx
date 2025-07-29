'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// Define the links that will appear in the sidebar
const patientLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'My Profile' },
  { href: '/dashboard/appointments', label: 'My Appointments' },
  { href: '/dashboard/messages', label: 'Messages' },
];

const doctorLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/appointments', label: 'My Appointments' },
  { href: '/dashboard/profile', label: 'My Profile' },
  { href: '/dashboard/schedule', label: 'My Schedule' },
  { href: '/dashboard/messages', label: 'Messages' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'DOCTOR' ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-md text-gray-700 ${
              pathname === link.href
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}