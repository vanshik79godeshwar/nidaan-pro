// frontend/src/hooks/useWebSocket.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api'; // Import api

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
    const clientRef = useRef<Client | null>(null);

    // This new useEffect will fetch the chat history
    useEffect(() => {
        const fetchHistory = async () => {
            if (user && recipientId && token) {
                try {
                    const response = await api.get(`/chat/history`, {
                        params: { userId1: user.id, userId2: recipientId },
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMessages(response.data);
                } catch (error) {
                    console.error("Failed to fetch chat history", error);
                }
            }
        };
        fetchHistory();
    }, [user, recipientId, token]);


    useEffect(() => {
        if (!token || !user || !recipientId) {
            return;
        }

        if (!clientRef.current) {
            console.log("Creating new STOMP client instance...");
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:9001/ws'), // Use Gateway
                connectHeaders: { Authorization: `Bearer ${token}` },
                debug: (str) => console.log(`STOMP: ${str}`),
                reconnectDelay: 5000,
            });

            client.onConnect = (frame) => {
                console.log(`%cSUCCESS: STOMP Client Connected! User: ${frame.headers['user-name']}`, 'color: green; font-weight: bold;');
                client.subscribe(`/user/${frame.headers['user-name']}/queue/messages`, (message) => {
                    // Add new incoming messages to the existing history
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                });
            };

            client.onStompError = (frame) => {
                console.error('Broker reported error:', frame.headers['message'], 'Additional details:', frame.body);
            };

            clientRef.current = client;
            client.activate();
        }

        return () => {
            if (clientRef.current) {
                console.log("Deactivating STOMP client and cleaning up ref...");
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [token, user, recipientId]);

    const sendMessage = (content: string) => {
    if (clientRef.current?.connected && user && recipientId) {
      const chatMessage = {
        senderId: user.id,
        recipientId: recipientId,
        content: content,
      };
      clientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });

      // --- THIS IS THE FIX ---
      // Optimistically add the sent message to our own state.
      // We create a temporary message object to display immediately.
      const sentMessage: ChatMessage = {
        ...chatMessage,
        id: new Date().toISOString(), // Temporary ID
        timestamp: new Date().toISOString(), // Temporary timestamp
      };
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      // The backend will still save the real message with its own ID and timestamp.

    } else {
      console.error('ERROR: Cannot send message. STOMP client is not connected.');
    }
  };

    return { messages, sendMessage };
}