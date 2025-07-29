// frontend/src/components/dashboard/PatientProfileForm.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PatientProfile } from '@/types';
import ImageUploader from '@/components/ui/ImageUploader';
import Image from 'next/image';

export default function PatientProfileForm() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState<Partial<PatientProfile>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !token) return;
            setIsLoading(true);
            try {
                const { data } = await api.get(`/profiles/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(data);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setIsEditing(true);
                } else {
                    console.error('Failed to fetch patient profile', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!user || !token) return;

        try {
            const payload = { userId: user.id, ...profile };
            await api.post('/profiles/patient', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile', error);
            setMessage('Error updating profile.');
        }
    };
    
    if (isLoading) return <p>Loading profile...</p>;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Patient Profile</h1>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="w-auto">Edit Profile</Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    {profile.profilePictureUrl && (
                        <div className="text-center">
                            <Image src={profile.profilePictureUrl} alt="Profile" width={128} height={128} className="rounded-full mx-auto" />
                        </div>
                    )}
                    <ImageUploader onUploadSuccess={(url) => setProfile(p => ({ ...p, profilePictureUrl: url }))} />

                    <Input id="dateOfBirth" name="dateOfBirth" label="Date of Birth" type="date" value={profile.dateOfBirth?.split('T')[0] || ''} onChange={handleInputChange} />
                    
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                      <select id="gender" name="gender" value={profile.gender || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea id="address" name="address" value={profile.address || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    
                    <div className="flex space-x-4">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                    </div>
                    {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
                </form>
            ) : (
                <div className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
                   {profile.profilePictureUrl && (<div className="text-center"><Image src={profile.profilePictureUrl} alt="Profile" width={128} height={128} className="rounded-full mx-auto mb-4" /></div>)}
                   {profile.dateOfBirth || profile.gender || profile.address ? (
                    <>
                      <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                      <p><strong>Gender:</strong> {profile.gender || 'Not set'}</p>
                      <p><strong>Address:</strong> {profile.address || 'Not set'}</p>
                    </>
                   ) : (
                    <p>Your profile is incomplete. Click "Edit Profile" to add details.</p>
                   )}
                </div>
            )}
        </div>
    );
}