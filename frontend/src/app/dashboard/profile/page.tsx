'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Define types for our data
interface Speciality {
    id: number;
    name: string;
}

interface DoctorProfile {
    specialityId: number;
    medicalLicenseNumber: string;
    bio: string;
    yearsOfExperience: number;
    consultationFee: number;
}

export default function DoctorProfilePage() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !token) return;
            setIsLoading(true);
            try {
                // Fetch existing profile and all specialities in parallel
                const [profileRes, specialitiesRes] = await Promise.all([
                    api.get(`/profiles/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (profileRes.data) {
                    setProfile(profileRes.data.doctorProfile);
                }
                setSpecialities(specialitiesRes.data);

            } catch (error) {
                console.error('Failed to fetch data', error);
                // If no profile exists, set an empty state and go directly to edit mode
                setIsEditing(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, token]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!user || !token || !profile) return;

        try {
            const payload = {
                userId: user.id,
                ...profile
            };
            await api.post('/profiles/doctor', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Profile updated successfully!');
            setIsEditing(false); // Exit edit mode on success
        } catch (error) {
            console.error('Failed to save profile', error);
            setMessage('Error updating profile.');
        }
    };
    
    if (isLoading) return <p>Loading profile...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="w-auto">Edit Profile</Button>
                )}
            </div>

            {isEditing ? (
                // EDIT MODE
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label htmlFor="speciality" className="block text-sm font-medium text-gray-700">Speciality</label>
                      <select 
                        id="speciality"
                        value={profile?.specialityId || ''}
                        onChange={e => setProfile(p => p ? {...p, specialityId: parseInt(e.target.value)} : null)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a speciality</option>
                        {specialities.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                      </select>
                    </div>

                    <Input id="license" label="Medical License Number" value={profile?.medicalLicenseNumber || ''} onChange={e => setProfile(p => p ? {...p, medicalLicenseNumber: e.target.value} : null)} required />
                    
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea id="bio" value={profile?.bio || ''} onChange={e => setProfile(p => p ? {...p, bio: e.target.value} : null)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                    </div>
                    
                    <Input id="experience" label="Years of Experience" type="number" value={profile?.yearsOfExperience || ''} onChange={e => setProfile(p => p ? {...p, yearsOfExperience: parseInt(e.target.value)} : null)} required />
                    <Input id="fee" label="Consultation Fee (₹)" type="number" value={profile?.consultationFee || ''} onChange={e => setProfile(p => p ? {...p, consultationFee: parseFloat(e.target.value)} : null)} required />
                    
                    <div className="flex space-x-4">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                    </div>
                    {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
                </form>
            ) : (
                // VIEW MODE
                <div className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
                   {profile ? (
                    <>
                      <p><strong>Speciality:</strong> {specialities.find(s => s.id === profile.specialityId)?.name || 'Not set'}</p>
                      <p><strong>Medical License:</strong> {profile.medicalLicenseNumber || 'Not set'}</p>
                      <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
                      <p><strong>Experience:</strong> {profile.yearsOfExperience !== null ? `${profile.yearsOfExperience} years` : 'Not set'}</p>
                      <p><strong>Consultation Fee:</strong> {profile.consultationFee !== null ? `₹${profile.consultationFee}` : 'Not set'}</p>
                    </>
                   ) : (
                    <p>Your profile is incomplete. Please click "Edit Profile" to add your details.</p>
                   )}
                </div>
            )}
        </div>
    );
}