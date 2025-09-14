import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './tailwind.css'
import Providers from '@/components/Providers'
import HeaderAuth from '@/components/HeaderAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FormAI - Gym Equipment Scanner',
  description: 'AI-powered gym equipment analysis and guidance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">FormAI</h1>
                <HeaderAuth />
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}