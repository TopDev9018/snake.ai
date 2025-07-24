'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { UserRole, ROLE_INFO } from '@/types/roles'
import { PatronFrameworkService, PatronFrameworkData } from '@/lib/patron-framework-service'

interface ClaimInterfaceProps {
    userId: string
    selectedRole: UserRole
    userWallet: string
}

interface ClaimData {
    amount: number
    phase: 'Phase1' | 'Phase2'
    timestamp: string
    claimed: boolean
    patronFrameworkData: PatronFrameworkData | null
}

export const ClaimInterface = ({ userId, selectedRole, userWallet }: ClaimInterfaceProps) => {
    const { connection } = useConnection()
    const wallet = useWallet()
    const [claimData, setClaimData] = useState<ClaimData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isClaiming, setIsClaiming] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [patronFrameworkService, setPatronFrameworkService] = useState<PatronFrameworkService | null>(null)

    useEffect(() => {
        if (connection && wallet && userId) {
            const service = new PatronFrameworkService(connection, wallet, userId)
            setPatronFrameworkService(service)
        }
    }, [connection, wallet, userId])

    useEffect(() => {
        const fetchClaimData = async () => {
            if (!patronFrameworkService) return

            try {
                setIsLoading(true)
                setError(null)

                const patronFrameworkData = await patronFrameworkService.getPatronFrameworkData()

                if (patronFrameworkData.miningStatus) {
                    const amount = await patronFrameworkService.calculateRewardAmount(patronFrameworkData.miningStatus)

                    setClaimData({
                        amount,
                        phase: patronFrameworkData.miningStatus.current_phase,
                        timestamp: new Date().toISOString(),
                        claimed: !!(patronFrameworkData.userClaim?.initialized &&
                            patronFrameworkData.userClaim?.totalMinedPhase1.toNumber() > 0),
                        patronFrameworkData
                    })
                } else {
                    setError('Unable to fetch mining data')
                }
            } catch (err) {
                setError('Failed to fetch claim data')
                console.error('Error fetching claim data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (patronFrameworkService && userId && userWallet) {
            fetchClaimData()
        }
    }, [patronFrameworkService, userId, userWallet])

    const handleInitialize = async () => {
        if (!patronFrameworkService) return

        setIsInitializing(true)
        setError(null)

        try {
            const result = await patronFrameworkService.initializeUserClaim()

            if (result.success) {
                // Sync wallet address with backend
                if (wallet.publicKey) {
                    await patronFrameworkService.syncWalletAddress(wallet.publicKey.toString())
                }

                // Refresh claim data
                const patronFrameworkData = await patronFrameworkService.getPatronFrameworkData()
                if (patronFrameworkData.miningStatus) {
                    const amount = await patronFrameworkService.calculateRewardAmount(patronFrameworkData.miningStatus)

                    setClaimData({
                        amount,
                        phase: patronFrameworkData.miningStatus.current_phase,
                        timestamp: new Date().toISOString(),
                        claimed: false,
                        patronFrameworkData
                    })
                }
            } else {
                setError(result.error || 'Failed to initialize claim')
            }
        } catch (err) {
            setError('Failed to initialize claim')
            console.error('Error initializing claim:', err)
        } finally {
            setIsInitializing(false)
        }
    }

    const handleClaim = async () => {
        if (!claimData || claimData.claimed || !patronFrameworkService) return

        setIsClaiming(true)
        setError(null)

        try {
            // 1. Initialize user claim if not exists
            if (!claimData.patronFrameworkData?.userClaim?.initialized) {
                await handleInitialize()
            }

            // 2. Set role if different from current
            if (claimData.patronFrameworkData?.userClaim?.role !== selectedRole) {
                const roleResult = await patronFrameworkService.selectRoleWithSync(selectedRole)
                if (!roleResult.success) {
                    setError(roleResult.error || 'Failed to select role')
                    return
                }
            }

            // 3. Claim tokens
            const claimResult = await patronFrameworkService.claimTokensWithRole(claimData.amount, selectedRole)

            if (claimResult.success) {
                setClaimData(prev => prev ? { ...prev, claimed: true } : null)
            } else {
                setError(claimResult.error || 'Failed to claim tokens')
            }
        } catch (err) {
            setError('Failed to claim tokens')
            console.error('Error claiming tokens:', err)
        } finally {
            setIsClaiming(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (!claimData) {
        return (
            <div className="text-center py-8 text-gray-500">
                No claim data available
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Claim Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Claim Summary
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                        <span className="font-medium">{claimData.amount} SNAKE</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Current Phase:</span>
                        <span className={`px-2 py-1 rounded text-xs ${claimData.phase === 'Phase1' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {claimData.phase}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Selected Role:</span>
                        <span className={`px-2 py-1 rounded text-xs ${ROLE_INFO[selectedRole].color}`}>
                            {ROLE_INFO[selectedRole].name}
                        </span>
                    </div>
                    {claimData.patronFrameworkData?.miningStatus && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Phase 1 Mining:</span>
                                <span className="font-medium">{claimData.patronFrameworkData.miningStatus.phase1_mining_count} tweets</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Phase 2 Mining:</span>
                                <span className="font-medium">{claimData.patronFrameworkData.miningStatus.phase2_mining_count} tweets</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Total Mining:</span>
                                <span className="font-medium">{claimData.patronFrameworkData.miningStatus.total_mining_count} tweets</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Role Benefits */}
            {selectedRole !== 'none' && (
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Role Benefits
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {ROLE_INFO[selectedRole].benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                        ))}
                    </ul>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Lock Period: {ROLE_INFO[selectedRole].lockPeriod}
                    </div>
                </div>
            )}

            {/* Initialize Button (if not initialized) */}
            {!claimData.patronFrameworkData?.userClaim?.initialized && (
                <button
                    onClick={handleInitialize}
                    disabled={isInitializing}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed mb-4"
                >
                    {isInitializing ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Initializing...
                        </div>
                    ) : (
                        'Initialize Claim Account'
                    )}
                </button>
            )}

            {/* Claim Button */}
            <button
                onClick={handleClaim}
                disabled={isClaiming || claimData.claimed || !claimData.patronFrameworkData?.userClaim?.initialized}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${claimData.claimed
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : isClaiming || !claimData.patronFrameworkData?.userClaim?.initialized
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
            >
                {isClaiming ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Claiming...
                    </div>
                ) : claimData.claimed ? (
                    'Claimed Successfully!'
                ) : !claimData.patronFrameworkData?.userClaim?.initialized ? (
                    'Initialize Account First'
                ) : (
                    `Claim ${claimData.amount} SNAKE Tokens`
                )}
            </button>

            {/* Important Notes */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Role changes will affect your token lock period</li>
                    <li>• Staker and Patron roles require token commitment</li>
                    <li>• Patron status requires application and approval</li>
                    <li>• Locked tokens earn additional rewards</li>
                </ul>
            </div>
        </div>
    )
}
