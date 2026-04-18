/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CreditCard, 
  Cpu, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  BarChart3,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { cn } from '../lib/utils'; // I'll check if this exists, otherwise I'll define it or use clsx

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UserUsage {
  userId: string;
  model: string;
  tokens: number;
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'deactivated';
  joinedAt: string;
}

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalTokensUsed: number;
  monthlyRevenue: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'basic' | 'pro' | 'enterprise'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'usage'>('users');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Actual API calls to FastAPI backend
      // const [usersRes, usageRes, statsRes] = await Promise.all([
      //   axios.get(`${API_BASE_URL}/api/admin/users`),
      //   axios.get(`${API_BASE_URL}/api/admin/usage`),
      //   axios.get(`${API_BASE_URL}/api/admin/stats`)
      // ]);
      // setUsers(usersRes.data);
      // setUsageData(usageRes.data);
      // setStats(statsRes.data);

      // Mocking data for initial view while backend is being pointed
      const mockUsers: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'pro', status: 'active', joinedAt: '2026-04-10' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', plan: 'basic', status: 'active', joinedAt: '2026-04-12' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', plan: 'enterprise', status: 'active', joinedAt: '2026-04-15' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', plan: 'free', status: 'deactivated', joinedAt: '2026-04-16' },
      ];

      const mockUsage = [
        { name: 'Apr 10', tokens: 1200, users: 45 },
        { name: 'Apr 11', tokens: 1900, users: 52 },
        { name: 'Apr 12', tokens: 1500, users: 48 },
        { name: 'Apr 13', tokens: 2200, users: 61 },
        { name: 'Apr 14', tokens: 3100, users: 75 },
        { name: 'Apr 15', tokens: 2800, users: 70 },
        { name: 'Apr 16', tokens: 3500, users: 82 },
      ];

      setUsers(mockUsers);
      setUsageData(mockUsage);
      setStats({
        totalUsers: 1250,
        activeSubscribers: 450,
        totalTokensUsed: 1520000,
        monthlyRevenue: '$4,250'
      });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      // await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'deactivated' } : u));
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      // await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/activate`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar / Top Nav */}
      <nav className="bg-white border-b border-zinc-200 px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
            <ArrowLeft size={18} />
          </a>
          <h1 className="text-xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-100">
            Production
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-zinc-100 rounded-xl transition-all">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers.toLocaleString() || '0'} 
            icon={<Users className="text-blue-500" size={20} />}
            change="+12% from last month"
          />
          <StatCard 
            title="Active Subs" 
            value={stats?.activeSubscribers.toLocaleString() || '0'} 
            icon={<CreditCard className="text-emerald-500" size={20} />}
            change="+5% from last month"
          />
          <StatCard 
            title="Tokens Used" 
            value={(stats?.totalTokensUsed ? (stats.totalTokensUsed / 1000000).toFixed(1) : '0') + 'M'} 
            icon={<Cpu className="text-purple-500" size={20} />}
            change="+22% this week"
          />
          <StatCard 
            title="Monthly Revenue" 
            value={stats?.monthlyRevenue || '$0'} 
            icon={<BarChart3 className="text-amber-500" size={20} />}
            change="+18% growth"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold">AI Usage & Growth</h2>
              <p className="text-sm text-zinc-500">Token consumption and active users over the last 7 days</p>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('usage')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'usage' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                Usage
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'users' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                Users List
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#4F46E5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4F46E5' }} 
                  activeDot={{ r: 6 }} 
                  name="Tokens (k)"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981' }} 
                  activeDot={{ r: 6 }} 
                  name="Daily Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter size={16} className="text-zinc-400 shrink-0" />
              {(['all', 'free', 'basic', 'pro', 'enterprise'] as const).map(plan => (
                <button
                  key={plan}
                  onClick={() => setPlanFilter(plan)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                    planFilter === plan 
                      ? "bg-zinc-900 text-white border-zinc-900" 
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{user.name}</span>
                          <span className="text-xs text-zinc-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        user.plan === 'enterprise' ? "bg-purple-100 text-purple-700" :
                        user.plan === 'pro' ? "bg-indigo-100 text-indigo-700" :
                        user.plan === 'basic' ? "bg-blue-100 text-blue-700" :
                        "bg-zinc-100 text-zinc-700"
                      )}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          user.status === 'active' ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          user.status === 'active' ? "text-emerald-700" : "text-red-700"
                        )}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => deactivateUser(user.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Deactivate User"
                          >
                            <ShieldAlert size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => activateUser(user.id)}
                            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Activate User"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                      No users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          {change}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">{title}</span>
        <span className="text-3xl font-black text-zinc-900 antialiased">{value}</span>
      </div>
    </div>
  );
}
