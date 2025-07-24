import React, { useState } from 'react';

interface MiningInstructionsProps {
    onClose?: () => void;
}

function MiningInstructions({ onClose }: MiningInstructionsProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    return (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
            <h5 className="alert-heading">🚀 How to Mine Tweets</h5>
            <div className="row">
                <div className="col-md-6">
                    <h6>📝 Step 1: Post on Twitter/X</h6>
                    <ul className="small">
                        <li>Tweet mentioning <strong>@playSnakeAI</strong></li>
                        <li>Include hashtag <strong>#MineTheSnake</strong></li>
                        <li>Make sure you follow @playSnakeAI</li>
                    </ul>
                    
                    <h6>⚡ Step 2: Start Mining</h6>
                    <ul className="small">
                        <li>Enter search keywords or use suggestions</li>
                        <li>Click "Start Mining" to begin</li>
                        <li>Monitor progress in real-time</li>
                    </ul>
                </div>
                <div className="col-md-6">
                    <h6>🎯 Step 3: Earn Rewards</h6>
                    <ul className="small">
                        <li>Earn tokens for each qualifying tweet</li>
                        <li>Phase 1: Basic rewards</li>
                        <li>Phase 2: Enhanced role-based rewards</li>
                    </ul>
                    
                    <h6>🏆 Tips for Success</h6>
                    <ul className="small">
                        <li>Post regularly with the hashtag</li>
                        <li>Engage with the community</li>
                        <li>Check mining status frequently</li>
                    </ul>
                </div>
            </div>
            
            <div className="mt-3">
                <h6>📋 Mining Phases</h6>
                <div className="row g-2">
                    <div className="col-md-4">
                        <div className="card bg-light">
                            <div className="card-body p-2">
                                <small><strong>Phase 1:</strong> Basic mining for Twitter engagement</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-light">
                            <div className="card-body p-2">
                                <small><strong>Phase 2:</strong> Role-based mining with enhanced rewards</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-light">
                            <div className="card-body p-2">
                                <small><strong>Goal:</strong> 100M tweets to complete mining</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
                onClick={handleClose}
            ></button>
        </div>
    );
}

export default MiningInstructions;
