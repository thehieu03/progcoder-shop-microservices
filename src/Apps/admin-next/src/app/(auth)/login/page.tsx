'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/core/store';
import { loginSuccess } from '@/features/auth/authSlice';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    // Validate admin/admin
    if (username !== 'admin' || password !== 'admin') {
      setError('Invalid credentials. Use admin/admin');
      return;
    }
    
    // Set cookie cho middleware
    document.cookie = 'auth_status=authenticated; path=/; max-age=86400';
    
    // Dispatch Redux action
    dispatch(loginSuccess());
    
    // Redirect
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              name="username"
              type="text" 
              defaultValue="admin"
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              name="password"
              type="password" 
              defaultValue="admin"
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
