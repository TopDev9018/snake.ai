'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const ConnectWalletButton = () => {
  const { connected, publicKey } = useWallet()

  if (connected && publicKey) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Connected: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
        </p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Connect your wallet to get started
      </p>
      <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
    </div>
  )
}
