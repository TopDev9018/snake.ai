import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';

interface WalletGuardProps {
  children: React.ReactNode;
  showMessage?: boolean;
}

const WalletGuard: React.FC<WalletGuardProps> = ({ children, showMessage = true }) => {
  const { connected, connecting, connect } = useWalletContext();

  if (connected) {
    return <>{children}</>;
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      {showMessage && (
        <div className="text-center mb-4">
          <h4 className="text-muted mb-3">🔗 Wallet Connection Required</h4>
          <p className="text-muted">Please connect your wallet to access this feature.</p>
        </div>
      )}
      
      <div className="text-center">
        {connecting ? (
          <div>
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Connecting...</span>
            </div>
            <p className="text-muted">Connecting to wallet...</p>
          </div>
        ) : (
          <button 
            onClick={connect} 
            className="btn btn-primary btn-lg"
            style={{
              background: '#A9E000',
              color: 'black',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px'
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletGuard;
