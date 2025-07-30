'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// Define the shape of the profile object, which can be either a patient or doctor profile
interface UserProfile {
  profilePictureUrl?: string;
  // Add other common profile fields if needed in the future
}

// Update AuthUser to include the optional profile
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  profile?: UserProfile; // The user's profile from user-profile-service
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      login(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    setIsLoading(true);
    try {
      // 1. Set the token for future API calls
      localStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // 2. Decode the token to get basic user info (like the original implementation)
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const basicUser: AuthUser = {
        id: payload.sub,
        fullName: payload.fullName,
        email: payload.email,
        role: payload.role,
      };

      // --- THIS IS THE FIX ---
      // 3. Fetch the detailed user profile from the user-profile-service
      let userProfile: UserProfile | undefined = undefined;
      try {
        const profileResponse = await api.get(`/profiles/${basicUser.id}`);
        // The profile data might be nested differently for doctors vs patients
        if (profileResponse.data) {
           if (basicUser.role === 'DOCTOR' && profileResponse.data.doctorProfile) {
                userProfile = profileResponse.data.doctorProfile;
           } else {
                userProfile = profileResponse.data; // Assume patient profile is the root object
           }
        }
      } catch (profileError: any) {
        // A 404 here is normal for new users; it just means they haven't created a profile yet.
        if (profileError.response?.status !== 404) {
            console.error("Failed to fetch user profile:", profileError);
        }
      }
      
      // 4. Combine the basic user info with the fetched profile and set the final user state
      setUser({ ...basicUser, profile: userProfile });

    } catch (error) {
      console.error('Login failed:', error);
      logout(); // Clear state if login fails
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}