import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { useWalletContext } from '../../contexts/WalletContext';
import { tokenApi, userApi } from '../patron/services/apiService';
import WalletGuard from "../../components/WalletGuard";
import { UserRole } from '../patron/index';

interface ClaimPageProps {
  page_number?: number;
}

interface ClaimData {
  id: string;
  amount: number;
  phase: 'Phase1' | 'Phase2';
  timestamp: string;
  claimed: boolean;
  userId: string;
  tweetId?: string;
  twitterUsername?: string;
}

function ClaimPage({ page_number = 1 }: ClaimPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, publicKey, connect } = useWalletContext();

  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole['role']>('none');
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchClaimData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('No reward ID provided');
        return;
      }

      const response = await userApi.getRewardById(id);

      if (response.success && response.data) {
        const rewardData = response.data;
        const claimData: ClaimData = {
          id: rewardData.id,
          amount: rewardData.reward_amount,
          phase: (rewardData.phase === 'Phase2' ? 'Phase2' : 'Phase1') as 'Phase1' | 'Phase2',
          timestamp: rewardData.created_at,
          claimed: !!rewardData.transaction_signature, // If transaction exists, it's been claimed
          userId: rewardData.user_id,
          tweetId: rewardData.tweet_id
        };
        setClaimData(claimData);
      } else {
        setError(response.error || 'Failed to fetch reward data');
      }
    } catch (err) {
      setError('Failed to fetch claim data');
      console.error('Error fetching claim data:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClaimData();
    }
  }, [id, fetchClaimData]);

  const handleClaim = async () => {
    if (!claimData || !connected || !publicKey) return;

    setClaiming(true);
    setError(null);

    try {
      if (!claimData) return;

      const response = await tokenApi.claimTokensWithRole(selectedRole, claimData.amount);

      if (response.success) {
        setSuccess(true);
        setClaimData(prev => prev ? { ...prev, claimed: true } : null);
        console.log('Claim successful:', response.data);
      } else {
        throw new Error(response.error || 'Claim failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim tokens');
      console.error('Error claiming tokens:', err);
    } finally {
      setClaiming(false);
    }
  };

  const getRoleColor = (role: UserRole['role']) => {
    switch (role) {
      case 'staker': return 'primary';
      case 'patron': return 'warning';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: UserRole['role']) => {
    switch (role) {
      case 'staker': return '🏦';
      case 'patron': return '👑';
      default: return '👤';
    }
  };

  const getRoleBenefits = (role: UserRole['role']) => {
    switch (role) {
      case 'staker': return ['5% staking rewards', '3-month lock period', 'Enhanced mining multiplier'];
      case 'patron': return ['All Staker benefits', 'DAO governance', '6-month lock period', 'OTC trading rebates'];
      default: return ['Basic access', 'No token lock', 'Standard rewards'];
    }
  };

  if (loading) {
    return (
      <div className="w-100 p-3" style={{ height: "100vh" }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading claim data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !claimData) {
    return (
      <div className="w-100 p-3" style={{ height: "100vh" }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
          <div className="text-center">
            <div className="alert alert-danger">
              <h4>Error</h4>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchClaimData}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 p-3" style={{ height: "100vh" }}>
      <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
        {/* Menu Begin */}
        <ResponsiveMenu />
        {/* Menu End */}
        <div className="custom-content" >
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fs-1" style={{ lineHeight: 'normal' }}>🎁 Claim Your Twitter Mining Reward</div>
            </div>
          </div>
          <div className="custom-border-y custom-content-height d-flex flex-column px-3">
            <WalletGuard>
              <div className="w-100" style={{ minHeight: '86vh' }}>

                {/* Header */}
                <div className="w-100">
                  {claimData?.tweetId && (
                    <div className="alert alert-info mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">🐦</span>
                        <div>
                          <strong>Qualifying Tweet:</strong>{' '}
                          <a
                            href={`https://twitter.com/i/status/${claimData.tweetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            View on Twitter →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wallet Connection */}
                {!connected ? (
                  <div className="w-100 mb-4">
                    <div className="alert alert-warning text-center">
                      <h4>Connect Your Wallet</h4>
                      <p>Please connect your wallet to claim your Snake AI tokens</p>
                      <button className="btn btn-primary btn-lg" onClick={connect}>
                        Connect Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-100 mb-4">
                    <div className="alert alert-success">
                      <strong>Wallet Connected:</strong> {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="w-100 mb-4">
                    <div className="alert alert-success">
                      <h4>🎉 Claim Successful!</h4>
                      <p>Your tokens have been claimed successfully and your role has been updated.</p>
                      <button className="btn btn-outline-success" onClick={() => navigate('/patron-framework')}>
                        Go to Patron Framework
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Content */}
                {claimData && connected && !success && (
                  <div className="row g-4">
                    {/* Role Selection */}
                    <div className="col-lg-6">
                      <div className="card border-3 border-dashed h-100">
                        <div className="card-body">
                          <h3 className="card-title mb-4">🎭 Select Your Role</h3>

                          <div className="row g-3">
                            {(['none', 'staker', 'patron'] as UserRole['role'][]).map((role) => (
                              <div key={role} className="col-12">
                                <div
                                  className={`card border-2 ${selectedRole === role
                                      ? `border-${getRoleColor(role)} bg-light`
                                      : 'border-secondary'
                                    }`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setSelectedRole(role)}
                                >
                                  <div className="card-body">
                                    <div className="d-flex align-items-center mb-2">
                                      <span className="fs-4 me-3">{getRoleIcon(role)}</span>
                                      <div>
                                        <h6 className="card-title mb-0">{role === 'none' ? 'No Role' : role}</h6>
                                        {selectedRole === role && (
                                          <small className="text-success">✓ Selected</small>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <small className="text-muted">Benefits:</small>
                                      <ul className="list-unstyled mt-1">
                                        {getRoleBenefits(role).map((benefit, index) => (
                                          <li key={index}>
                                            <small>• {benefit}</small>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Claim Summary */}
                    <div className="col-lg-6">
                      <div className="card border-3 border-dashed h-100">
                        <div className="card-body">
                          <h3 className="card-title mb-4">📊 Claim Summary</h3>

                          <div className="mb-4">
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <div className="fs-2 fw-bold text-primary">{claimData.amount}</div>
                                    <small className="text-muted">SNAKE Tokens</small>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <div className={`badge bg-${claimData.phase === 'Phase1' ? 'success' : 'info'} fs-6`}>
                                      {claimData.phase}
                                    </div>
                                    <div><small className="text-muted">Mining Phase</small></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6>Selected Role: {getRoleIcon(selectedRole)} {selectedRole === 'none' ? 'No Role' : selectedRole}</h6>
                                <div className="mt-2">
                                  <small className="text-muted">Benefits:</small>
                                  <ul className="list-unstyled mt-1">
                                    {getRoleBenefits(selectedRole).map((benefit, index) => (
                                      <li key={index}>
                                        <small>• {benefit}</small>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error Display */}
                          {error && (
                            <div className="alert alert-danger">
                              <strong>Error:</strong> {error}
                            </div>
                          )}

                          {/* Claim Button */}
                          <div className="d-grid">
                            <button
                              className={`btn btn-${getRoleColor(selectedRole)} btn-lg`}
                              onClick={handleClaim}
                              disabled={claiming || claimData.claimed}
                            >
                              {claiming ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                                  Claiming...
                                </>
                              ) : claimData.claimed ? (
                                'Already Claimed'
                              ) : (
                                `Claim ${claimData.amount} SNAKE Tokens`
                              )}
                            </button>
                          </div>

                          {/* Twitter Mining Info */}
                          <div className="mt-4">
                            <div className="card border-info">
                              <div className="card-body">
                                <h6 className="card-title">🐦 How Twitter Mining Works</h6>
                                <ul className="mb-0">
                                  <li><small>1. Follow @playSnakeAI on Twitter</small></li>
                                  <li><small>2. Tweet mentioning @playSnakeAI with #MineTheSnake</small></li>
                                  <li><small>3. Our system automatically detects qualifying tweets</small></li>
                                  <li><small>4. You get a claim link sent to you on Twitter</small></li>
                                  <li><small>5. One reward per 24 hours per user</small></li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Important Notes */}
                          <div className="mt-3">
                            <div className="card border-warning">
                              <div className="card-body">
                                <h6 className="card-title">⚠️ Important Notes</h6>
                                <ul className="mb-0">
                                  <li><small>Role changes affect token lock periods</small></li>
                                  <li><small>Staker and Patron roles require token commitment</small></li>
                                  <li><small>Locked tokens earn additional rewards</small></li>
                                  <li><small>This action requires blockchain confirmation</small></li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </WalletGuard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimPage;
