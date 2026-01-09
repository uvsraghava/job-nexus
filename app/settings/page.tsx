"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock, User, Loader2, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Safe check for window/localStorage
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('name');
      const storedRole = localStorage.getItem('role');
      if(storedName) setName(storedName);
      if(storedRole) setRole(storedRole);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('https://job-nexus-f3ub.onrender.com/api/auth/update-profile', 
        { name, password },
        { headers: { 'x-auth-token': token } }
      );

      localStorage.setItem('name', res.data.name);
      alert("Profile Updated Successfully!");
      setPassword(''); 
    } catch (err: any) {
      console.error(err);
      alert("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if(role === 'student') router.push('/dashboard/student');
    else if(role === 'recruiter') router.push('/dashboard/recruiter');
    else if(role === 'faculty') router.push('/dashboard/faculty');
    else router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        <button onClick={goBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 md:mb-8 transition text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Update your profile details.</p>

        <form onSubmit={handleUpdate} className="space-y-4 md:space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition text-base" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition text-base" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}