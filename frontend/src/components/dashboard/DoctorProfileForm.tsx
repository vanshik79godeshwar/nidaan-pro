'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import Image from 'next/image';
import { toast } from 'sonner';
import { Briefcase, Building, Edit, ShieldCheck, Siren } from 'lucide-react';

// --- TYPE DEFINITIONS ---
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
    availableForEmergency: boolean;
}

// --- A ROBUST INITIAL STATE TO PREVENT VALIDATION ERRORS ---
const defaultProfileState: Partial<DoctorProfile> = {
    specialityId: undefined,
    medicalLicenseNumber: '',
    bio: '',
    yearsOfExperience: 0,
    consultationFee: 0,
    profilePictureUrl: '',
    availableForEmergency: false,
};

// --- A STYLED TOGGLE SWITCH COMPONENT ---
const ToggleSwitch = ({ label, description, checked, onChange, name }: { label: string, description: string, checked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, name: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-gray-800">{label}</span>
            <div className="relative">
                <input type="checkbox" name={name} className="sr-only" checked={checked} onChange={onChange} />
                <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${checked ? 'translate-x-6' : ''}`}></div>
            </div>
        </label>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

// --- A HELPER FOR DISPLAYING PROFILE INFO ---
const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start py-3">
        <Icon className="w-5 h-5 text-gray-400 mr-4 mt-1" />
        <div className="flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);


export default function DoctorProfileForm() {
    const { user, token, login } = useAuth();
    const [profile, setProfile] = useState<Partial<DoctorProfile>>(defaultProfileState);
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- THIS IS THE FIX ---
    // Decouple the API calls to prevent a failing profile fetch from blocking the specialities fetch.
    useEffect(() => {
        // Fetch specialities first, as they are always needed for the form.
        const fetchSpecialities = async () => {
            if (!token) return;
            try {
                const res = await api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } });
                setSpecialities(res.data);
            } catch (error) {
                console.error('Failed to fetch specialities', error);
                toast.error('Could not load medical specialities.');
            }
        };
        fetchSpecialities();
    }, [token]);

    useEffect(() => {
        // Then, fetch the user's specific profile.
        const fetchProfile = async () => {
            if (!user || !token) return;
            setIsLoading(true);
            try {
                const res = await api.get(`/profiles/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data && res.data.doctorProfile) {
                    setProfile(res.data.doctorProfile);
                } else {
                    setIsEditing(true);
                }
            } catch (error: any) {
                 if (error.response?.status === 404) {
                    setIsEditing(true); // Expected for new users, go to edit mode.
                 } else {
                    console.error('Failed to fetch doctor profile', error);
                    toast.error('Could not load your profile.');
                 }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user, token]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user || !token || !profile) return;

        if (!profile.specialityId) {
            toast.error("Please select a medical speciality.");
            return;
        }

        const promise = () => new Promise(async (resolve, reject) => {
            try {
                const payload = { 
                    ...profile,
                    userId: user.id,
                    yearsOfExperience: Number(profile.yearsOfExperience) || 0,
                    consultationFee: Number(profile.consultationFee) || 0,
                    specialityId: Number(profile.specialityId),
                };
                await api.post('/profiles/doctor', payload, { headers: { Authorization: `Bearer ${token}` } });
                if(token) await login(token); // Refresh auth context
                setIsEditing(false);
                resolve("Your profile has been updated successfully!");
            } catch (error) {
                console.error('Failed to save profile', error);
                reject("Failed to update profile. Please ensure all required fields are filled.");
            }
        });
        
        toast.promise(promise(), {
            loading: 'Saving your profile...',
            success: (message) => `${message}`,
            error: (message) => `${message}`,
        });
    };
    
    if (isLoading) return <p>Loading profile...</p>;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
    };

    const handleToggleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setProfile(p => ({ ...p, [name]: checked }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Professional Profile</h1>
                {!isEditing && profile.medicalLicenseNumber && (
                    <Button onClick={() => setIsEditing(true)} className="w-auto flex items-center gap-2">
                        <Edit size={16} /> Edit Profile
                    </Button>
                )}
            </div>

            {isEditing ? (
                // --- EDITING VIEW ---
                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <ImageUploader onUploadSuccess={(url) => setProfile(p => ({ ...p, profilePictureUrl: url }))} />
                             <div>
                              <label htmlFor="specialityId" className="block text-sm font-medium text-gray-700">Speciality</label>
                              <select id="specialityId" name="specialityId" value={profile.specialityId || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                                <option value="" disabled>Select a speciality...</option>
                                {specialities.map(spec => (<option key={spec.id} value={spec.id}>{spec.name}</option>))}
                              </select>
                            </div>
                            <Input id="medicalLicenseNumber" name="medicalLicenseNumber" label="Medical License Number" value={profile.medicalLicenseNumber || ''} onChange={handleInputChange} required />
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio / Professional Statement</label>
                                <textarea id="bio" name="bio" value={profile.bio || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input id="yearsOfExperience" name="yearsOfExperience" label="Years of Experience" type="number" value={profile.yearsOfExperience || ''} onChange={handleInputChange} required />
                                <Input id="consultationFee" name="consultationFee" label="Consultation Fee (₹)" type="number" value={profile.consultationFee || ''} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                         <h3 className="text-xl font-semibold mb-4">Settings</h3>
                        <ToggleSwitch
                            label="Emergency Availability"
                            description="Enable this if you are willing to accept immediate, unscheduled emergency consultations."
                            name="availableForEmergency"
                            checked={!!profile.availableForEmergency}
                            onChange={handleToggleChange}
                        />
                    </div>

                    <div className="flex space-x-4">
                        <Button type="submit">Save Changes</Button>
                        {profile.medicalLicenseNumber && (
                             <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                        )}
                    </div>
                </form>
            ) : (
                // --- READ-ONLY VIEW ---
                <div className="max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                         <Image src={profile.profilePictureUrl || '/default-avatar.png'} alt="Profile" width={150} height={150} className="rounded-full mx-auto border-4 border-white shadow-lg" />
                         <h2 className="text-2xl font-bold mt-4">{user?.fullName}</h2>
                         <p className="text-blue-600 font-semibold">{specialities.find(s => s.id === profile.specialityId)?.name}</p>
                    </div>
                    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Details</h3>
                        <div className="divide-y">
                            <InfoRow icon={Briefcase} label="Experience" value={`${profile.yearsOfExperience} years`} />
                            <InfoRow icon={ShieldCheck} label="License Number" value={profile.medicalLicenseNumber} />
                            <InfoRow icon={Siren} label="Emergency Availability" value={profile.availableForEmergency ? 'Yes' : 'No'} />
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm text-gray-500">Bio</h4>
                            <p className="text-gray-700 mt-1">{profile.bio || 'No bio provided.'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
