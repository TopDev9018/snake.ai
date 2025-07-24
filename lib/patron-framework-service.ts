import { Connection } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SmartContractService, UserClaim } from './smart-contract';
import { apiClient } from './api-client';
import { UserRole } from '@/types/roles';

export interface PatronFrameworkData {
  userClaim: UserClaim | null;
  miningStatus: {
    phase1_mining_count: number;
    phase2_mining_count: number;
    total_mining_count: number;
    current_phase: 'Phase1' | 'Phase2';
    phase2_start_date: string;
    wallet_address?: string;
  } | null;
  userProfile: {
    id: string;
    username: string;
    wallet_address?: string;
    patron_status?: 'none' | 'applied' | 'approved' | 'rejected';
    selected_role?: 'none' | 'staker' | 'patron';
    lock_duration_months?: number;
    locked_amount?: number;
    patron_qualification_score?: number;
    wallet_age_days?: number;
    community_score?: number;
    created_at: string;
    updated_at: string;
  } | null;
}

export class PatronFrameworkService {
  private smartContractService: SmartContractService;
  private userId: string;

  constructor(
    connection: Connection,
    wallet: WalletContextState,
    userId: string
  ) {
    this.smartContractService = new SmartContractService(connection, wallet);
    this.userId = userId;
  }

  async getPatronFrameworkData(): Promise<PatronFrameworkData> {
    try {
      const [userClaim, miningStatusResponse, userProfileResponse] = await Promise.all([
        this.smartContractService.getUserClaim(),
        apiClient.getMiningStatus(this.userId),
        apiClient.getUserProfile(this.userId)
      ]);

      return {
        userClaim,
        miningStatus: miningStatusResponse.error ? null : miningStatusResponse.data,
        userProfile: userProfileResponse.error ? null : userProfileResponse.data
      };
    } catch (error) {
      console.error('Error fetching patron framework data:', error);
      return {
        userClaim: null,
        miningStatus: null,
        userProfile: null
      };
    }
  }

  async initializeUserClaim(): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const transactionId = await this.smartContractService.initializeUserClaim();
      return { success: true, transactionId };
    } catch (error) {
      console.error('Error initializing user claim:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async selectRoleWithSync(role: UserRole): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // First update the smart contract
      const transactionId = await this.smartContractService.selectRole(role);
      
      // Then sync with backend
      const backendResponse = await apiClient.updateUserRole(this.userId, role);
      
      if (backendResponse.error) {
        console.warn('Backend sync failed after smart contract update:', backendResponse.error);
        // Don't fail the whole operation since smart contract succeeded
      }

      return { success: true, transactionId };
    } catch (error) {
      console.error('Error selecting role:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async claimTokensWithRole(
    amount: number, 
    role: UserRole
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const transactionId = await this.smartContractService.claimTokensWithRole(amount, role);
      
      // Update backend with the claim
      const backendResponse = await apiClient.updateUserRole(this.userId, role);
      
      if (backendResponse.error) {
        console.warn('Backend sync failed after token claim:', backendResponse.error);
      }

      return { success: true, transactionId };
    } catch (error) {
      console.error('Error claiming tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async applyForPatronWithSync(
    walletAgeDays: number, 
    communityScore: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // First update the smart contract
      const transactionId = await this.smartContractService.applyForPatron(walletAgeDays, communityScore);
      
      // Then sync with backend
      const backendResponse = await apiClient.updatePatronStatus(this.userId, 'applied');
      
      if (backendResponse.error) {
        console.warn('Backend sync failed after patron application:', backendResponse.error);
      }

      return { success: true, transactionId };
    } catch (error) {
      console.error('Error applying for patron:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async syncWalletAddress(walletAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.setWalletAddress(this.userId, walletAddress);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing wallet address:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async calculateRewardAmount(miningData: {
    phase1_mining_count: number;
    phase2_mining_count: number;
    current_phase: 'Phase1' | 'Phase2';
  }): Promise<number> {
    // Phase 1: 1 SNAKE per tweet
    // Phase 2: 2 SNAKE per tweet (increased rewards)
    const phase1Rewards = miningData.phase1_mining_count * 1;
    const phase2Rewards = miningData.phase2_mining_count * 2;
    
    return phase1Rewards + phase2Rewards;
  }

  async getRecommendedRole(userProfile: {
    patron_qualification_score?: number;
    wallet_age_days?: number;
    community_score?: number;
  }, miningData: {
    total_mining_count: number;
  }): Promise<UserRole> {
    // Basic recommendation logic
    const qualificationScore = userProfile.patron_qualification_score || 0;
    const walletAge = userProfile.wallet_age_days || 0;
    const communityScore = userProfile.community_score || 0;
    const totalMining = miningData.total_mining_count;

    // Patron criteria: high qualification score, old wallet, active community participation
    if (qualificationScore >= 75 && walletAge >= 90 && communityScore >= 50 && totalMining >= 100) {
      return 'patron';
    }

    // Staker criteria: moderate activity and engagement
    if (totalMining >= 20 && walletAge >= 30) {
      return 'staker';
    }

    return 'none';
  }
}
