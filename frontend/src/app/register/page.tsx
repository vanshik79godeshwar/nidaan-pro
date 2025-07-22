'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

// This is the component for the final registration step
function RegistrationForm({ email }: { email: string }) {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        userDetails: { fullName, email, password, role },
        otp,
      };
      await api.post('/auth/register/verify', payload);
      // On success, redirect to the login page with a success message
      router.push('/login?registered=true');
    } catch (err) {
      setError('Registration failed. Please check your details and OTP.');
      console.error(err);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <p className="text-center text-sm text-gray-600">
        An OTP has been sent to <strong>{email}</strong>. Please enter it below to complete your registration.
      </p>
      <div className="rounded-md shadow-sm flex flex-col gap-4">
        <Input id="fullName" label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input id="password" label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register as a</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'PATIENT' | 'DOCTOR')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
          </select>
        </div>
        <Input id="otp" label="6-Digit OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Button type="submit">Create Account</Button>
      </div>
    </form>
  );
}

// This is the main page component
export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register/request-otp', { email });
      setOtpSent(true); // Move to the next step
    } catch (err) {
      setError('Failed to send OTP. The email might already be registered.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {!otpSent ? (
          // Step 1: Request OTP Form
          <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
            <Input id="email" label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <Button type="submit">Send OTP</Button>
            </div>
          </form>
        ) : (
          // Step 2: Full Registration Form
          <RegistrationForm email={email} />
        )}
      </div>
    </div>
  );
}