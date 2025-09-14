'use client';

import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-400">/month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check size={20} className="text-green-500 mr-3" />
                <span>1 scan per session</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-green-500 mr-3" />
                <span>Basic equipment analysis</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-green-500 mr-3" />
                <span>Scan history</span>
              </li>
            </ul>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 border-2 border-green-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-black">Premium</h3>
            <div className="text-4xl font-bold mb-6 text-black">
              $9.99<span className="text-lg text-gray-800">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check size={20} className="text-black mr-3" />
                <span className="text-black">Unlimited scans</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-black mr-3" />
                <span className="text-black">Advanced AI analysis</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-black mr-3" />
                <span className="text-black">Detailed workout plans</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-black mr-3" />
                <span className="text-black">Priority support</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="text-black mr-3" />
                <span className="text-black">Export results</span>
              </li>
            </ul>
            <button 
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Go Premium'}
            </button>
          </div>
        </div>

        {/* Annual Plan */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">Annual Plan</h3>
          <div className="text-4xl font-bold mb-6">
            $99.99<span className="text-lg text-gray-400">/year</span>
            <span className="text-lg text-green-500 ml-2">(Save 17%)</span>
          </div>
          <p className="text-gray-400 mb-8">All Premium features with 2 months free!</p>
          <button 
            onClick={() => handleSubscribe('annual')}
            disabled={loading}
            className="w-full py-3 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Choose Annual Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
