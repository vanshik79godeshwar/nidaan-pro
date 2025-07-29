// frontend/src/app/dashboard/messages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

// A simple type for our contact list
interface ChatContact {
  id: string;
  fullName: string;
}

function MessagesPage() {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user || !token) return;

      try {
        // 1. Get the list of user IDs to chat with
        const partnersRes = await api.get(`/consultations/chat-partners/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (partnersRes.data.length === 0) {
            setLoading(false);
            return;
        }

        // 2. Get the user details (like names) for those IDs
        const detailsRes = await api.post('/users/details', partnersRes.data, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setContacts(detailsRes.data);

      } catch (err) {
        setError('Failed to fetch your conversations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user, token]);

  if (loading) return <p>Loading your conversations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
      <div className="space-y-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Link key={contact.id} href={`/chat/${contact.id}`}>
              <div className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer">
                <p className="font-semibold text-lg">{contact.fullName}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>You have no conversations yet. Book an appointment to start a chat.</p>
        )}
      </div>
    </div>
  );
}

export default function ProtectedMessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  );
}