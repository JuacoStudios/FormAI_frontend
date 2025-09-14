'use client';

import { useState, useRef } from 'react';
import { Camera, RotateCcw, Settings, User, History } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canScan = isPremium || scanCount < 1;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!canScan) {
      alert('You have reached your scan limit. Please upgrade to Premium for unlimited scans.');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64.split(',')[1] }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.explanation);
        setScanCount(prev => prev + 1);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-green-500">FormAI</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/history')}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <History size={24} />
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Status Badge */}
        <div className="mb-8">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isPremium 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-700 text-white'
          }`}>
            {isPremium ? 'Premium' : `Free (${scanCount}/1 scans)`}
          </span>
        </div>

        {/* Scan Area */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            SCAN YOUR<br />
            <span className="text-green-500">GYM MACHINE</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Position the machine within the frame<br />
            Ensure good lighting for best results
          </p>
        </div>

        {/* Camera/Upload Area */}
        <div className="relative w-80 h-80 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mb-8">
          <div className="text-center">
            <Camera size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">Click to select image</p>
            <button
              onClick={triggerFileSelect}
              disabled={!canScan || analyzing}
              className={`px-6 py-3 rounded-full font-semibold ${
                canScan && !analyzing
                  ? 'bg-green-500 text-black hover:bg-green-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {analyzing ? 'Analyzing...' : 'Select Image'}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Result */}
        {result && (
          <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-green-500">Analysis Result</h3>
            <p className="text-gray-300 leading-relaxed">{result}</p>
            <button
              onClick={() => setResult(null)}
              className="mt-4 text-green-500 hover:text-green-400"
            >
              Close
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600"
          >
            Go Premium
          </button>
          
          {!canScan && (
            <button
              onClick={() => {
                setScanCount(0);
                setIsPremium(false);
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600"
            >
              Reset Scans
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500">
        <p>© 2024 FormAI. AI-powered gym equipment analysis.</p>
      </footer>
    </div>
  );
}
