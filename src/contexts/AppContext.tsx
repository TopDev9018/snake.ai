import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWalletContext } from './WalletContext';
import { tokenApi, userApi, roleApi } from '../pages/patron/services/apiService';
import { UserRole } from '../pages/patron/index';

interface MiningStatus {
  current_phase: 1 | 2;
  phase1_tweet_count: number;
  phase2_tweet_count: number;
  total_phase1_mined: number;
  total_phase2_mined: number;
  phase2_start_date: string;
}

interface UserProfile {
  twitter_username: string;
  wallet_address: string;
  latest_claim_timestamp: string | null;
  reward_balance: number;
  tweets: number;
  likes: number;
  replies: number;
}

interface TokenInfo {
  balance: number;
  locked: number;
  staked: number;
  rewards: number;
}

interface AppContextState {
  miningStatus: MiningStatus | null;
  userProfile: UserProfile | null;
  tokenInfo: TokenInfo | null;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  isWalletRequired: boolean;
  showWalletWarning: boolean;
}

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextState>({
  miningStatus: null,
  userProfile: null,
  tokenInfo: null,
  userRole: { role: 'none' },
  loading: false,
  error: null,
  refreshData: async () => {},
  updateUserRole: () => {},
  isWalletRequired: false,
  showWalletWarning: false,
});

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { connected, publicKey } = useWalletContext();
  
  const [miningStatus, setMiningStatus] = useState<MiningStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole>({ role: 'none' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if wallet is required and should show warning
  const isWalletRequired = isAuthenticated && !connected;
  const showWalletWarning = isAuthenticated && !connected;

  const fetchMiningStatus = useCallback(async () => {
    try {
      const result = await tokenApi.getMiningStatus();
      if (result.success && result.data) {
        setMiningStatus(result.data);
      } else {
        console.error('Failed to fetch mining status:', result.error);
      }
    } catch (error) {
      console.error('Error fetching mining status:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await userApi.getProfile();
      if (result.success && result.data) {
        setUserProfile(result.data);
      } else {
        console.error('Failed to fetch user profile:', result.error);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [isAuthenticated]);

  const fetchTokenInfo = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await tokenApi.getTokenInfo();
      if (result.success && result.data) {
        setTokenInfo(result.data);
      } else {
        console.error('Failed to fetch token info:', result.error);
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  }, [isAuthenticated]);

  const fetchUserRole = useCallback(async () => {
    if (!isAuthenticated || !connected) {
      setUserRole({ role: 'none' });
      return;
    }
    
    try {
      const result = await roleApi.getUserRole();
      if (result.success && result.data) {
        const backendRole = result.data.role?.toLowerCase();
        let mappedRole: UserRole['role'] = 'none';
        if (backendRole === 'staker') mappedRole = 'staker';
        else if (backendRole === 'patron') mappedRole = 'patron';
        setUserRole({ ...result.data, role: mappedRole });
      } else {
        console.error('Failed to fetch user role:', result.error);
        setUserRole({ role: 'none' });
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole({ role: 'none' });
    }
  }, [isAuthenticated, connected]);

  const updateUserRole = useCallback((newRole: UserRole) => {
    setUserRole(newRole);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchMiningStatus(),
        fetchUserProfile(),
        fetchTokenInfo(),
        fetchUserRole(),
      ]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchMiningStatus, fetchUserProfile, fetchTokenInfo, fetchUserRole]);

  // Update wallet address when wallet connects
  useEffect(() => {
    const updateWalletAddress = async () => {
      if (connected && publicKey && isAuthenticated) {
        try {
          // Check if user already has this wallet address set
          if (userProfile?.wallet_address === publicKey) {
            console.log('Wallet address already matches current user profile, skipping update');
            return; // Wallet address already matches, no need to update
          }
          
          const result = await userApi.setWalletAddress(publicKey);
          if (result.success) {
            // Refresh user profile to get updated wallet address
            await fetchUserProfile();
          }
        } catch (error) {
          // Only log errors that aren't about wallet address already being set
          const isAlreadySetError = error instanceof Error && 
            (error.message.includes('already set') || error.message.includes('already using'));
          
          if (!isAlreadySetError) {
            console.error('Failed to update wallet address:', error);
          }
        }
      }
    };

    updateWalletAddress();
  }, [connected, publicKey, isAuthenticated, fetchUserProfile, userProfile?.wallet_address]);

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear data when not authenticated
      setUserProfile(null);
      setTokenInfo(null);
      setMiningStatus(null);
    }
  }, [isAuthenticated, refreshData]);

  // Periodic refresh of mining status (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchMiningStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMiningStatus]);

  const value: AppContextState = {
    miningStatus,
    userProfile,
    tokenInfo,
    userRole,
    loading,
    error,
    refreshData,
    updateUserRole,
    isWalletRequired,
    showWalletWarning,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
