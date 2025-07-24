import React, { useState } from 'react';

interface DemoModeProps {
  onEnableDemo: () => void;
}

function DemoMode({ onEnableDemo }: DemoModeProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="alert alert-info border border-3 border-dashed">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="alert-heading mb-1">🚀 Phase 2 Demo Mode</h6>
          <small>Test the new features without authentication</small>
        </div>
        <div>
          <button 
            className="btn btn-sm btn-outline-info me-2"
            onClick={() => setShowInfo(!showInfo)}
          >
            ℹ️ Info
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={onEnableDemo}
          >
            🎮 Try Demo
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="mt-3 pt-3 border-top">
          <h6>What's New in Phase 2:</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body p-2">
                  <h6 className="card-title fs-6">🎭 Role Selection</h6>
                  <small>Choose between Exit, Staker, or Patron paths during token claiming</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body p-2">
                  <h6 className="card-title fs-6">💰 Enhanced Mining</h6>
                  <small>Anyone can mine, but roles unlock special benefits and rewards</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body p-2">
                  <h6 className="card-title fs-6">🔒 Token Vesting</h6>
                  <small>Custom vesting contracts with 5% APY for stakers</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <small className="text-muted">
              <strong>Testing Features:</strong> OTC Trading validation, Burn penalties, Patron flow checks, 
              Real reward claiming with role selection
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoMode;
