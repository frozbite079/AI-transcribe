/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Github,
  Chrome,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { authService } from '../services/auth';

type AuthMode = 'login' | 'signup';

export default function AuthPage({ mode: initialMode = 'login' }: { mode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     setError(null);

     try {
       if (mode === 'login') {
         await authService.login({ email: formData.email, password: formData.password });
       } else {
         await authService.register({
           name: formData.name,
           email: formData.email,
           mobile: formData.mobile,
           password: formData.password
         });
       }
       setSuccess(true);
       setTimeout(() => {
         navigate('/');
       }, 1000);
     } catch (err: any) {
       setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
     } finally {
       setLoading(false);
     }
   };

  const handleGoogleLogin = async () => {
    // Google OAuth not implemented in backend yet
    setError('Google login is not available yet.');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 italic font-black text-xl">
            P
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-zinc-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="font-bold text-indigo-600 hover:text-indigo-500">
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-bold text-indigo-600 hover:text-indigo-500">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-zinc-200 shadow-xl rounded-[2.5rem] sm:px-10">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={64} className="text-emerald-500" />
              <p className="text-lg font-bold text-zinc-900">Successfully Authorized!</p>
              <p className="text-sm text-zinc-500">Redirecting you to the workspace...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all bg-zinc-50/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all bg-zinc-50/50"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="mobile" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all bg-zinc-50/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all bg-zinc-50/50"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-100"></div>
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                  <span className="px-3 bg-white text-zinc-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border border-zinc-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95 group"
                >
                  <Chrome className="text-zinc-400 group-hover:text-amber-500 transition-colors" size={20} />
                  <span>Google Account</span>
                </button>
              </div>
              
              <p className="mt-8 text-[10px] text-center text-zinc-400 leading-relaxed">
                By clicking "Continue", you agree to our{' '}
                <a href="#" className="underline hover:text-zinc-600">Terms of Service</a> and{' '}
                <a href="#" className="underline hover:text-zinc-600">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
