/// <reference types="vite/client" />
import React, { useState } from 'react';
import { 
  FileAudio, 
  Download, 
  Clock, 
  Zap, 
  CreditCard, 
  Plus,
  Play,
  MoreVertical,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HistoryItem {
  id: string;
  name: string;
  date: string;
  audioUrl: string;
  srtUrl: string;
  tokens: number;
}

export default function UserDashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([
    { 
      id: '1', 
      name: 'Podcast Episode 12.mp3', 
      date: '2026-04-15', 
      audioUrl: '#', 
      srtUrl: '#', 
      tokens: 450 
    },
    { 
      id: '2', 
      name: 'Tutorial Voiceover.wav', 
      date: '2026-04-12', 
      audioUrl: '#', 
      srtUrl: '#', 
      tokens: 120 
    },
    { 
      id: '3', 
      name: 'Marketing Ad Script.mp3', 
      date: '2026-04-10', 
      audioUrl: '#', 
      srtUrl: '#', 
      tokens: 85 
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">User Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage your captions, usage, and subscription.</p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 w-fit"
        >
          <Plus size={18} />
          Create New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Plan</h3>
          <p className="text-2xl font-black text-zinc-900 tracking-tight">Pro Studio Monthly</p>
          <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium tracking-tight">Renews on May 15, 2026</span>
            <Link to="#" className="text-indigo-600 font-bold hover:underline">Manage</Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
            <TableIcon size={24} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tokens Used</h3>
          <p className="text-2xl font-black text-zinc-900 tracking-tight">12,450 / 50,000</p>
          <div className="mt-4 w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[25%] rounded-full shadow-sm" />
          </div>
          <p className="mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">24.9% of total allowance</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50"
        >
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <CreditCard size={24} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Savings</h3>
          <p className="text-2xl font-black text-zinc-900 tracking-tight">$245.00</p>
          <p className="mt-4 text-xs text-zinc-400 font-medium tracking-tight leading-relaxed">
            By using AI-assisted captioning instead of manual transcribers.
          </p>
        </motion.div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="text-zinc-400" size={20} />
            <h2 className="text-lg font-black tracking-tight text-zinc-900">Project History</h2>
          </div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {history.length} Projects
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-50">
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">File Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tokens</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assets</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {history.map((item) => (
                <tr key={item.id} className="group hover:bg-zinc-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileAudio size={16} />
                      </div>
                      <span className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-zinc-500 italic font-serif">
                    {item.date}
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                      {item.tokens}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-zinc-100 shadow-sm" title="Download Audio">
                        <Play size={14} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-zinc-100 shadow-sm" title="Download SRT">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-zinc-300 hover:text-red-500 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {history.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No projects yet</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
              When you create and export captions, they will appear here for you to download later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
