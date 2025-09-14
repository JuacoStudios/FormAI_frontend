'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

export default function HeaderAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-black" />
          </div>
          <span className="text-sm text-gray-300 hidden sm:block">
            {session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-gray-400 hover:text-white transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/sign-in')}
      className="bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
    >
      Sign In
    </button>
  );
}
