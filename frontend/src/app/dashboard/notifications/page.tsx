'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Bell, CheckCircle } from 'lucide-react';

// Define the shape of a single notification
interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !token) return;
      try {
        const response = await api.get(`/notifications/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to fetch notifications. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user, token]);

  if (loading) return <p>Loading notification history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notification History</h1>
      <div className="bg-white rounded-lg shadow-md border">
        <ul className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <li key={n.id} className={`p-4 ${n.read ? 'opacity-60' : 'font-semibold'}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    {n.read ? <CheckCircle className="h-5 w-5 text-gray-400" /> : <Bell className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="p-6 text-center text-gray-500">Your notification history is empty.</p>
          )}
        </ul>
      </div>
    </div>
  );
}


export default function ProtectedNotificationsPage() {
  return (
    <ProtectedRoute>
      <AllNotificationsPage />
    </ProtectedRoute>
  );
}