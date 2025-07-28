'use client';

import { useState, useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';

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

    useEffect(() => {
        if (!token || !user || !recipientId) {
            return;
        }

        // This logic correctly handles React Strict Mode by ensuring only one client is active.
        if (!clientRef.current) {
            console.log("Creating new STOMP client instance...");
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:9000/ws'),
                connectHeaders: { Authorization: `Bearer ${token}` },
                debug: (str) => console.log(`STOMP: ${str}`),
                reconnectDelay: 5000,
            });

            client.onConnect = (frame) => {
                console.log(`%cSUCCESS: STOMP Client Connected! User: ${frame.headers['user-name']}`, 'color: green; font-weight: bold;');
                client.subscribe(`/user/${frame.headers['user-name']}/queue/messages`, (message) => {
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                });
            };

            client.onStompError = (frame) => {
                console.error('Broker reported error:', frame.headers['message'], 'Additional details:', frame.body);
            };

            clientRef.current = client;
            client.activate();
        }

        // The cleanup function will run when the component is finally unmounted.
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
            const sentMessage: ChatMessage = { ...chatMessage, id: new Date().toISOString(), timestamp: new Date().toISOString() };
            setMessages((prevMessages) => [...prevMessages, sentMessage]);
        } else {
            console.error('ERROR: Cannot send message. STOMP client is not connected.');
        }
    };

    return { messages, sendMessage };
}