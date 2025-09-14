'use client';

import { useState } from 'react';
import { X, Star, CreditCard, Check } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Unlock Unlimited Scans</h3>
            <p className="text-gray-400">
              Get unlimited gym equipment analysis and expert guidance
            </p>
          </div>

          {/* Pricing Options */}
          <div className="space-y-4 mb-6">
            {/* Monthly Plan */}
            <div className="border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Monthly Plan</h4>
                  <p className="text-gray-400 text-sm">Unlimited scans</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$9.99</div>
                  <div className="text-gray-400 text-sm">/month</div>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
                className="w-full mt-3 bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Choose Monthly'}
              </button>
            </div>

            {/* Annual Plan */}
            <div className="border border-yellow-500 rounded-lg p-4 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  Best Value
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Annual Plan</h4>
                  <p className="text-gray-400 text-sm">Unlimited scans</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$99.99</div>
                  <div className="text-gray-400 text-sm">/year</div>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe('annual')}
                disabled={loading}
                className="w-full mt-3 bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Choose Annual'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center">
              <Check size={16} className="text-green-500 mr-2" />
              Unlimited equipment scans
            </div>
            <div className="flex items-center">
              <Check size={16} className="text-green-500 mr-2" />
              Expert form guidance
            </div>
            <div className="flex items-center">
              <Check size={16} className="text-green-500 mr-2" />
              Detailed usage instructions
            </div>
            <div className="flex items-center">
              <Check size={16} className="text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
