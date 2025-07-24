import React, { useState, useEffect } from 'react';
import { UserRole } from '../index';
import { roleApi, tokenApi, userApi } from '../services/apiService';
import { useToast } from '../../../contexts/ToastContext';
import { useAppContext } from '../../../contexts/AppContext';

interface RoleSelectionProps {
    userRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

interface TokenBalance {
    balance: number;
    locked: number;
    staked: number;
    rewards: number;
}

interface UserStats {
    total_mined_phase1: number;
    wallet_age_days: number;
    community_score: number;
    patron_qualification_score: number;
}

function RoleSelection({ userRole, onRoleChange }: RoleSelectionProps) {
    const { showSuccess, showError, showInfo, showWarning } = useToast();
    const { updateUserRole } = useAppContext();
    const [selectedRole, setSelectedRole] = useState<'none' | 'staker' | 'patron'>(userRole.role);
    const [loading, setLoading] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<TokenBalance>({ balance: 0, locked: 0, staked: 0, rewards: 0 });
    const [userStats, setUserStats] = useState<UserStats>({
        total_mined_phase1: 0,
        wallet_age_days: 0,
        community_score: 0,
        patron_qualification_score: 0
    });

    // Constants from smart contract
    const MINIMUM_STAKER_TOKENS = 500; // 500 SNAKE tokens (STAKE_AMOUNT)
    const MINIMUM_PATRON_QUALIFICATION_SCORE = 50; // Minimum score needed
    const MINIMUM_PATRON_MINED_TOKENS = 100; // 100 SNAKE tokens minimum mined in Phase 1

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Fetch token balance
            const tokenResponse = await tokenApi.getTokenInfo();
            if (tokenResponse.success && tokenResponse.data) {
                setTokenBalance({
                    balance: tokenResponse.data.balance || 0,
                    locked: tokenResponse.data.locked || 0,
                    staked: tokenResponse.data.staked || 0,
                    rewards: tokenResponse.data.rewards || 0,
                });
            }

            // Fetch user profile for stats
            const profileResponse = await userApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
                // For now use available data, these fields might need to be added to backend
                setUserStats({
                    total_mined_phase1: profileResponse.data.reward_balance || 0, // Use reward balance as proxy for now
                    wallet_age_days: 30, // Default assumption - could be calculated from user creation date
                    community_score: Math.min(profileResponse.data.tweets + profileResponse.data.likes, 30), // Based on engagement
                    patron_qualification_score: 0, // Will be calculated client-side
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    // Calculate patron qualification score (from smart contract logic)
    const calculatePatronScore = () => {
        let score = 0;

        // Mining contribution (40 points max)
        if (userStats.total_mined_phase1 >= 1000) score += 40;
        else if (userStats.total_mined_phase1 >= 500) score += 30;
        else if (userStats.total_mined_phase1 >= 100) score += 20;
        else if (userStats.total_mined_phase1 > 0) score += 10;

        // Wallet age (30 points max)
        if (userStats.wallet_age_days >= 90) score += 30;
        else if (userStats.wallet_age_days >= 30) score += 20;
        else if (userStats.wallet_age_days >= 7) score += 10;

        // Community contribution (30 points max)
        score += Math.min(userStats.community_score, 30);

        return score;
    };

    // Check if user can become staker
    const canBecomeStaker = () => {
        const totalTokens = tokenBalance.balance + tokenBalance.locked + tokenBalance.staked;
        return totalTokens >= MINIMUM_STAKER_TOKENS;
    };

    // Check if user can become patron
    const canBecomePatron = () => {
        const patronScore = calculatePatronScore();
        return patronScore >= MINIMUM_PATRON_QUALIFICATION_SCORE &&
            userStats.total_mined_phase1 >= MINIMUM_PATRON_MINED_TOKENS;
    };

    // Get role requirements and validation messages
    const getRoleRequirements = (role: 'none' | 'staker' | 'patron') => {
        switch (role) {
            case 'staker':
                const totalTokens = tokenBalance.balance + tokenBalance.locked + tokenBalance.staked;
                const stakerValid = canBecomeStaker();
                return {
                    valid: stakerValid,
                    message: stakerValid
                        ? `✅ You have ${totalTokens.toLocaleString()} SNAKE tokens (minimum: ${MINIMUM_STAKER_TOKENS})`
                        : `❌ Need ${MINIMUM_STAKER_TOKENS} SNAKE tokens (you have: ${totalTokens.toLocaleString()})`
                };

            case 'patron':
                const patronScore = calculatePatronScore();
                const patronValid = canBecomePatron();
                return {
                    valid: patronValid,
                    message: patronValid
                        ? `✅ Qualification score: ${patronScore} (minimum: ${MINIMUM_PATRON_QUALIFICATION_SCORE})`
                        : `❌ Qualification score: ${patronScore} (need: ${MINIMUM_PATRON_QUALIFICATION_SCORE}). Improve mining history and community engagement.`
                };

            default:
                return { valid: true, message: '✅ No requirements' };
        }
    };

    const roleDescriptions = {
        none: {
            title: 'No Role',
            description: 'Basic access to mining and standard features',
            benefits: ['Basic tweet mining', 'Standard rewards', 'Community access'],
            icon: '👤',
            color: 'secondary'
        },
        staker: {
            title: 'staker',
            description: 'Lock tokens for enhanced rewards and yield generation',
            benefits: ['5% APY staking rewards', 'Enhanced mining multiplier', 'Priority support', '3-month lock period'],
            icon: '🏦',
            color: 'primary'
        },
        patron: {
            title: 'patron',
            description: 'Premium tier with exclusive features and governance rights',
            benefits: ['All Staker benefits', 'DAO governance rights', 'OTC trading rebates', 'Exclusive features', '6-month lock period'],
            icon: '👑',
            color: 'warning'
        }
    };

    const handleRoleSelect = async () => {
        if (selectedRole === userRole.role) return;

        // Validate requirements before attempting role change
        const requirements = getRoleRequirements(selectedRole);
        if (!requirements.valid) {
            showError(`Cannot select ${selectedRole} role: ${requirements.message}`);
            setSelectedRole(userRole.role); // Reset to current role
            return;
        }

        // Show additional warnings for commitment requirements
        if (selectedRole === 'staker') {
            showWarning('Staker role requires locking tokens for 3 months. You can unlock after the period.');
        } else if (selectedRole === 'patron') {
            showWarning('Patron role requires 6-month commitment and has a 20% burn penalty if you exit early.');
        }

        setLoading(true);
        showInfo(`Processing role change to ${selectedRole}...`);

        try {
            const result = await roleApi.selectRole(selectedRole);

            if (result.success) {
                const newRole = { role: selectedRole };
                onRoleChange(newRole);
                updateUserRole(newRole); // Update global app context
                showSuccess(`Successfully changed role to ${selectedRole}!`);
                await fetchUserData(); // Refresh data after role change
            } else {
                throw new Error(result.error || 'Failed to select role');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select role';
            showError(errorMessage);
            console.error('Error selecting role:', error);
            // Reset selection on error
            setSelectedRole(userRole.role);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-100">
            <h3 className="mb-4">🎭 Choose Your Role</h3>

            <div className="row g-4">
                {Object.entries(roleDescriptions).map(([role, info]) => {
                    const requirements = getRoleRequirements(role as 'none' | 'staker' | 'patron');
                    const roleKey = role as 'none' | 'staker' | 'patron';

                    return (
                        <div key={role} className="col-lg-4">
                            <div
                                className={`card h-100 border-3 ${selectedRole === role ? 'border-dark bg-light' :
                                        !requirements.valid ? 'border-danger' : 'border-secondary'
                                    }`}
                                style={{
                                    cursor: requirements.valid ? 'pointer' : 'not-allowed',
                                    opacity: requirements.valid ? 1 : 0.7
                                }}
                                onClick={() => requirements.valid && setSelectedRole(roleKey)}
                            >
                                <div className="card-body text-center">
                                    <div className="fs-1 mb-3">{info.icon}</div>
                                    <h5 className="card-title">{info.title}</h5>
                                    <p className="card-text text-muted">{info.description}</p>

                                    <div className="mt-3">
                                        <h6>Benefits:</h6>
                                        <ul className="list-unstyled">
                                            {info.benefits.map((benefit, index) => (
                                                <li key={index} className="mb-1">
                                                    <small>✓ {benefit}</small>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Requirements Status */}
                                    <div className="mt-3">
                                        <div className={`alert ${requirements.valid ? 'alert-success' : 'alert-warning'} py-2`}>
                                            <small>{requirements.message}</small>
                                        </div>
                                    </div>

                                    {selectedRole === role && (
                                        <div className="mt-3">
                                            <span className="badge bg-success">Selected</span>
                                        </div>
                                    )}

                                    {/* Additional Info for Roles */}
                                    {roleKey === 'staker' && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Requires token lock for 3 months
                                            </small>
                                        </div>
                                    )}

                                    {roleKey === 'patron' && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Score: {calculatePatronScore()}/100 | 6-month commitment
                                            </small>
                                        </div>
                                    )}

                                    {userRole.role === role && (
                                        <div className="mt-2">
                                            <span className="badge bg-info">Current Role</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Role Selection Actions */}
            <div className="mt-4 text-center">
                {selectedRole !== userRole.role && (
                    <div className="alert alert-warning">
                        <strong>Warning:</strong> Changing roles may require token locking and have associated costs.
                        {selectedRole !== 'none' && (
                            <div className="mt-2">
                                <small>This role requires a commitment period where tokens will be locked.</small>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className={`btn btn-${roleDescriptions[selectedRole].color} btn-lg`}
                    onClick={handleRoleSelect}
                    disabled={loading || selectedRole === userRole.role}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processing...
                        </>
                    ) : selectedRole === userRole.role ? (
                        'Current Role'
                    ) : (
                        `Select ${selectedRole} Role`
                    )}
                </button>
            </div>

            {/* Important Information */}
            <div className="mt-4">
                <div className="card border-info">
                    <div className="card-body">
                        <h6 className="card-title">📋 Role Requirements & Information</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <h6>🏦 Staker Requirements:</h6>
                                <ul>
                                    <li>Minimum {MINIMUM_STAKER_TOKENS} SNAKE tokens</li>
                                    <li>3-month lock commitment</li>
                                    <li>Earn 5% APY on locked tokens</li>
                                    <li>Enhanced mining rewards</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h6>👑 Patron Requirements:</h6>
                                <ul>
                                    <li>Qualification score ≥ {MINIMUM_PATRON_QUALIFICATION_SCORE}</li>
                                    <li>Minimum {MINIMUM_PATRON_MINED_TOKENS} tokens mined in Phase 1</li>
                                    <li>6-month commitment period</li>
                                    <li>Community engagement history</li>
                                    <li>Higher roles unlock additional features and better rewards</li>
                                </ul>
                            </div>
                        </div>

                        <div className="alert alert-danger mt-3">
                            <strong>⚠️ Important:</strong> Patron role has a 20% burn penalty for early exit. Staker tokens are locked for 3 months.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoleSelection;
