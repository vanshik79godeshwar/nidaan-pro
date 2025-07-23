'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function ChatPage() {
    const params = useParams();
    const recipientId = params.id as string;
    const { user } = useAuth();
    const { messages, sendMessage } = useWebSocket(recipientId);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] bg-white rounded-lg shadow-md">
            {/* Chat Header */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Chat with User</h2>
                <p className="text-sm text-gray-500">{recipientId}</p>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.senderId === user?.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input Form */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                    <Input
                        id="message"
                        label=""
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button type="submit" className="w-auto">Send</Button>
                </form>
            </div>
        </div>
    );
}

export default function ProtectedChatPage() {
    return (
        <ProtectedRoute>
            <ChatPage />
        </ProtectedRoute>
    );
}