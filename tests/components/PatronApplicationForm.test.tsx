import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PatronApplicationForm } from '../../components/PatronApplicationForm';
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
    applyForPatronWithSync: jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    })
  }))
}));

describe('PatronApplicationForm', () => {
  const defaultProps = {
    userId: 'test-user-123',
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders application form', () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    expect(screen.getByText('Apply for Patron Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Wallet Age (days) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Community Score *')).toBeInTheDocument();
    expect(screen.getByLabelText('Commitment Statement')).toBeInTheDocument();
  });

  it('displays patron requirements', () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    expect(screen.getByText('Patron Requirements:')).toBeInTheDocument();
    expect(screen.getByText('Wallet age: minimum 90 days')).toBeInTheDocument();
    expect(screen.getByText('Community score: minimum 50 points')).toBeInTheDocument();
    expect(screen.getByText('Active participation in platform activities')).toBeInTheDocument();
    expect(screen.getByText('Commitment to long-term engagement')).toBeInTheDocument();
  });

  it('shows validation error for insufficient wallet age', async () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with insufficient wallet age
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '30' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '60' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Wallet must be at least 90 days old to apply for Patron status')).toBeInTheDocument();
    });
  });

  it('shows validation error for insufficient community score', async () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with insufficient community score
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '30' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Community score must be at least 50 to apply for Patron status')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid input', async () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with invalid input
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: 'invalid' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: 'invalid' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Please enter valid numbers for wallet age and community score')).toBeInTheDocument();
    });
  });

  it('submits application with valid data', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    const mockApply = jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'mock-tx-id'
    });

    mockService.mockImplementation(() => ({
      applyForPatronWithSync: mockApply
    }));

    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '75' }
    });
    fireEvent.change(screen.getByLabelText('Commitment Statement'), {
      target: { value: 'I am committed to the Snake AI community' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(120, 75);
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission failure', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    const mockApply = jest.fn().mockResolvedValue({
      success: false,
      error: 'Application failed'
    });

    mockService.mockImplementation(() => ({
      applyForPatronWithSync: mockApply
    }));

    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '75' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Application failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const mockService = require('../../lib/patron-framework-service').PatronFrameworkService;
    let resolvePromise: (value: any) => void;
    const mockApply = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve;
      });
    });

    mockService.mockImplementation(() => ({
      applyForPatronWithSync: mockApply
    }));

    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '75' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    // Check loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(screen.getByText('Submitting...')).toBeDisabled();

    // Resolve the promise
    resolvePromise!({ success: true, transactionId: 'mock-tx-id' });

    await waitFor(() => {
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    const propsWithoutCancel = {
      userId: 'test-user-123',
      onSuccess: jest.fn()
    };

    render(
      <WalletProvider>
        <PatronApplicationForm {...propsWithoutCancel} />
      </WalletProvider>
    );

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('handles wallet not connected error', async () => {
    // Mock wallet not connected
    const mockUseWallet = jest.fn(() => ({
      publicKey: null,
      connected: false
    }));

    jest.doMock('@solana/wallet-adapter-react', () => ({
      useConnection: () => ({ connection: {} }),
      useWallet: mockUseWallet
    }));

    render(
      <WalletProvider>
        <PatronApplicationForm {...defaultProps} />
      </WalletProvider>
    );

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Wallet Age (days) *'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Community Score *'), {
      target: { value: '75' }
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    });
  });
});
