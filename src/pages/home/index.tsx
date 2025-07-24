
import React from "react";

import ResponsiveMenu from "../../components/ResponsiveMenu";
import WalletDisplay from "../../components/WalletDisplay";
import { useAuth } from "../../contexts/AuthContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { useAppContext } from "../../contexts/AppContext";
import { usePhantom } from "../../hooks/usePhantom";
import './index.css';
// icons
import { ReactComponent as IconLeftLogo } from "../../svgs/logo-left.svg";

function Home() {
    // eslint-disable-next-line no-empty-pattern
    const { } = usePhantom();
    const { user } = useAuth();
    const { connected, connect } = useWalletContext();
    const { 
        miningStatus, 
        userProfile, 
        tokenInfo, 
        loading, 
        error, 
        showWalletWarning,
        refreshData 
    } = useAppContext();

    // Calculate mining progress
    const getMiningProgress = () => {
        if (!miningStatus) return { percentage: 0, mined: 0, total: 1000000 };
        
        const total = 1000000; // 1M tweets target for Phase 1
        const mined = miningStatus.total_phase1_mined || 0;
        const percentage = Math.min((mined / total) * 100, 100);
        
        return { percentage, mined, total };
    };

    const { percentage, mined, total } = getMiningProgress();

    return (
        <div className="w-100 p-3" style={{ height: '100vh' }}>
            <div className="d-flex gap-3" style={{ height: "calc(100vh-60px)", paddingTop: '35px' }}>
                {/* Menu Begin */}
                <ResponsiveMenu />
                {/* Menu End */}
               
                <div className="custom-content">
                    <div className="w-100 d-flex justify-space-between align-items-end custom-content-title">
                        <div className="fs-1" style={{ lineHeight: 'normal' }}>
                            DASHBOARD
                        </div>
                        <div className="fs-6 text-muted">
                            Welcome back, {userProfile?.twitter_username || user?.twitter_username}!
                        </div>
                    </div>

                    {/* Wallet Warning */}
                    {showWalletWarning && (
                        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3 py-1 position-fixed" style={{top: '10px'}} role="alert">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div className="flex-grow-1">
                                <strong>Wallet Required!</strong> Please connect your wallet to access all features.
                            </div>
                            <button 
                                className="btn btn-warning btn-sm"
                                onClick={connect}
                                disabled={loading}
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="mt-2">Loading mining data...</div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <div className="flex-grow-1">
                                {error}
                            </div>
                            <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={refreshData}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    <div className="custom-border-y custom-content-height d-flex flex-column">
                        {/* Welcome Section */}
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <div className="text-center fs-2 fs-lg-4 fs-xl-7 fw-bold" >
                                Play
                            </div>
                            <div className="d-flex justify-content-center align-items-center">
                                <IconLeftLogo />
                                <span className="fs-1 fs-lg-2 fs-xl-1 fw-bold">SNAKE.AI</span>
                            </div>
                            <div>
                                <WalletDisplay />
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="d-flex align-items-center py-3 custom-border-top w-100">
                            <div className="bg-black p-2 px-4 text-light-green-950 rounded-3" style={{ minWidth: '180px'}}>
                                <div className="fs-4 fw-bold">
                                    {miningStatus?.current_phase === 1 ? 'PHASE 1:' : 'PHASE 2:'}
                                </div>
                                <div className="fs-6">MINING EPOCH</div>
                            </div>
                            <div className="custom-border-left mx-3" style={{height: '70px'}} > </div>
                            <div className="d-flex align-items-center">
                                <div className="progress-bar-container rounded me-3">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="progress-container">
                                    <div
                                        className="progress-fill"
                                        style={{ ['--progress' as any]: `${percentage}` }}
                                    ></div>
                                </div>
                                <div className="ps-3 fs-6">
                                    <b>MINING PROGRESS:</b> {mined.toLocaleString()} OUT OF {total.toLocaleString()} TWEETS MINED
                                </div>
                            </div>
                        </div>

                        {/* User Stats */}
                        {connected && userProfile && (
                            <div className="d-flex gap-3 mt-3">
                                <div className="bg-white-custom p-3 rounded flex-fill">
                                    <div className="fs-6 text-muted">Your Tweets</div>
                                    <div className="fs-4 fw-bold">{(userProfile.tweets || 0).toLocaleString()}</div>
                                </div>
                                <div className="bg-white-custom p-3 rounded flex-fill">
                                    <div className="fs-6 text-muted">Reward Balance</div>
                                    <div className="fs-4 fw-bold">{(userProfile.reward_balance || 0).toFixed(4)} SNAKE</div>
                                </div>
                                {tokenInfo && (
                                    <div className="bg-white-custom p-3 rounded flex-fill">
                                        <div className="fs-6 text-muted">Token Balance</div>
                                        <div className="fs-4 fw-bold">{(tokenInfo.balance || 0).toFixed(4)} SNAKE</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
