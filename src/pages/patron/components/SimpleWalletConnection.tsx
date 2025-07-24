import React from 'react';
import { useWalletContext } from '../../../contexts/WalletContext';

const SimpleWalletConnection: React.FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWalletContext();

  return (
    <div style={{
      // background: '#f5f5f5',
      // padding: '20px',
      // borderRadius: '8px',
      // marginBottom: '20px'
    }}>
      {/* <h3 style={{ marginTop: 0, color: '#333' }}>Wallet Connection</h3> */}
      
      <div>
        {!connected && !connecting && (
          <div className='d-flex justify-content-center'>
            {/* <p>Please connect your wallet to access the Patron Framework.</p> */}
            <button 
              onClick={connect} 
              style={{
                background: '#A9E000',
                color: 'black',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
        
        {connecting && (
          <p className='text-center'>Connecting to wallet...</p>
        )}
        
        {connected && publicKey && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: 'transparent',
            borderRadius: '5px',
            border: '2px dashed #333'
          }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Wallet Address:</strong> {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </p>
            {/* <button 
              onClick={disconnect} 
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Disconnect
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleWalletConnection;
