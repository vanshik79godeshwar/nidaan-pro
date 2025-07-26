'use client';

import { useState, useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';

// Define the shape of a chat message
interface ChatMessage {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
}

export function useWebSocket(recipientId: string | null) {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // Use a ref to hold the client instance. This is the main fix.
    const stompClientRef = useRef<Client | null>(null);

    // In frontend/src/hooks/useWebSocket.ts

  useEffect(() => {
    if (!token || !user || !recipientId) {
      return;
    }

    // Create a new client instance on every effect run
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:9000/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP: ', str);
      },
      reconnectDelay: 5000,
    });

    client.onConnect = (frame) => {
      console.log('Connected to WebSocket: ' + frame.headers['user-name']);
      
      // Subscribe to personal queue for incoming messages
      // Note: We use the user-name from the frame headers which is the authenticated user's ID
      client.subscribe(`/user/${frame.headers['user-name']}/queue/messages`, (message) => {
        const newMessage = JSON.parse(message.body) as ChatMessage;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Activate the client
    client.activate();

    // The cleanup function will run when the component unmounts or dependencies change
    return () => {
      client.deactivate();
      console.log('STOMP client deactivated');
    };
  }, [token, user, recipientId]); // Dependencies remain the same
  
    const sendMessage = (content: string) => {
        // Check the ref's current value AND if it's connected
        if (stompClientRef.current && stompClientRef.current.connected && user && recipientId) {
            const chatMessage = {
                senderId: user.id,
                recipientId: recipientId,
                content: content,
            };
            stompClientRef.current.publish({
                destination: '/app/chat',
                body: JSON.stringify(chatMessage),
            });
            
            // Optimistically add the sent message to the UI
            const sentMessage: ChatMessage = {
                ...chatMessage,
                id: new Date().toISOString(),
                timestamp: new Date().toISOString(),
            };
            setMessages((prevMessages) => [...prevMessages, sentMessage]);
        } else {
            console.error('Cannot send message: STOMP client is not connected.');
        }
    };

    return { messages, sendMessage };
}