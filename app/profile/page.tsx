'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, Target, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TabKey = 'settings' | 'goals' | 'progress';

export default function ProfilePage() {
  const router = useRouter();
  const [active, setActive] = useState<TabKey>('settings');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5 pt-16">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      
      <p className="text-gray-400 mb-6">Your gym journey starts here</p>

      {/* Tabs */}
      <div className="flex bg-gray-800 rounded-xl p-1.5 gap-1.5 mb-4">
        <button
          onClick={() => setActive('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold ${
            active === 'settings' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
        <button
          onClick={() => setActive('goals')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold ${
            active === 'goals' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          <Target size={18} />
          Goals
        </button>
        <button
          onClick={() => setActive('progress')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold ${
            active === 'progress' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          <BarChart3 size={18} />
          Progress
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {active === 'settings' && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <div className="h-px bg-gray-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        )}

        {active === 'goals' && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-green-500 text-center mb-4">Monthly Progress</h3>
            <div className="h-4 bg-gray-700 rounded-full">
              <div className="h-4 bg-green-500 rounded-full w-3/5"></div>
            </div>
            <p className="text-center text-white font-semibold">12/20 workouts completed</p>
            
            <div>
              <label className="block text-white font-semibold mb-2">Your goal</label>
              <textarea
                placeholder="Describe your fitness goal"
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                rows={3}
                defaultValue="Build consistency: 20 workouts this month"
              />
              <p className="text-gray-400 text-sm mt-2">Tip: Keep it measurable and time-bound.</p>
            </div>
          </div>
        )}

        {active === 'progress' && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-green-500 text-center mb-4">Monthly Progress</h3>
            <div className="h-4 bg-gray-700 rounded-full">
              <div className="h-4 bg-green-500 rounded-full w-1/2"></div>
            </div>
            <p className="text-center text-white font-semibold">10/20 workouts completed</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gray-700 py-3 px-4 rounded-xl border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors">
                -1
              </button>
              <button className="bg-gray-700 py-3 px-4 rounded-xl border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors">
                +1
              </button>
              <button className="bg-gray-700 py-3 px-4 rounded-xl border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors">
                Target -1
              </button>
              <button className="bg-gray-700 py-3 px-4 rounded-xl border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors">
                Target +1
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
