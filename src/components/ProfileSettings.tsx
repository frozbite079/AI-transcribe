/// <reference types="vite/client" />
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Settings, 
  Camera, 
  CheckCircle2, 
  ShieldCheck,
  Globe,
  Loader2,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '+91 98765 43210',
    company: 'Pro Captions Studio',
    language: 'English (US)'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Profile Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your personal information and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Sidebar-like Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-indigo-600 font-black text-3xl overflow-hidden">
                JD
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={20} />
              </div>
            </div>
            <h3 className="font-black text-lg text-zinc-900 leading-none mb-1">{formData.name}</h3>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{formData.company}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-zinc-50 space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <ShieldCheck className="text-emerald-500" size={16} />
                <span className="text-zinc-500 font-medium">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <Settings className="animate-spin-slow" size={16} />
                <span>Last updated 2 days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-[2.5rem] shadow-xl text-white">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Security Tip</h4>
            <p className="text-xs leading-relaxed text-zinc-300 font-medium italic">
              "Enable two-factor authentication to add an extra layer of security to your account."
            </p>
            <button className="mt-4 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
              Enable 2FA →
            </button>
          </div>
        </div>

        {/* Right: The Form */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="language" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                    Default Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option>English (US)</option>
                      <option>Spanish (ES)</option>
                      <option>French (FR)</option>
                      <option>German (DE)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-50 flex items-center justify-between gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest"
                >
                  <Lock size={14} />
                  Change Password
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 min-w-[160px] justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : success ? (
                    <>
                      <CheckCircle2 size={20} />
                      Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
