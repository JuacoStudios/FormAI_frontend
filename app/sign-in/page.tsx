'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-8">Sign In to FormAI</h1>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => router.back()}
          className="mt-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
