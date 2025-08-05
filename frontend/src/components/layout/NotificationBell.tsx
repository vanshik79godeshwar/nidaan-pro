'use client';

import { useState, useMemo } from 'react';
import { Bell, CheckCheck, History } from 'lucide-react'; // Import the History icon
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';


export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Filter for only unread notifications to display in the dropdown
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  // console.log('Unread notifications:', unreadNotifications);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="Open notifications"
      >
        <Bell size={24} />
        {/* The unreadCount logic is already correct for the badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 md:right-auto md:left-0 w-80 bg-white rounded-md shadow-lg border z-50">
          <div className="p-3 flex justify-between items-center border-b">
            <h4 className="font-semibold text-gray-800">Notifications</h4>
            {unreadCount > 0 && (
                 <button 
                    onClick={handleMarkAllRead} 
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                 >
                    <CheckCheck size={14}/> Mark all as read
                </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map(n => (
                <Link 
                  key={n.id} 
                  href={n.link || '#'} 
                  onClick={() => setIsOpen(false)}
                  className="block p-3 border-b hover:bg-gray-50 bg-blue-50 transition-colors"
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </Link>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500 text-center">You have no new notifications.</p>
            )}
          </div>
          {/* --- THIS IS THE NEW FOOTER WITH THE LINK --- */}
          <div className="border-t p-2 text-center">
            <Link 
              href="/dashboard/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}