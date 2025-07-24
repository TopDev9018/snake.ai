import React, { useState, useEffect } from 'react';
import { UserRole } from '../index';
import { otcApi } from '../services/apiService';

interface OTCTradingProps {
  userRole: UserRole;
}

interface OTCSwap {
  id: string;
  seller?: string;
  token_amount: number;
  sol_rate: number;
  buyer_rebate: number;
  buyer_role_required: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

function OTCTrading({ userRole }: OTCTradingProps) {
  const [activeSwaps, setActiveSwaps] = useState<OTCSwap[]>([]);
  const [mySwaps, setMySwaps] = useState<OTCSwap[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state for creating new swap
  const [tokenAmount, setTokenAmount] = useState('');
  const [solRate, setSolRate] = useState('');
  const [buyerRebate, setBuyerRebate] = useState('');
  const [requiredRole, setRequiredRole] = useState<'none' | 'staker' | 'patron'>('none');

  useEffect(() => {
    fetchActiveSwaps();
    fetchMySwaps();
  }, []);

  const fetchActiveSwaps = async () => {
    try {
      const response = await otcApi.getActiveSwaps();
      if (response.success && response.data) {
        // Map the API response to match our interface
        const mappedSwaps = response.data.map(swap => ({
          ...swap,
          status: swap.status as 'active' | 'completed' | 'cancelled'
        }));
        setActiveSwaps(mappedSwaps);
      } else {
        setActiveSwaps([]);
      }
    } catch (error) {
      console.error('Failed to fetch active swaps:', error);
      setActiveSwaps([]);
    }
  };

  const fetchMySwaps = async () => {
    try {
      const response = await otcApi.getMySwaps();
      if (response.success && response.data) {
        // Map the API response to match our interface
        const mappedSwaps = response.data.map(swap => ({
          ...swap,
          seller: (swap as any).seller || 'You', // Add seller field if missing
          status: swap.status as 'active' | 'completed' | 'cancelled'
        }));
        setMySwaps(mappedSwaps);
      } else {
        setMySwaps([]);
      }
    } catch (error) {
      console.error('Failed to fetch my swaps:', error);
      setMySwaps([]);
    }
  };

  const handleCreateSwap = async () => {
    if (!tokenAmount || !solRate || !buyerRebate) return;

    setLoading(true);
    try {
      const result = await otcApi.initiateSwap({
        token_amount: Number(tokenAmount) * 1000000000, // Convert to lamports
        sol_rate: Number(solRate),
        buyer_rebate: Number(buyerRebate),
        buyer_role_required: requiredRole
      });

      if (result.success) {
        console.log('Create OTC swap transaction:', result.data);
        setShowCreateForm(false);
        resetForm();
        fetchActiveSwaps();
        fetchMySwaps();
      } else {
        throw new Error(result.error || 'Failed to create OTC swap');
      }
    } catch (error) {
      console.error('Error creating OTC swap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSwap = async (swapId: string, sellerPubkey: string) => {
    setLoading(true);
    try {
      const result = await otcApi.acceptSwap(sellerPubkey);

      if (result.success) {
        console.log('Accept OTC swap transaction:', result.data);
        fetchActiveSwaps();
      } else {
        throw new Error(result.error || 'Failed to accept OTC swap');
      }
    } catch (error) {
      console.error('Error accepting OTC swap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    setLoading(true);
    try {
      const result = await otcApi.cancelSwap();

      if (result.success) {
        console.log('Cancel OTC swap transaction:', result.data);
        fetchMySwaps();
        fetchActiveSwaps();
      } else {
        throw new Error(result.error || 'Failed to cancel OTC swap');
      }
    } catch (error) {
      console.error('Error cancelling OTC swap:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTokenAmount('');
    setSolRate('');
    setBuyerRebate('');
    setRequiredRole('none');
  };

  const canCreateSwap = userRole.role !== 'none';
  const canParticipate = userRole.role !== 'none';

  return (
    <div className="w-100">
      <h3 className="mb-4">🔄 OTC Trading</h3>

      {/* Create New Swap */}
      {canCreateSwap && (
        <div className="card border-primary mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">📝 Create OTC Swap</h5>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : 'Create New Swap'}
              </button>
            </div>

            {showCreateForm && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Token Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount of SNAKE tokens"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SOL Rate</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="SOL per 1000 SNAKE"
                    value={solRate}
                    onChange={(e) => setSolRate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Buyer Rebate (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0-10"
                    value={buyerRebate}
                    onChange={(e) => setBuyerRebate(e.target.value)}
                    max="10"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Required Buyer Role</label>
                  <select
                    className="form-select"
                    value={requiredRole}
                    onChange={(e) => setRequiredRole(e.target.value as 'none' | 'staker' | 'patron')}
                  >
                    <option value="none">Any Role</option>
                    <option value="staker">Staker or Higher</option>
                    <option value="patron">Patron Only</option>
                  </select>
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-success"
                    onClick={handleCreateSwap}
                    disabled={loading || !tokenAmount || !solRate || !buyerRebate}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating Swap...
                      </>
                    ) : (
                      'Create OTC Swap'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Active Swaps */}
      {mySwaps.length > 0 && (
        <div className="card border-warning mb-4">
          <div className="card-body">
            <h5 className="card-title">📊 My Active Swaps</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tokens</th>
                    <th>SOL Rate</th>
                    <th>Rebate</th>
                    <th>Required Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mySwaps.map((swap) => (
                    <tr key={swap.id}>
                      <td>{swap.token_amount.toLocaleString()} SNAKE</td>
                      <td>{swap.sol_rate} SOL</td>
                      <td>{swap.buyer_rebate}%</td>
                      <td>
                        <span className={`badge bg-${
                          swap.buyer_role_required === 'patron' ? 'warning' :
                          swap.buyer_role_required === 'staker' ? 'primary' : 'secondary'
                        }`}>
                          {swap.buyer_role_required}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${
                          swap.status === 'active' ? 'success' :
                          swap.status === 'completed' ? 'info' : 'danger'
                        }`}>
                          {swap.status}
                        </span>
                      </td>
                      <td>
                        {swap.status === 'active' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelSwap(swap.id)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Available Swaps */}
      <div className="card border-success">
        <div className="card-body">
          <h5 className="card-title">🛍️ Available OTC Swaps</h5>
          
          {activeSwaps.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p>No active swaps available</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Tokens</th>
                    <th>SOL Rate</th>
                    <th>Your Rebate</th>
                    <th>Required Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSwaps.map((swap) => {
                    const canAccept = canParticipate && (
                      swap.buyer_role_required === 'none' ||
                      (swap.buyer_role_required === 'staker' && ['staker', 'patron'].includes(userRole.role)) ||
                      (swap.buyer_role_required === 'patron' && userRole.role === 'patron')
                    );

                    const rebateAmount = (swap.token_amount * swap.buyer_rebate) / 100;
                    const effectiveRate = swap.sol_rate * (1 - swap.buyer_rebate / 100);

                    return (
                      <tr key={swap.id}>
                        <td>{swap.seller || 'Unknown'}</td>
                        <td>{swap.token_amount.toLocaleString()} SNAKE</td>
                        <td>{swap.sol_rate} SOL</td>
                        <td>
                          <div>
                            <strong>{rebateAmount.toLocaleString()} SNAKE</strong>
                            <br />
                            <small className="text-muted">
                              Effective: {effectiveRate.toFixed(2)} SOL
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${
                            swap.buyer_role_required === 'patron' ? 'warning' :
                            swap.buyer_role_required === 'staker' ? 'primary' : 'secondary'
                          }`}>
                            {swap.buyer_role_required}
                          </span>
                        </td>
                        <td>
                          {canAccept ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleAcceptSwap(swap.id, swap.seller || '')}
                              disabled={loading}
                            >
                              {loading ? 'Processing...' : 'Accept'}
                            </button>
                          ) : (
                            <small className="text-muted">
                              {userRole.role === 'none' ? 'Role required' : 'Role insufficient'}
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* OTC Trading Information */}
      <div className="mt-4">
        <div className="card border-info">
          <div className="card-body">
            <h6 className="card-title">ℹ️ OTC Trading Information</h6>
            <div className="row">
              <div className="col-md-6">
                <h6>For Sellers:</h6>
                <ul>
                  <li>Set your own rates and terms</li>
                  <li>Choose buyer role requirements</li>
                  <li>Offer rebates to attract buyers</li>
                  <li>Cancel anytime before acceptance</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>For Buyers:</h6>
                <ul>
                  <li>Browse available swaps</li>
                  <li>Enjoy rebates from sellers</li>
                  <li>Instant settlement on acceptance</li>
                  <li>Role-based access to premium swaps</li>
                </ul>
              </div>
            </div>
            
            {userRole.role === 'patron' && (
              <div className="alert alert-warning mt-3">
                <strong>Patron Bonus:</strong> As a Patron, you receive additional rebates on all OTC trades!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTCTrading;
