'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

// Define the shape of a single notification
interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Define the shape of the context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  client: Client | null; // Expose the client instance
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // 1. Fetch initial notifications via REST API
    const fetchInitialNotifications = async () => {
      try {
        const response = await api.get(`/notifications/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch initial notifications", error);
      }
    };
    fetchInitialNotifications();

    // 2. Establish WebSocket connection
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:9002/ws-notifications'), // Connect to the notification proxy
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('%cSUCCESS: Notification STOMP Client Connected!', 'color: green; font-weight: bold;');
      
      // Subscribe to the user-specific queue
      client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
        const newNotification: Notification = JSON.parse(message.body);
        
        // Add new notification to the top of the list
        setNotifications((prev) => [newNotification, ...prev]);
        
        // Show a real-time toast notification
        toast.info(newNotification.message, {
            action: newNotification.link ? {
                label: 'View',
                onClick: () => {
                    // Only navigate if the link is not undefined
                    if (newNotification.link) {
                        window.location.href = newNotification.link;
                    }
                },
            } : undefined,
        });
      });
    };

    client.onDisconnect = () => setIsConnected(false);
    client.onStompError = (frame) => console.error('Notification STOMP Error:', frame.headers['message']);
    
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user, token]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    // In a full implementation, you would also call a backend endpoint to persist this change
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    // In a full implementation, you would also call a backend endpoint to persist this change
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);


  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isConnected, markAsRead, markAllAsRead, client }}>
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