import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';

const WalletDisplay: React.FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWalletContext();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className='d-flex justify-content-center align-items-center'>
      {!connected && !connecting && (
        <div className='d-flex justify-content-center'>
          <button 
            onClick={connect} 
            className="btn btn-primary px-4 py-2"
            style={{
              background: '#A9E000',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}
      
      {connecting && (
        <div className='text-center'>
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Connecting to wallet...
        </div>
      )}
      
      {connected && publicKey && (
        <div className="wallet-info-card bg-white-custom p-3 rounded">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex">
              <div className="fs-6 text-muted">Address : &nbsp;</div>
              <div className="fs-5 fw-bold font-monospace">
                {formatAddress(publicKey)}
              </div>
            </div>
            <div className="d-flex gap-2 ms-3">
              <button 
                onClick={copyToClipboard}
                className="btn btn-outline-primary btn-sm"
                title="Copy full address"
              >
                {copied ? (
                  <>
                    <i className="fa fa-check"></i>
                  </>
                ) : (
                  <>
                    <i className="fa fa-clone"></i>
                  </>
                )}
              </button>
              {/* <button 
                onClick={disconnect}
                className="btn btn-outline-danger btn-sm"
                title="Disconnect wallet"
              >
                <i className="fa fa-power"></i>
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDisplay;
