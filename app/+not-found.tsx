import Link from 'next/link';

export default function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-xl mb-8">This page doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
        >
          Go to home screen
        </Link>
      </div>
    </div>
  );
}
