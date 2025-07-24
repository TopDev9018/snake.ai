import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';

interface UserStakingData {
  role: 'none' | 'staker' | 'patron';
  patronStatus: 'none' | 'Applied' | 'Approved' | 'Revoked';
  lockedAmount: number;
  lockStartTimestamp: number;
  lockEndTimestamp: number;
  lockDurationMonths: number;
  lastYieldClaimTimestamp: number;
  totalYieldClaimed: number;
  availableYield: number;
  isLocked: boolean;
  canUnlock: boolean;
  phase2Mining: boolean;
  daoEligible: boolean;
  patronQualificationScore: number;
  totalMinedPhase1: number;
}

interface StakingDashboardProps {
  program: Program<any>;
  connection: Connection;
}

const StakingDashboard: React.FC<StakingDashboardProps> = ({ program, connection }) => {
  const { publicKey } = useWallet();
  const [stakingData, setStakingData] = useState<UserStakingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimingYield, setClaimingYield] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchStakingData();
    }
  }, [publicKey]);

  const fetchStakingData = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      
      const [userClaimPda] = await PublicKey.findProgramAddress(
        [Buffer.from('user_claim'), publicKey.toBuffer()],
        program.programId
      );

      const userClaimAccount = await program.account.userClaim.fetch(userClaimPda) as any;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Calculate available yield for stakers
      let availableYield = 0;
      if (userClaimAccount.role && userClaimAccount.role.staker !== undefined && userClaimAccount.lockedAmount > 0) {
        const lastClaim = userClaimAccount.lastYieldClaimTimestamp || userClaimAccount.lockStartTimestamp;
        const timeDiff = currentTime - lastClaim;
        const secondsInYear = 365 * 24 * 60 * 60;
        
        // 5% APY calculation
        availableYield = (userClaimAccount.lockedAmount * 5 * timeDiff) / (100 * secondsInYear);
      }

      // Check Phase 2 mining status (this would need to be fetched from backend)
      const phase2Mining = await checkPhase2Mining(publicKey.toString());

      const stakingData: UserStakingData = {
        role: userClaimAccount.role && userClaimAccount.role.staker !== undefined ? 'staker' : 
              userClaimAccount.role && userClaimAccount.role.patron !== undefined ? 'patron' : 'none',
        patronStatus: userClaimAccount.patronStatus && userClaimAccount.patronStatus.applied !== undefined ? 'Applied' :
                     userClaimAccount.patronStatus && userClaimAccount.patronStatus.approved !== undefined ? 'Approved' :
                     userClaimAccount.patronStatus && userClaimAccount.patronStatus.revoked !== undefined ? 'Revoked' : 'none',
        lockedAmount: userClaimAccount.lockedAmount / 1e9,
        lockStartTimestamp: userClaimAccount.lockStartTimestamp,
        lockEndTimestamp: userClaimAccount.lockEndTimestamp,
        lockDurationMonths: userClaimAccount.lockDurationMonths,
        lastYieldClaimTimestamp: userClaimAccount.lastYieldClaimTimestamp,
        totalYieldClaimed: userClaimAccount.totalYieldClaimed / 1e9,
        availableYield: availableYield / 1e9,
        isLocked: currentTime < userClaimAccount.lockEndTimestamp && userClaimAccount.lockedAmount > 0,
        canUnlock: currentTime >= userClaimAccount.lockEndTimestamp,
        phase2Mining,
        daoEligible: userClaimAccount.daoEligible,
        patronQualificationScore: userClaimAccount.patronQualificationScore,
        totalMinedPhase1: userClaimAccount.totalMinedPhase1 / 1e9,
      };

      setStakingData(stakingData);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPhase2Mining = async (walletAddress: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/phase2-mining/${walletAddress}`);
      const data = await response.json();
      return data.hasMinedInPhase2;
    } catch (error) {
      console.error('Error checking Phase 2 mining:', error);
      return false;
    }
  };

  const claimYield = async () => {
    if (!publicKey || !stakingData) return;
    
    try {
      setClaimingYield(true);
      
      const [userClaimPda] = await PublicKey.findProgramAddress(
        [Buffer.from('user_claim'), publicKey.toBuffer()],
        program.programId
      );

      const [vestingSchedulePda] = await PublicKey.findProgramAddress(
        [Buffer.from('vesting'), publicKey.toBuffer()],
        program.programId
      );

      // This would need to be implemented based on your vesting contract
      // const tx = await program.methods
      //   .claimVestedTokens()
      //   .accounts({
      //     user: publicKey,
      //     userClaim: userClaimPda,
      //     vestingSchedule: vestingSchedulePda,
      //     // ... other accounts
      //   })
      //   .transaction();

      // await sendTransaction(tx, connection);
      
      // For now, just refresh the data
      await fetchStakingData();
    } catch (error) {
      console.error('Error claiming yield:', error);
    } finally {
      setClaimingYield(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRemaining = (endTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTimestamp - now;
    
    if (remaining <= 0) return "Unlocked";
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'staker': return 'bg-blue-100 text-blue-800';
      case 'patron': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Applied': return 'bg-yellow-100 text-yellow-800';
      case 'Revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stakingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Staking Dashboard</h2>
          <p className="text-gray-600">No staking data found. Please connect your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Staking Dashboard</h2>
          <div className="flex space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(stakingData.role)}`}>
              {stakingData.role}
            </span>
            {stakingData.patronStatus !== 'none' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stakingData.patronStatus)}`}>
                {stakingData.patronStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Locked Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stakingData.lockedAmount.toLocaleString()} SNAKE
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Yield</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stakingData.availableYield.toFixed(4)} SNAKE
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Time Remaining</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getTimeRemaining(stakingData.lockEndTimestamp)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Claimed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stakingData.totalYieldClaimed.toFixed(4)} SNAKE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Details */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Staking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Lock Duration</dt>
                <dd className="text-sm text-gray-900">{stakingData.lockDurationMonths} months</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Lock Started</dt>
                <dd className="text-sm text-gray-900">{formatTime(stakingData.lockStartTimestamp)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Lock Ends</dt>
                <dd className="text-sm text-gray-900">{formatTime(stakingData.lockEndTimestamp)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Phase 1 Mined</dt>
                <dd className="text-sm text-gray-900">{stakingData.totalMinedPhase1.toLocaleString()} SNAKE</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phase 2 Mining</dt>
                <dd className="text-sm text-gray-900">
                  {stakingData.phase2Mining ? (
                    <span className="text-green-600">✓ Active</span>
                  ) : (
                    <span className="text-red-600">✗ Inactive</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">DAO Eligible</dt>
                <dd className="text-sm text-gray-900">
                  {stakingData.daoEligible ? (
                    <span className="text-green-600">✓ Yes</span>
                  ) : (
                    <span className="text-red-600">✗ No</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Actions */}
      {stakingData.role === 'staker' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={claimYield}
              disabled={claimingYield || stakingData.availableYield <= 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
            >
              {claimingYield ? 'Claiming...' : `Claim ${stakingData.availableYield.toFixed(4)} SNAKE`}
            </button>
            {stakingData.canUnlock && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                onClick={() => {/* Implement unlock logic */}}
              >
                Unlock Tokens
              </button>
            )}
          </div>
        </div>
      )}

      {/* Patron Info */}
      {stakingData.role === 'patron' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Patron Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Qualification Score</dt>
                  <dd className="text-sm text-gray-900">{stakingData.patronQualificationScore}/100</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Commitment Status</dt>
                  <dd className="text-sm text-gray-900">
                    {stakingData.isLocked ? (
                      <span className="text-yellow-600">Locked until {formatTime(stakingData.lockEndTimestamp)}</span>
                    ) : (
                      <span className="text-green-600">Commitment Complete</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phase 2 Requirement</dt>
                  <dd className="text-sm text-gray-900">
                    {stakingData.phase2Mining ? (
                      <span className="text-green-600">✓ Completed</span>
                    ) : (
                      <span className="text-red-600">✗ Required</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">DAO Eligibility</dt>
                  <dd className="text-sm text-gray-900">
                    {stakingData.daoEligible ? (
                      <span className="text-green-600">✓ Eligible at Month 6</span>
                    ) : (
                      <span className="text-yellow-600">Pending requirements</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingDashboard;
