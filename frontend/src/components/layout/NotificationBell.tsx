'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 hover:text-blue-600">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* --- THIS IS THE FIX for the panel positioning --- */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 md:right-auto md:left-0 w-80 bg-white rounded-md shadow-lg border z-50">
          <div className="p-3 flex justify-between items-center border-b">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
                 <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <CheckCheck size={14}/> Mark all as read
                </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <Link key={n.id} href={n.link || '#'} className={`block p-3 border-b hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </Link>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500 text-center">You have no notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}