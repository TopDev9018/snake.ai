import React, { useState, useEffect } from 'react';
import { UserRole } from '../index';
import { tokenApi } from '../services/apiService';
import { useToast } from '../../../contexts/ToastContext';
import { useWalletContext } from '../../../contexts/WalletContext';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_RPC_URL, TOKEN_MINT } from '../../../config/program';

interface TokenManagementProps {
    userRole: UserRole;
}

interface TokenInfo {
    balance: number;
    locked: number;
    staked: number;
    rewards: number;
    lockEndDate?: Date;
}

function TokenManagement({ userRole }: TokenManagementProps) {
    const { showSuccess, showError, showInfo } = useToast();
    const { publicKey, connected } = useWalletContext();
    
    // Create connection with proper configuration and fallback RPC
    const getRpcUrl = () => {
        const primaryRpc = SOLANA_RPC_URL;
        
        console.log('🔗 Primary RPC URL:', primaryRpc);
        console.log('💡 If you experience connection issues, try these alternatives:');
        console.log('   - Helius: https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY');
        console.log('   - Alchemy: https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY');
        console.log('   - QuickNode: https://your-endpoint.solana-devnet.quiknode.pro/YOUR_TOKEN/');
        
        return primaryRpc;
    };

    const connection = new Connection(getRpcUrl(), {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 120000, // Increase timeout to 2 minutes
        disableRetryOnRateLimit: false,
    });
    
    // Debug: Log the RPC URL being used and test connectivity
    console.log('🔗 Using Solana RPC URL:', SOLANA_RPC_URL);
    console.log('🪙 Using Token Mint:', TOKEN_MINT.toString());
    
    // Test RPC connectivity on component mount
    React.useEffect(() => {
        const testRpcConnection = async () => {
            try {
                console.log('🧪 Testing RPC connection...');
                const version = await connection.getVersion();
                console.log('✅ RPC connection successful. Solana version:', version);
            } catch (error) {
                console.error('❌ RPC connection test failed:', error);
                console.warn('⚠️ This may cause issues with token operations');
            }
        };
        
        if (connected) {
            testRpcConnection();
        }
    }, [connected]);
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
        balance: 0,
        locked: 0,
        staked: 0,
        rewards: 0
    });
    const [lockAmount, setLockAmount] = useState('');
    const [lockPeriod, setLockPeriod] = useState(3); // Default 3 months
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [showBalanceWarning, setShowBalanceWarning] = useState(false);

    useEffect(() => {
        fetchTokenInfo();
    }, []);

    const fetchTokenInfo = async () => {
        setLoading(true);
        try {
            const response = await tokenApi.getTokenInfo();
            if (response.success && response.data) {
                setTokenInfo({
                    balance: response.data.balance,
                    locked: response.data.locked || 0,
                    staked: response.data.staked || 0,
                    rewards: response.data.rewards || 0,
                    lockEndDate: response.data.lockEndDate ? new Date(response.data.lockEndDate) : undefined
                });
            } else {
                throw new Error(response.error || 'Failed to fetch token info');
            }
        } catch (error) {
            console.error('Failed to fetch token info:', error);
            showError('Failed to fetch token information');
        } finally {
            setLoading(false);
        }
    };

    // Validate wallet balance
    const validateLockAmount = (amount: string) => {
        const numAmount = Number(amount);
        if (numAmount > tokenInfo.balance) {
            setShowBalanceWarning(true);
            return false;
        } else {
            setShowBalanceWarning(false);
            return true;
        }
    };

    const handleLockAmountChange = (value: string) => {
        setLockAmount(value);
        if (value) {
            validateLockAmount(value);
        } else {
            setShowBalanceWarning(false);
        }
    };

    const handleLockTokens = async () => {
        const numAmount = Number(lockAmount);

        // Check if wallet is connected
        if (!connected || !publicKey) {
            showError('Please connect your wallet first');
            return;
        }

        // Validation checks
        if (!lockAmount || numAmount <= 0) {
            showError('Please enter a valid amount to lock');
            return;
        }

        if (numAmount > tokenInfo.balance) {
            showError(`Insufficient balance. You have ${tokenInfo.balance.toLocaleString()} tokens available.`);
            return;
        }

        if (numAmount < 100) {
            showError('Minimum lock amount is 100 tokens');
            return;
        }

        setLoading(true);
        setActiveAction('lock');
        showInfo(`Preparing transaction to lock ${numAmount.toLocaleString()} tokens for ${lockPeriod} months...`);

        try {
            // Step 1: Check user's token account before proceeding
            showInfo('Checking your token account...');
            const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, new PublicKey(publicKey));
            console.log('🏦 User token account:', userTokenAccount.toString());
            
            try {
                // Add retry logic for RPC calls
                const getAccountInfoWithRetry = async (retries = 3) => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            console.log(`🔄 Attempt ${i + 1}/${retries} to fetch account info...`);
                            const accountInfo = await connection.getAccountInfo(userTokenAccount);
                            return accountInfo;
                        } catch (error) {
                            console.warn(`⚠️ Attempt ${i + 1} failed:`, error);
                            if (i === retries - 1) throw error;
                            // Wait before retry
                            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                        }
                    }
                };

                const accountInfo = await getAccountInfoWithRetry();
                if (!accountInfo) {
                    throw new Error(`You don't have a SNAKE token account yet.\n\nTo get SNAKE tokens:\n1. Make sure the SNAKE token is deployed (check TOKEN_MINT in config)\n2. Get SNAKE tokens from the project admin\n3. Or mint some if you have permissions`);
                }
                
                console.log('✅ Account found, checking balance...');
                const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
                const actualBalance = tokenBalance.value.uiAmount || 0;
                console.log('💰 Current token balance:', actualBalance);
                
                if (actualBalance < numAmount) {
                    throw new Error(`Insufficient SNAKE tokens. You have ${actualBalance} tokens but trying to lock ${numAmount} tokens.`);
                }
                
                if (actualBalance === 0) {
                    throw new Error('You have 0 SNAKE tokens in your wallet. Please get SNAKE tokens before attempting to lock.');
                }
                
                showInfo('Token account verified. Creating lock transaction...');
            } catch (accountError) {
                console.error('❌ Token account check failed:', accountError);
                
                // Provide more helpful error messages
                if (accountError instanceof Error) {
                    if (accountError.message.includes('Failed to fetch')) {
                        throw new Error('Network connection error. Please check your internet connection and try again. If the problem persists, the Solana network might be experiencing issues.');
                    }
                    if (accountError.message.includes('503') || accountError.message.includes('502')) {
                        throw new Error('Solana RPC server is temporarily unavailable. Please try again in a few moments.');
                    }
                }
                throw accountError;
            }
            
            // Step 2: Try to get the lock transaction from backend
            let result = await tokenApi.lockTokens(
                numAmount * 1000000000, // Convert to lamports
                lockPeriod
            );

            // Step 3: Check if we need to initialize user claim account first
            if (!result.success && result.error && result.error.includes('AccountNotFound')) {
                console.log('🔧 User claim account not found, initializing...');
                showInfo('Setting up your account for the first time...');
                
                try {
                    const initResult = await tokenApi.initializeUserClaim();
                    
                    if (initResult.success && initResult.data) {
                        showInfo('Please approve the account setup transaction in your wallet...');
                        
                        // Decode and sign the initialization transaction
                        const initTxBytes = Uint8Array.from(atob(initResult.data), c => c.charCodeAt(0));
                        const initTransaction = Transaction.from(initTxBytes);
                        
                        // Update with fresh blockhash
                        const { blockhash } = await connection.getLatestBlockhash('confirmed');
                        initTransaction.recentBlockhash = blockhash;
                        initTransaction.feePayer = new PublicKey(publicKey);
                        
                        // Sign and send initialization transaction
                        if (typeof window !== 'undefined' && (window as any).solana) {
                            const signedInitTx = await (window as any).solana.signTransaction(initTransaction);
                            
                            showInfo('Submitting account setup transaction...');
                            const initSignature = await connection.sendRawTransaction(signedInitTx.serialize(), {
                                skipPreflight: false,
                                preflightCommitment: 'confirmed'
                            });
                            
                            showInfo('Waiting for account setup confirmation...');
                            await connection.confirmTransaction({
                                signature: initSignature,
                                blockhash: initTransaction.recentBlockhash!,
                                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
                            }, 'confirmed');
                            
                            console.log('✅ User claim account initialized successfully');
                            showInfo('Account setup complete. Proceeding with token lock...');
                            
                            // Retry the lock transaction now that account is initialized
                            result = await tokenApi.lockTokens(
                                numAmount * 1000000000, // Convert to lamports
                                lockPeriod
                            );
                        } else {
                            throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
                        }
                    } else {
                        throw new Error(`Failed to initialize user claim account: ${initResult.error}`);
                    }
                } catch (initError) {
                    console.error('❌ Failed to initialize user claim account:', initError);
                    throw new Error(`Failed to set up your account: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
                }
            }

            if (result.success && result.data) {
                // Check if this requires wallet signature
                if ('requiresWalletSignature' in result && result.requiresWalletSignature) {
                    showInfo('Please approve the transaction in your wallet...');
                    
                    // Step 3: Decode the base64 transaction (using Uint8Array instead of Buffer)
                    const transactionBytes = Uint8Array.from(atob(result.data), c => c.charCodeAt(0));
                    const transaction = Transaction.from(transactionBytes);
                    
                    console.log('🔍 Transaction decoded successfully. Fee payer:', transaction.feePayer?.toString());
                    console.log('🔍 Original blockhash:', transaction.recentBlockhash);
                    
                    // Step 4: Update with fresh blockhash (backend blockhash may have expired)
                    showInfo('Getting fresh blockhash for transaction...');
                    try {
                        const getBlockhashWithRetry = async (retries = 3) => {
                            for (let i = 0; i < retries; i++) {
                                try {
                                    console.log(`🔄 Attempt ${i + 1}/${retries} to get blockhash...`);
                                    return await connection.getLatestBlockhash('confirmed');
                                } catch (error) {
                                    console.warn(`⚠️ Blockhash attempt ${i + 1} failed:`, error);
                                    if (i === retries - 1) throw error;
                                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                                }
                            }
                            throw new Error('Failed to get blockhash after retries');
                        };

                        const { blockhash } = await getBlockhashWithRetry();
                        transaction.recentBlockhash = blockhash;
                        transaction.feePayer = new PublicKey(publicKey);
                        console.log('🔍 Updated with fresh blockhash:', blockhash);
                    } catch (rpcError) {
                        console.error('❌ RPC Connection Error:', rpcError);
                        console.error('🔗 Attempted RPC URL:', SOLANA_RPC_URL);
                        
                        if (rpcError instanceof Error && rpcError.message.includes('Failed to fetch')) {
                            throw new Error(`Network connection error while getting transaction data. Please check your internet connection and try again.`);
                        }
                        throw new Error(`Failed to connect to Solana network. Please check your internet connection and try again.`);
                    }
                    
                    // Step 5: Sign and send transaction using Phantom wallet
                    if (typeof window !== 'undefined' && (window as any).solana) {
                        showInfo('Please approve the transaction in your Phantom wallet...');
                        
                        try {
                            const signedTransaction = await (window as any).solana.signTransaction(transaction);
                            console.log('✅ Transaction signed by wallet');
                            
                            showInfo('Submitting transaction to blockchain...');
                            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                                skipPreflight: false,
                                preflightCommitment: 'confirmed'
                            });
                            console.log('📤 Transaction submitted with signature:', signature);
                            
                            showInfo('Waiting for blockchain confirmation...');
                            await connection.confirmTransaction({
                                signature,
                                blockhash: transaction.recentBlockhash!,
                                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
                            }, 'confirmed');
                            
                            console.log('✅ Transaction confirmed on blockchain');
                        } catch (txError) {
                            console.error('❌ Transaction Error:', txError);
                            if (txError instanceof Error && txError.message.includes('User rejected')) {
                                throw new Error('Transaction cancelled by user');
                            }
                            throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
                        }
                    } else {
                        throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
                    }
                    
                    showSuccess(
                        `Successfully locked ${numAmount.toLocaleString()} tokens for ${lockPeriod} months!`
                    );
                    setLockAmount('');
                    setShowBalanceWarning(false);
                    fetchTokenInfo(); // Refresh token info
                } else {
                    // Old behavior for non-transaction responses
                    showSuccess(
                        `Successfully locked ${numAmount.toLocaleString()} tokens for ${lockPeriod} months!`
                    );
                    setLockAmount('');
                    setShowBalanceWarning(false);
                    fetchTokenInfo();
                }
            } else {
                throw new Error('error' in result ? result.error : 'Failed to lock tokens');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to lock tokens';
            showError(errorMessage);
            console.error('Error locking tokens:', error);
        } finally {
            setLoading(false);
            setActiveAction(null);
        }
    };

    const handleUnlockTokens = async () => {
        setLoading(true);
        setActiveAction('unlock');
        showInfo('Processing unlock tokens transaction...');

        try {
            const result = await tokenApi.unlockTokens();

            if (result.success) {
                showSuccess('Successfully unlocked tokens!');
                fetchTokenInfo(); // Refresh token info
            } else {
                throw new Error(result.error || 'Failed to unlock tokens');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unlock tokens';
            showError(errorMessage);
            console.error('Error unlocking tokens:', error);
        } finally {
            setLoading(false);
            setActiveAction(null);
        }
    };

    const handleClaimRewards = async () => {
        setLoading(true);
        setActiveAction('claim');
        showInfo('Processing claim rewards transaction...');

        try {
            const result = await tokenApi.claimYield();

            if (result.success) {
                showSuccess(`Successfully claimed ${tokenInfo.rewards.toLocaleString()} SNAKE tokens!`);
                fetchTokenInfo(); // Refresh token info
            } else {
                throw new Error(result.error || 'Failed to claim rewards');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to claim rewards';
            showError(errorMessage);
            console.error('Error claiming rewards:', error);
        } finally {
            setLoading(false);
            setActiveAction(null);
        }
    };

    const isLockPeriodActive = tokenInfo.lockEndDate && tokenInfo.lockEndDate > new Date();
    const canUnlock = !isLockPeriodActive && tokenInfo.locked > 0;

    return (
        <div className="w-100">

            {/* Token Overview */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h5 className="card-title text-primary">Available Balance</h5>
                            <div className="fs-3">{tokenInfo.balance.toLocaleString()}</div>
                            <small className="text-muted">SNAKE Tokens</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <h5 className="card-title text-warning">Locked Tokens</h5>
                            <div className="fs-3">{tokenInfo.locked.toLocaleString()}</div>
                            <small className="text-muted">SNAKE Tokens</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h5 className="card-title text-success">Staked Tokens</h5>
                            <div className="fs-3">{tokenInfo.staked.toLocaleString()}</div>
                            <small className="text-muted">SNAKE Tokens</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <h5 className="card-title text-info">Pending Rewards</h5>
                            <div className="fs-3">{tokenInfo.rewards.toLocaleString()}</div>
                            <small className="text-muted">SNAKE Tokens</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lock Status */}
            {tokenInfo.lockEndDate && (
                <div className="alert alert-info mb-4">
                    <strong>Lock Status:</strong>
                    {isLockPeriodActive ? (
                        <>
                            Tokens are locked until {tokenInfo.lockEndDate.toLocaleDateString()}
                            <div className="mt-2">
                                <small>
                                    Time remaining: {Math.ceil((tokenInfo.lockEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </small>
                            </div>
                        </>
                    ) : (
                        'Lock period has ended. You can now unlock your tokens.'
                    )}
                </div>
            )}

            {/* Token Actions */}
            <div className="row g-4">
                {/* Lock Tokens */}
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">🔒 Lock Tokens</h5>
                            <p className="card-text">Lock tokens to earn staking rewards based on your role.</p>

                            <div className="mb-3">
                                <label className="form-label">Amount to Lock</label>
                                <input
                                    type="number"
                                    className={`form-control ${showBalanceWarning ? 'is-invalid' : ''}`}
                                    placeholder="Enter amount (min. 100 tokens)"
                                    value={lockAmount}
                                    onChange={(e) => handleLockAmountChange(e.target.value)}
                                    disabled={loading}
                                    max={tokenInfo.balance}
                                    min="100"
                                />
                                {showBalanceWarning && (
                                    <div className="invalid-feedback">
                                        ⚠️ Insufficient balance! You have {tokenInfo.balance.toLocaleString()} tokens available.
                                    </div>
                                )}
                                <div className="text-muted small mt-1">
                                    Available: {tokenInfo.balance.toLocaleString()} SNAKE tokens
                                </div>

                                {/* Quick Amount Selection */}
                                <div className="mt-2">
                                    <small className="text-muted">Quick select:</small>
                                    <div className="btn-group btn-group-sm mt-1" role="group">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => handleLockAmountChange(Math.floor(tokenInfo.balance * 0.25).toString())}
                                            disabled={loading || tokenInfo.balance < 100}
                                        >
                                            25%
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => handleLockAmountChange(Math.floor(tokenInfo.balance * 0.5).toString())}
                                            disabled={loading || tokenInfo.balance < 100}
                                        >
                                            50%
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => handleLockAmountChange(Math.floor(tokenInfo.balance * 0.75).toString())}
                                            disabled={loading || tokenInfo.balance < 100}
                                        >
                                            75%
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => handleLockAmountChange(tokenInfo.balance.toString())}
                                            disabled={loading || tokenInfo.balance < 100}
                                        >
                                            Max
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Lock Period</label>
                                <select
                                    className="form-select"
                                    value={lockPeriod}
                                    onChange={(e) => setLockPeriod(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    <option value={3}>3 months (Staker minimum)</option>
                                    <option value={6}>6 months (Patron minimum)</option>
                                    <option value={12}>12 months (Maximum rewards)</option>
                                    <option value={24}>24 months (Premium tier)</option>
                                </select>
                                <div className="text-muted small mt-1">
                                    Longer periods may offer higher APY rates
                                </div>
                            </div>

                            {/* Lock Summary */}
                            {lockAmount && Number(lockAmount) > 0 && !showBalanceWarning && (
                                <div className="alert alert-info mb-3">
                                    <div className="row">
                                        <div className="col-6">
                                            <strong>Amount:</strong><br />
                                            <span className="text-primary">{Number(lockAmount).toLocaleString()} SNAKE</span>
                                        </div>
                                        <div className="col-6">
                                            <strong>Duration:</strong><br />
                                            <span className="text-warning">{lockPeriod} months</span>
                                        </div>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="row">
                                        <div className="col-6">
                                            <strong>Unlock Date:</strong><br />
                                            <span className="text-success">
                                                {new Date(Date.now() + lockPeriod * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <strong>Est. APY:</strong><br />
                                            <span className="text-info">{lockPeriod >= 12 ? '8%' : lockPeriod >= 6 ? '6%' : '5%'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-primary w-100"
                                onClick={handleLockTokens}
                                disabled={loading || !lockAmount || Number(lockAmount) <= 0 || showBalanceWarning || Number(lockAmount) < 100}
                            >
                                {loading && activeAction === 'lock' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Locking...
                                    </>
                                ) : (
                                    'Lock Tokens'
                                )}
                            </button>

                            <div className="mt-2">
                                <small className="text-muted d-block">
                                    🔒 Tokens will be locked for {lockPeriod} months
                                </small>
                                <small className="text-warning d-block">
                                    ⚠️ Locked tokens cannot be withdrawn until the period ends
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unlock Tokens */}
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">🔓 Unlock Tokens</h5>
                            <p className="card-text">Unlock tokens after the lock period has ended.</p>

                            <div className="mb-3">
                                <div className="alert alert-secondary">
                                    Locked Amount: <strong>{tokenInfo.locked.toLocaleString()} SNAKE</strong>
                                </div>
                            </div>

                            <button
                                className="btn btn-warning w-100"
                                onClick={handleUnlockTokens}
                                disabled={loading || !canUnlock}
                            >
                                {loading && activeAction === 'unlock' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Unlocking...
                                    </>
                                ) : (
                                    'Unlock Tokens'
                                )}
                            </button>

                            <small className="text-muted mt-2 d-block">
                                {!canUnlock && isLockPeriodActive && 'Tokens are still locked'}
                                {!canUnlock && !isLockPeriodActive && 'No tokens to unlock'}
                            </small>
                        </div>
                    </div>
                </div>

                {/* Claim Rewards */}
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">🎁 Claim Rewards</h5>
                            <p className="card-text">Claim your staking rewards and yield.</p>

                            <div className="mb-3">
                                <div className="alert alert-success">
                                    Available Rewards: <strong>{tokenInfo.rewards.toLocaleString()} SNAKE</strong>
                                </div>
                            </div>

                            <button
                                className="btn btn-success w-100"
                                onClick={handleClaimRewards}
                                disabled={loading || tokenInfo.rewards <= 0}
                            >
                                {loading && activeAction === 'claim' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Claiming...
                                    </>
                                ) : (
                                    'Claim Rewards'
                                )}
                            </button>

                            <small className="text-muted mt-2 d-block">
                                APY: 5% for {userRole.role} role
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Panel */}
            <div className="mt-4">
                <div className="card border-info">
                    <div className="card-body">
                        <h6 className="card-title">📊 Staking Information</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <ul className="mb-0">
                                    <li>Staking APY: 5% annually</li>
                                    <li>Rewards calculated daily</li>
                                    <li>Rewards can be claimed anytime</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <ul className="mb-0">
                                    <li>Lock periods are enforced on-chain</li>
                                    <li>Early unlock may incur penalties</li>
                                    <li>Higher roles earn additional benefits</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokenManagement;
