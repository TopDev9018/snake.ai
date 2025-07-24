// API Service for Patron Framework
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WalletTransactionResponse {
  success: boolean;
  data: string;
  requiresWalletSignature: boolean;
  error?: string;
}

// Get session token from cookies
function getSessionToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'SID') {
      return value;
    }
  }
  return null;
}

// Auth event handlers for session expiry
let onAuthError: (() => void) | null = null;

export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const sessionToken = getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add Bearer token if session exists
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        if (onAuthError) {
          onAuthError();
        }
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      
      // Handle wallet address already set error more gracefully
      if (response.status === 400 && endpoint === '/user/wallet_address') {
        const errorText = await response.text();
        if (errorText.includes('already set') || errorText.includes('already using')) {
          return { success: false, error: 'Wallet address already set' };
        }
      }
      
      const errorText = await response.text();
      return { success: false, error: errorText || 'API call failed' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// Role Management API calls
export const roleApi = {
  selectRole: async (role: 'none' | 'staker' | 'patron') => {
    return apiCall<string>('/user/select_role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  getUserRole: async () => {
    return apiCall<{ role: string; status?: string }>('/user/profile', {
      method: 'GET',
    });
  },
};

// Token Management API calls
export const tokenApi = {
  initializeUserClaim: async (): Promise<WalletTransactionResponse> => {
    // Initialize user claim account before first use
    const response = await apiCall<string>('/user/initialize_user_claim', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      return { success: true, data: response.data, requiresWalletSignature: true };
    }
    
    return { success: false, data: '', requiresWalletSignature: false, error: response.error };
  },

  lockTokens: async (amount: number, durationMonths: number): Promise<WalletTransactionResponse> => {
    // This returns a base64 encoded transaction that needs to be signed
    const response = await apiCall<string>('/user/lock_tokens', {
      method: 'POST',
      body: JSON.stringify({ amount, duration_months: durationMonths }),
    });
    
    if (response.success && response.data) {
      // Return the base64 transaction for the frontend to sign and submit
      return { success: true, data: response.data, requiresWalletSignature: true };
    }
    
    return { success: false, data: '', requiresWalletSignature: false, error: response.error };
  },

  unlockTokens: async () => {
    return apiCall<string>('/user/unlock_tokens', {
      method: 'POST',
    });
  },

  claimYield: async () => {
    return apiCall<string>('/user/claim_yield', {
      method: 'POST',
    });
  },

  claimTokensWithRole: async (role: string, amount?: number) => {
    return apiCall<string>('/user/claim_tokens_with_role', {
      method: 'POST',
      body: JSON.stringify({ role, amount: amount || 1000 }),
    });
  },

  getTokenInfo: async () => {
    return apiCall<{
      balance: number;
      locked: number;
      staked: number;
      rewards: number;
      mining_count: number;
      lockEndDate?: string;
    }>('/user/token_info', {
      method: 'GET',
    });
  },

  getMiningStatus: async () => {
    return apiCall<{
      current_phase: 1 | 2;
      phase1_tweet_count: number;
      phase2_tweet_count: number;
      total_phase1_mined: number;
      total_phase2_mined: number;
      phase2_start_date: string;
    }>('/user/mining_status', {
      method: 'GET',
    });
  },
};

// Patron Application API calls
export const patronApi = {
  applyForPatron: async (wallet_age_days: number, community_score: number) => {
    return apiCall<string>('/user/apply_patron', {
      method: 'POST',
      body: JSON.stringify({ wallet_age_days, community_score }),
    });
  },

  approvePatron: async (applicationId: string, approved: boolean) => {
    return apiCall<string>('/user/approve_patron', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, approved }),
    });
  },

  getApplicationStatus: async () => {
    return apiCall<{
      id: string;
      status: 'pending' | 'approved' | 'rejected' | 'none';
      submitted_at: string;
      qualification_score: number;
    }>('/user/patron_application', {
      method: 'GET',
    });
  },

  getPendingApplications: async () => {
    return apiCall<Array<{
      id: string;
      status: string;
      submitted_at: string;
      qualification_score: number;
    }>>('/user/pending_patron_applications', {
      method: 'GET',
    });
  },
};

// OTC Trading API calls
export const otcApi = {
  initiateSwap: async (params: {
    token_amount: number;
    sol_rate: number;
    buyer_rebate: number;
    buyer_role_required: string;
  }): Promise<WalletTransactionResponse> => {
    // This returns a base64 encoded transaction that needs to be signed
    const response = await apiCall<string>('/user/initiate_otc_swap', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    
    if (response.success && response.data) {
      // Return the base64 transaction for the frontend to sign and submit
      return { success: true, data: response.data, requiresWalletSignature: true };
    }
    
    return { success: false, data: '', requiresWalletSignature: false, error: response.error };
  },

  acceptSwap: async (sellerPubkey: string) => {
    return apiCall<string>('/user/accept_otc_swap', {
      method: 'POST',
      body: JSON.stringify({ seller_pubkey: sellerPubkey }),
    });
  },

  cancelSwap: async () => {
    return apiCall<string>('/user/cancel_otc_swap', {
      method: 'POST',
    });
  },

  getActiveSwaps: async () => {
    return apiCall<Array<{
      id: string;
      seller: string;
      token_amount: number;
      sol_rate: number;
      buyer_rebate: number;
      buyer_role_required: string;
      status: string;
      created_at: string;
    }>>('/user/active_swaps', {
      method: 'GET',
    });
  },

  getMySwaps: async () => {
    return apiCall<Array<{
      id: string;
      token_amount: number;
      sol_rate: number;
      buyer_rebate: number;
      buyer_role_required: string;
      status: string;
      created_at: string;
    }>>('/user/my_swaps', {
      method: 'GET',
    });
  },
};

// Vesting API calls
export const vestingApi = {
  createVesting: async (amount: number, roleType: string) => {
    return apiCall<string>('/user/create_vesting', {
      method: 'POST',
      body: JSON.stringify({ amount, role_type: roleType }),
    });
  },

  withdrawVesting: async () => {
    return apiCall<string>('/user/withdraw_vesting', {
      method: 'POST',
    });
  },

  getVestingInfo: async () => {
    return apiCall<{
      amount: number;
      role_type: string;
      created_at: string;
      withdrawal_available: boolean;
    }>('/user/vesting_info', {
      method: 'GET',
    });
  },
};

// User management API calls
export const userApi = {
  setWalletAddress: async (walletAddress: string) => {
    return apiCall<any>('/user/wallet_address', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
  },

  getMe: async () => {
    return apiCall<any>('/user/me', {
      method: 'GET',
    });
  },

  getProfile: async () => {
    return apiCall<{
      twitter_username: string;
      wallet_address: string;
      latest_claim_timestamp: string | null;
      reward_balance: number;
      tweets: number;
      likes: number;
      replies: number;
    }>('/user/profile', {
      method: 'GET',
    });
  },

  getRewards: async (offset?: number, limit?: number, available?: boolean) => {
    const params = new URLSearchParams();
    if (offset !== undefined) params.append('offset', offset.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (available !== undefined) params.append('available', available.toString());
    
    return apiCall<Array<{
      id: string;
      amount: number;
      available: boolean;
      created_at: string;
    }>>(`/user/rewards${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
    });
  },

  getRewardById: async (rewardId: string) => {
    return apiCall<{
      id: string;
      user_id: string;
      tweet_id: string;
      created_at: string;
      available: boolean;
      message_sent: boolean;
      transaction_signature: string | null;
      reward_amount: number;
      wallet_address: string | null;
      block_time: string | null;
      media_id: string | null;
      media_id_expires_at: string | null;
      phase: string | null;
    }>(`/reward/${rewardId}`, {
      method: 'GET',
    });
  },

  getTweets: async (offset?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (offset !== undefined) params.append('offset', offset.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    return apiCall<Array<{
      id: string;
      content: string;
      created_at: string;
      mining_phase: string;
    }>>(`/user/tweets${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
    });
  },
};

const apiService = {
  roleApi,
  tokenApi,
  patronApi,
  otcApi,
  vestingApi,
  userApi,
};

export default apiService;
