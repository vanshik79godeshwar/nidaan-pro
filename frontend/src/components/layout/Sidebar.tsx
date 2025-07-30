'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  User,
  LogOut,
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

// Link definitions remain the same
const patientLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'My Appointments', icon: CalendarDays },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
];
  
const doctorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/dashboard/schedule', label: 'My Schedule', icon: ClipboardList },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
];

// Update the interface to accept the new props
interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isMobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'DOCTOR' ? doctorLinks : patientLinks;

  // The sidebar's width is now controlled by the isCollapsed state
  const sidebarClasses = `
    z-30 inset-y-0 left-0 transform transition-all duration-300 ease-in-out bg-white border-r
    flex flex-col
    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
    fixed md:relative md:translate-x-0
    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className={`flex items-center justify-between h-16 border-b px-4 ${isCollapsed ? 'md:justify-center' : 'lg:px-6'}`}>
            <span className={`font-bold text-xl text-blue-600 transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>Nidaan Pro</span>
            <span className={`font-bold text-xl text-blue-600 transition-opacity duration-200 ${isCollapsed ? 'opacity-100' : 'md:hidden'}`}>NP</span>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-600"><X size={24} /></button>
        </div>

        <nav className="flex-grow p-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const linkClass = `flex items-center p-3 my-1 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`;
            return (
              <Link key={link.href} href={link.href} className={linkClass}>
                <link.icon className={`h-6 w-6 ${!isCollapsed ? 'lg:mr-3' : ''}`} />
                <span className={`${isCollapsed ? 'md:hidden' : ''}`}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* --- Sidebar Toggle Button for Desktop --- */}
        <div className="hidden md:block border-t p-2">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center justify-center w-full p-3 text-gray-500 rounded-lg hover:bg-gray-100">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="border-t p-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                {user?.profile?.profilePictureUrl ? (<Image src={user.profile.profilePictureUrl} alt="Avatar" width={40} height={40} className="rounded-full" />) : (<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">{user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}</div>)}
                <div className={`overflow-hidden transition-all ${isCollapsed ? 'w-0 ml-0' : 'w-auto ml-3'}`}>
                    <div className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
            </div>
            <button onClick={logout} className={`w-full mt-4 flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''}`}>
                <LogOut size={20} />
                <span className={`ml-3 ${isCollapsed ? 'hidden' : ''}`}>Logout</span>
            </button>
        </div>
      </aside>
    </>
  );
}