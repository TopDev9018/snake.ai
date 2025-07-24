import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClaimInterface } from '../../components/ClaimInterface';
import { WalletProvider } from '../../components/WalletProvider';

// Mock the Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({
    connection: {
      // Mock connection object
    }
  }),
  useWallet: () => ({
    publicKey: {
      toString: () => '11111111111111111111111111111111'
    },
    connected: true
  })
}));

// Mock the patron framework service
jest.mock('../../lib/patron-framework-service', () => ({
  PatronFrameworkService: jest.fn().mockImplementation(() => ({
    getPatronFrameworkData: jest.fn().mockResolvedValue({
      userClaim: {
        initialized: true,
        role: 'staker',
        totalMinedPhase1: { toNumber: () => 50 },
        totalMinedPhase2: { toNumber: () => 25 }
      },
      miningStatus: {
        phase1_mining_count: 50,
        phase2_mining_count: 25,
        total_mining_count: 75,
        current_phase: 'Phase2',
        phase2_start_date: '2024-01-01T00:00:00Z'
      },
      userProfile: {
        id: 'test-user',
        username: 'testuser',
        wallet_address: '11111111111111111111111111111111',
        selected_role: 'staker',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    }),
    calculateRewardAmount: jest.fn().mockResolvedValue(100),
    initializeUserClaim: jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    }),
    selectRoleWithSync: jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    }),
    claimTokensWithRole: jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    }),
    syncWalletAddress: jest.fn().mockResolvedValue({
      success: true
    })
  }))
}));

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('ClaimInterface', () => {
  const defaultProps = {
    userId: 'test-user-123',
    selectedRole: 'staker' as const,
    userWallet: '11111111111111111111111111111111'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays claim summary after loading', async () => {
    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Claim Summary')).toBeInTheDocument();
    });

    expect(screen.getByText('100 SNAKE')).toBeInTheDocument();
    expect(screen.getByText('Phase2')).toBeInTheDocument();
    expect(screen.getByText('Staker')).toBeInTheDocument();
  });

  it('shows mining statistics', async () => {
    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('50 tweets')).toBeInTheDocument(); // Phase 1
      expect(screen.getByText('25 tweets')).toBeInTheDocument(); // Phase 2
      expect(screen.getByText('75 tweets')).toBeInTheDocument(); // Total
    });
  });

  it('displays role benefits', async () => {
    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Role Benefits')).toBeInTheDocument();
    });

    expect(screen.getByText('5% staking rewards')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
    expect(screen.getByText('Lock Period: 3 months')).toBeInTheDocument();
  });

  it('shows initialize button when user claim is not initialized', async () => {
    // Mock uninitialized user claim
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    mockService.mockImplementation(() => ({
      getPatronFrameworkData: jest.fn().mockResolvedValue({
        userClaim: {
          initialized: false,
          role: 'none',
          totalMinedPhase1: { toNumber: () => 0 },
          totalMinedPhase2: { toNumber: () => 0 }
        },
        miningStatus: {
          phase1_mining_count: 50,
          phase2_mining_count: 25,
          total_mining_count: 75,
          current_phase: 'Phase2',
          phase2_start_date: '2024-01-01T00:00:00Z'
        }
      }),
      calculateRewardAmount: jest.fn().mockResolvedValue(100),
      initializeUserClaim: jest.fn().mockResolvedValue({
        success: true,
        transactionId: 'mock-tx-id'
      })
    }));

    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Initialize Claim Account')).toBeInTheDocument();
    });
  });

  it('handles initialize button click', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    const mockInitialize = jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    });

    mockService.mockImplementation(() => ({
      getPatronFrameworkData: jest.fn().mockResolvedValue({
        userClaim: {
          initialized: false,
          role: 'none',
          totalMinedPhase1: { toNumber: () => 0 },
          totalMinedPhase2: { toNumber: () => 0 }
        },
        miningStatus: {
          phase1_mining_count: 50,
          phase2_mining_count: 25,
          total_mining_count: 75,
          current_phase: 'Phase2',
          phase2_start_date: '2024-01-01T00:00:00Z'
        }
      }),
      calculateRewardAmount: jest.fn().mockResolvedValue(100),
      initializeUserClaim: mockInitialize,
      syncWalletAddress: jest.fn().mockResolvedValue({ success: true })
    }));

    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Initialize Claim Account')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Initialize Claim Account'));

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });
  });

  it('handles claim button click', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    const mockClaim = jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    });

    mockService.mockImplementation(() => ({
      getPatronFrameworkData: jest.fn().mockResolvedValue({
        userClaim: {
          initialized: true,
          role: 'staker',
          totalMinedPhase1: { toNumber: () => 50 },
          totalMinedPhase2: { toNumber: () => 25 }
        },
        miningStatus: {
          phase1_mining_count: 50,
          phase2_mining_count: 25,
          total_mining_count: 75,
          current_phase: 'Phase2',
          phase2_start_date: '2024-01-01T00:00:00Z'
        }
      }),
      calculateRewardAmount: jest.fn().mockResolvedValue(100),
      claimTokensWithRole: mockClaim
    }));

    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Claim 100 SNAKE Tokens')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Claim 100 SNAKE Tokens'));

    await waitFor(() => {
      expect(mockClaim).toHaveBeenCalledWith(100, 'staker');
    });
  });

  it('displays error message on failure', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    
    mockService.mockImplementation(() => ({
      getPatronFrameworkData: jest.fn().mockRejectedValue(new Error('Network error')),
      calculateRewardAmount: jest.fn().mockResolvedValue(100)
    }));

    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch claim data')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows claimed successfully state', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    
    mockService.mockImplementation(() => ({
      getPatronFrameworkData: jest.fn().mockResolvedValue({
        userClaim: {
          initialized: true,
          role: 'staker',
          totalMinedPhase1: { toNumber: () => 50 },
          totalMinedPhase2: { toNumber: () => 25 }
        },
        miningStatus: {
          phase1_mining_count: 50,
          phase2_mining_count: 25,
          total_mining_count: 75,
          current_phase: 'Phase2',
          phase2_start_date: '2024-01-01T00:00:00Z'
        }
      }),
      calculateRewardAmount: jest.fn().mockResolvedValue(100),
      claimTokensWithRole: jest.fn().mockResolvedValue({
        success: true,
        transactionId: 'mock-tx-id'
      })
    }));

    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Claim 100 SNAKE Tokens')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Claim 100 SNAKE Tokens'));

    await waitFor(() => {
      expect(screen.getByText('Claimed Successfully!')).toBeInTheDocument();
    });
  });

  it('displays important notes', async () => {
    render(
      <WalletProvider>
        <ClaimInterface {...defaultProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Important Notes:')).toBeInTheDocument();
    });

    expect(screen.getByText('Role changes will affect your token lock period')).toBeInTheDocument();
    expect(screen.getByText('Staker and Patron roles require token commitment')).toBeInTheDocument();
    expect(screen.getByText('Patron status requires application and approval')).toBeInTheDocument();
    expect(screen.getByText('Locked tokens earn additional rewards')).toBeInTheDocument();
  });

  it('handles different user roles correctly', async () => {
    const patronProps = {
      ...defaultProps,
      selectedRole: 'patron' as const
    };

    render(
      <WalletProvider>
        <ClaimInterface {...patronProps} />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Patron')).toBeInTheDocument();
    });

    expect(screen.getByText('10% enhanced rewards')).toBeInTheDocument();
    expect(screen.getByText('Governance voting')).toBeInTheDocument();
    expect(screen.getByText('Lock Period: 6 months')).toBeInTheDocument();
  });
});
