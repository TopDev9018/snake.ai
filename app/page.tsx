import Link from 'next/link'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Snake AI Token Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Claim your tokens and participate in the Patron Framework
          </p>
          
          <div className="max-w-md mx-auto">
            <ConnectWalletButton />
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Phase 1 Mining
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Earn tokens through Twitter engagement and interaction
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Phase 2 Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enhanced rewards for active community members
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Patron Framework
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Become a patron and help shape the future of Snake AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
