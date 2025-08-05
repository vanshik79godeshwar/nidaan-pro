'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

// This interface must match your backend model exactly
interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean; // Using 'read' to match your working backend model
  createdAt: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  client: Client | null;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const fetchInitialNotifications = useCallback(async () => {
    if (!user || !token) return;
    try {
      const response = await api.get(`/notifications/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch initial notifications", error);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && token) {
      fetchInitialNotifications();
    }
  }, [user, token, fetchInitialNotifications]);

  useEffect(() => {
    if (!user || !token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:9002/ws-notifications'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      setIsConnected(true);
      console.log('%cSUCCESS: Notification STOMP Client Connected!', 'color: green; font-weight: bold;');
      
      stompClient.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
        const newNotification: Notification = JSON.parse(message.body);
        setNotifications((prev) => [newNotification, ...prev]);
        
        toast.info(newNotification.message, {
            action: newNotification.link ? { label: 'View', onClick: () => { if (newNotification.link) window.location.href = newNotification.link; } } : undefined,
        });
      });
    };

    stompClient.onDisconnect = () => setIsConnected(false);
    stompClient.onStompError = (frame) => console.error('Notification STOMP Error:', frame.headers['message']);
    
    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [user, token]);

  // This correctly calculates the count based on the 'read' field
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = useCallback(async () => {
    if (!user || !token || unreadCount === 0) return;

    // --- THIS IS THE KEY TO THE REAL-TIME UPDATE ---
    // This "optimistic update" immediately changes the state on the frontend.
    // We are now correctly setting 'read: true'.
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await api.post(`/notifications/${user.id}/mark-as-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
      toast.error("Could not sync read status with the server.");
      // If the API call fails, we revert the UI change by refetching the original data
      fetchInitialNotifications(); 
    }
  }, [user, token, unreadCount, fetchInitialNotifications]);

  // The context value now includes the corrected markAllAsRead function
  const value = { notifications, unreadCount, isConnected, markAllAsRead, client };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}