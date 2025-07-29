// frontend/src/components/dashboard/DoctorProfileForm.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import Image from 'next/image';

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
    profilePictureUrl?: string;
}

export default function DoctorProfileForm() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState<Partial<DoctorProfile>>({});
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !token) return;
            setIsLoading(true);
            try {
                const [profileRes, specialitiesRes] = await Promise.all([
                    api.get(`/profiles/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (profileRes.data && profileRes.data.doctorProfile) {
                    setProfile(profileRes.data.doctorProfile);
                }
                setSpecialities(specialitiesRes.data);

            } catch (error: any) {
                if (error.response?.status === 404) {
                    setIsEditing(true);
                } else {
                    console.error('Failed to fetch doctor profile', error);
                }
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
            const payload = { userId: user.id, ...profile };
            await api.post('/profiles/doctor', payload, {
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
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Doctor Profile</h1>
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
                    
                    <div>
                      <label htmlFor="specialityId" className="block text-sm font-medium text-gray-700">Speciality</label>
                      <select id="specialityId" name="specialityId" value={profile.specialityId || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">Select a speciality</option>
                        {specialities.map(spec => (<option key={spec.id} value={spec.id}>{spec.name}</option>))}
                      </select>
                    </div>
                    <Input id="medicalLicenseNumber" name="medicalLicenseNumber" label="Medical License Number" value={profile.medicalLicenseNumber || ''} onChange={handleInputChange} required />
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea id="bio" name="bio" value={profile.bio || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <Input id="yearsOfExperience" name="yearsOfExperience" label="Years of Experience" type="number" value={profile.yearsOfExperience || ''} onChange={handleInputChange} required />
                    <Input id="consultationFee" name="consultationFee" label="Consultation Fee (₹)" type="number" value={profile.consultationFee || ''} onChange={handleInputChange} required />
                    <div className="flex space-x-4">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                    </div>
                    {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
                </form>
            ) : (
                <div className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
                   {profile.profilePictureUrl && (<div className="text-center"><Image src={profile.profilePictureUrl} alt="Profile" width={128} height={128} className="rounded-full mx-auto mb-4" /></div>)}
                   {profile.medicalLicenseNumber ? (
                    <>
                      <p><strong>Speciality:</strong> {specialities.find(s => s.id === profile.specialityId)?.name || 'Not set'}</p>
                      <p><strong>License:</strong> {profile.medicalLicenseNumber}</p>
                      <p><strong>Bio:</strong> {profile.bio}</p>
                      <p><strong>Experience:</strong> {profile.yearsOfExperience} years</p>
                      <p><strong>Fee:</strong> ₹{profile.consultationFee}</p>
                    </>
                   ) : (
                    <p>Your profile is incomplete. Please click "Edit Profile" to add details.</p>
                   )}
                </div>
            )}
        </div>
    );
}