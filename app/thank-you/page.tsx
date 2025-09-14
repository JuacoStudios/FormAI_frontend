'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ThankYouPage() {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Check subscription status
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (data.isPremium) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-white" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-gray-300 mb-8">
          Your subscription is being processed. This may take a few moments.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="animate-spin mr-2" size={20} />
                Checking...
              </>
            ) : (
              'Check Status'
            )}
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-400 hover:text-white transition-colors"
          >
            Return to Home
          </button>
        </div>

        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Retry attempts: {retryCount}
          </p>
        )}
      </div>
    </div>
  );
}
