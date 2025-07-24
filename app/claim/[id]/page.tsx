'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ClaimInterface } from '@/components/ClaimInterface'
import { RoleSelector } from '@/components/RoleSelector'
import { UserRole } from '@/types/roles'

export default function ClaimPage() {
  const { id } = useParams()
  const { publicKey, connected } = useWallet()
  const [currentRole, setCurrentRole] = useState<UserRole>('none')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) {
      // TODO: Fetch user's current role from the smart contract
      // For now, we'll default to 'none'
      setCurrentRole('none')
      setIsLoading(false)
    }
  }, [connected, publicKey])

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Please connect your wallet to claim your Snake AI tokens
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Claim Your Snake AI Tokens
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Your Role
              </h2>
              <RoleSelector
                currentRole={currentRole}
                onRoleChange={setCurrentRole}
                userWallet={publicKey?.toBase58() || ''}
              />
            </div>
            
            {/* Claim Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Claim Tokens
              </h2>
              <ClaimInterface
                userId={id as string}
                selectedRole={currentRole}
                userWallet={publicKey?.toBase58() || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
