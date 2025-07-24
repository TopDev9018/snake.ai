import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';
import { userApi } from '../pages/patron/services/apiService';

const WalletTestPanel: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { connected, publicKey, connecting, connect, disconnect } = useWalletContext();
  const [testResult, setTestResult] = useState<string>('');

  const testWalletFlow = async () => {
    if (!isAuthenticated) {
      setTestResult('❌ Please login first before connecting wallet');
      return;
    }

    if (!connected) {
      setTestResult('📱 Please connect your wallet first');
      return;
    }

    try {
      setTestResult('🔗 Testing wallet integration...');
      
      if (!publicKey) {
        setTestResult('❌ No wallet public key available');
        return;
      }
      
      // Test setting wallet address for authenticated user
      const result = await userApi.setWalletAddress(publicKey);

      if (result.success) {
        setTestResult('✅ Wallet successfully linked to authenticated account!');
      } else if (result.error?.includes('already set') || result.error?.includes('already using')) {
        setTestResult('ℹ️ Wallet address is already set for this account');
      } else {
        setTestResult(`❌ Failed to link wallet: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Wallet test error: ${error}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '250px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid blue', 
      padding: '10px',
      zIndex: 1000,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>🔗 Wallet Test Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <p><strong>Auth Status:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}</p>
        <p><strong>User:</strong> {user?.twitter_username || 'none'}</p>
        <p><strong>Wallet:</strong> {connected ? '✅ Connected' : '❌ Not connected'}</p>
        {publicKey && (
          <p><strong>Address:</strong> {publicKey.slice(0, 8)}...{publicKey.slice(-8)}</p>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        {!connected ? (
          <button 
            onClick={connect} 
            disabled={connecting}
            style={{ 
              backgroundColor: '#A9E000', 
              border: 'none', 
              padding: '8px 12px',
              width: '100%',
              marginBottom: '5px'
            }}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button 
            onClick={disconnect}
            style={{ 
              backgroundColor: '#ff4444', 
              color: 'white',
              border: 'none', 
              padding: '8px 12px',
              width: '100%',
              marginBottom: '5px'
            }}
          >
            Disconnect Wallet
          </button>
        )}
        
        <button 
          onClick={testWalletFlow}
          disabled={!isAuthenticated || !connected}
          style={{ 
            backgroundColor: isAuthenticated && connected ? '#0066cc' : '#cccccc',
            color: 'white',
            border: 'none', 
            padding: '8px 12px',
            width: '100%'
          }}
        >
          Test Wallet Integration
        </button>
      </div>
      
      <div style={{ marginTop: '10px', wordBreak: 'break-word', fontSize: '11px' }}>
        {testResult}
      </div>
    </div>
  );
};

export default WalletTestPanel;
