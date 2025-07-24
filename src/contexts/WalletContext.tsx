import React, { createContext, useContext, ReactNode, useState } from 'react';

interface WalletContextState {
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContext = createContext<WalletContextState>({
  connected: false,
  publicKey: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      // Check if Phantom wallet is available
      if (typeof window !== 'undefined' && (window as any).solana) {
        const response = await (window as any).solana.connect();
        setPublicKey(response.publicKey.toString());
        setConnected(true);
      } else {
        alert('Phantom wallet not found! Please install it.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
  };

  const value: WalletContextState = {
    connected,
    publicKey,
    connecting,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
