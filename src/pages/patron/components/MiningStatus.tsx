import React, { useState, useEffect } from 'react';
import { tokenApi } from '../services/apiService';

interface MiningStatusData {
  current_phase: 1 | 2;
  phase1_tweet_count: number;
  phase2_tweet_count: number;
  total_phase1_mined: number;
  total_phase2_mined: number;
  phase2_start_date: string;
}

function MiningStatus() {
  const [miningData, setMiningData] = useState<MiningStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMiningStatus();
  }, []);

  const fetchMiningStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tokenApi.getMiningStatus();
      if (response.success && response.data) {
        setMiningData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch mining status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mining status');
      console.error('Error fetching mining status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card border-3 border-dashed">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading mining status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-3 border-dashed border-danger">
        <div className="card-body">
          <h5 className="card-title text-danger">❌ Error</h5>
          <p className="text-danger">{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchMiningStatus}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!miningData) {
    return (
      <div className="card border-3 border-dashed">
        <div className="card-body text-center">
          <p className="text-muted">No mining data available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card border-3 border-dashed">
      <div className="card-body">
        <h5 className="card-title mb-4">⛏️ Mining Status</h5>
        
        {/* Current Phase */}
        <div className="mb-4">
          <div className="alert alert-info">
            <h6 className="alert-heading">Current Phase</h6>
            <div className="d-flex align-items-center">
              <span className={`badge bg-${miningData.current_phase ===  1 ? 'success' : 'primary'} fs-6 me-2`}>
                {miningData.current_phase}
              </span>
              {miningData.current_phase === 2 && (
                <small className="text-muted">
                  Started: {formatDate(miningData.phase2_start_date)}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Mining Statistics */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body text-center">
                <div className="fs-2 fw-bold text-success">{miningData.phase1_tweet_count}</div>
                <small className="text-muted">Phase 1 Tweets</small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body text-center">
                <div className="fs-2 fw-bold text-primary">{miningData.phase2_tweet_count}</div>
                <small className="text-muted">Phase 2 Tweets</small>
              </div>
            </div>
          </div>
        </div>

        {/* Token Rewards */}
        <div className="mt-4">
          <h6>Token Rewards</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card border-success">
                <div className="card-body text-center">
                  <div className="fs-4 fw-bold text-success">{miningData.total_phase1_mined}</div>
                  <small className="text-muted">Phase 1 Tokens</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <div className="fs-4 fw-bold text-primary">{miningData.total_phase2_mined}</div>
                  <small className="text-muted">Phase 2 Tokens</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Information */}
        <div className="mt-4">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="card-title">📋 Phase Information</h6>
              <ul className="mb-2">
                <li><small><strong>Phase 1:</strong> Basic mining rewards for Twitter engagement</small></li>
                <li><small><strong>Phase 2:</strong> Anyone can mine, but roles unlock enhanced benefits</small></li>
              </ul>
              
              {miningData.current_phase === 2 && (
                <div className="mt-3">
                  <h6 className="fs-6">🎭 Role Benefits in Phase 2:</h6>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body p-2">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">👤 None</span>
                            <small>Standard mining rewards, can sell at TGE</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body p-2">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">🏦 Staker</span>
                            <small>3-month lock, 5% APY rewards, enhanced mining</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body p-2">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-warning me-2">👑 Patron</span>
                            <small>6-month commitment, DAO eligibility, OTC benefits</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-3 text-center">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchMiningStatus}>
            🔄 Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiningStatus;
