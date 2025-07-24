
import React, { useState, useEffect } from 'react';
import ResponsiveMenu from "../../components/ResponsiveMenu";
import WalletGuard from "../../components/WalletGuard";
import TableMiningProgress from "../../partials/mining-progress-table";
import MiningStatus from "../patron/components/MiningStatus";
import DemoMode from "../../components/DemoMode";

import CustomTable from "../../components/custom-table";
import MessageTable from '../../components/message-table';
import MiningInstructions from '../../components/MiningInstructions';

import { ReactComponent as IconSmallSearch } from '../../svgs/search-small.svg';
import { ReactComponent as IconPause } from '../../svgs/pause.svg';
import { ReactComponent as IconStop } from '../../svgs/stop.svg';
import { ReactComponent as IconHourGlass } from '../../svgs/hourglass.svg';

import { tokenApi, userApi } from '../patron/services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import miningService, { MiningJob, TweetSearchParams } from '../../services/miningService';

interface TweetMiningPageProps {
    page_number?: number
}

interface MiningState {
    isActive: boolean;
    isPaused: boolean;
    searchQuery: string;
    miningData: any;
    tweets: any[];
    currentJob: MiningJob | null;
    stats: any;
    showInstructions: boolean;
}

function TweetMiningPage({ page_number = 1 }: TweetMiningPageProps) {
    const { user } = useAuth();
    const [miningState, setMiningState] = useState<MiningState>({
        isActive: false,
        isPaused: false,
        searchQuery: '',
        miningData: null,
        tweets: [],
        currentJob: null,
        stats: null,
        showInstructions: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load mining status and tweets on component mount
    useEffect(() => {
        if (user) {
            loadMiningData();
            loadTweets();
            loadMiningStats();
        }
    }, [user]);

    // Update mining job status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const currentJob = miningService.getCurrentJob();
            if (currentJob) {
                setMiningState(prev => ({
                    ...prev,
                    currentJob,
                    isActive: currentJob.status === 'active',
                    isPaused: currentJob.status === 'paused'
                }));
            }
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [miningState.isActive]);

    const loadMiningData = async () => {
        try {
            const response = await tokenApi.getMiningStatus();
            if (response.success) {
                setMiningState(prev => ({ ...prev, miningData: response.data }));
            }
        } catch (err) {
            console.error('Failed to load mining data:', err);
        }
    };

    const loadTweets = async () => {
        try {
            const response = await userApi.getTweets(0, 10);
            if (response.success) {
                setMiningState(prev => ({ ...prev, tweets: response.data || [] }));
            }
        } catch (err) {
            console.error('Failed to load tweets:', err);
        }
    };

    const loadMiningStats = async () => {
        try {
            const response = await miningService.getMiningStats();
            if (response.success) {
                setMiningState(prev => ({ ...prev, stats: response.stats }));
            }
        } catch (err) {
            console.error('Failed to load mining stats:', err);
        }
    };

    const handleSearch = async () => {
        const validation = miningService.validateSearchQuery(miningState.searchQuery);
        if (!validation.valid) {
            setError(validation.error || 'Invalid search query');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const searchParams: TweetSearchParams = {
                query: miningState.searchQuery,
                hashtags: miningState.searchQuery.match(/#\w+/g) || [],
                mentions: miningState.searchQuery.match(/@\w+/g) || []
            };

            const result = await miningService.searchTweets(searchParams);

            if (result.success) {
                setMiningState(prev => ({ ...prev, tweets: result.tweets || [] }));
                setError(null);
            } else {
                setError(result.error || 'Search failed');
            }
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartMining = async () => {
        if (miningState.isActive) return;

        // Use default search query if none provided
        const searchQuery = miningState.searchQuery || '#MineTheSnake';

        setLoading(true);
        setError(null);

        try {
            const searchParams: TweetSearchParams = {
                query: searchQuery,
                hashtags: searchQuery.match(/#\w+/g) || ['#MineTheSnake'],
                mentions: searchQuery.match(/@\w+/g) || ['@playSnakeAI']
            };

            const result = await miningService.startMining(searchParams);

            if (result.success) {
                const currentJob = miningService.getCurrentJob();
                setMiningState(prev => ({
                    ...prev,
                    isActive: true,
                    isPaused: false,
                    currentJob,
                    searchQuery
                }));
                setError(null);
            } else {
                setError(result.error || 'Failed to start mining');
            }
        } catch (err) {
            setError('Failed to start mining. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePauseMining = () => {
        if (miningState.isPaused) {
            miningService.resumeMining();
        } else {
            miningService.pauseMining();
        }

        setMiningState(prev => ({
            ...prev,
            isPaused: !prev.isPaused,
            currentJob: miningService.getCurrentJob()
        }));
    };

    const handleStopMining = async () => {
        await miningService.stopMining();
        setMiningState(prev => ({
            ...prev,
            isActive: false,
            isPaused: false,
            currentJob: null
        }));
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMiningState(prev => ({
            ...prev,
            searchQuery: e.target.value
        }));
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Transform tweets data for the table
    const transformedTweets = miningState.tweets.map((tweet, index) => ({
        text: tweet.content || `Tweet #${index + 1}`,
        date: new Date(tweet.created_at).toLocaleDateString() || 'Unknown'
    }));

    // Mock message data for Phase 3 display
    const mockMessages = [
        {
            icon: '../../images/image1.png',
            username: user?.twitter_username || 'User',
            userid: `@${user?.twitter_username || 'user'}`,
            message: `Mining with #MineTheSnake - Join the SnakeAI revolution! 🐍⚡`
        }
    ];

    return (
        <div className="w-100 p-3" style={{ height: "100vh" }}>
            <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
                {/* Menu Begin */}
                <ResponsiveMenu />
                {/* Menu End */}
                <div className="custom-content" >
                    <div className="w-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="fs-1" style={{ lineHeight: 'normal' }}>Mine Tweets</div>
                            {/* {!miningState.showInstructions && (
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setMiningState(prev => ({ ...prev, showInstructions: true }))}
                                >
                                    📚 Show Instructions
                                </button>
                            )}  */}
                        </div>
                    </div>
                    <div className="custom-border-y custom-content-height d-flex flex-column px-3">
                        <WalletGuard>
                            {/* Mining Instructions */}
                            {/* {miningState.showInstructions && (
                                <div className="mb-3">
                                    <MiningInstructions 
                                        onClose={() => setMiningState(prev => ({ ...prev, showInstructions: false }))}
                                    />
                                </div>
                            )} */}

                            <div className="w-100 d-flex justify-content-center gap-4">
                                <div className=" w-100" >
                                    <div className="w-100 border border-5 border-dashed p-3 text-center" style={{ height: '35vh' }}>
                                        {/* Search Section */}
                                        <div className='d-flex justify-content-center mb-2 text-center'>
                                            <input
                                                type='text'
                                                placeholder='Search using keywords or hashtags (e.g., #MineTheSnake)'
                                                className='py-1 py-xl-3 px-3'
                                                style={{ width: 'calc(100% - 75px)' }}
                                                value={miningState.searchQuery}
                                                onChange={handleSearchInputChange}
                                                onKeyPress={handleSearchKeyPress}
                                                disabled={loading}
                                            />
                                            <button
                                                className='text-center text-white bg-black border border-0 search-button'
                                                aria-label="Search"
                                                onClick={handleSearch}
                                                disabled={loading}
                                            >
                                                <IconSmallSearch />
                                            </button>
                                        </div>

                                        {/* Quick Search Suggestions */}
                                        {!miningState.searchQuery && (
                                            <div className="mb-2">
                                                <small className="text-muted">Quick suggestions:</small>
                                                <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                    {miningService.getRecommendedQueries().slice(0, 3).map((query, index) => (
                                                        <button
                                                            key={index}
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => setMiningState(prev => ({ ...prev, searchQuery: query }))}
                                                            disabled={loading}
                                                        >
                                                            {query}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Current Job Status */}
                                        {miningState.currentJob && (
                                            <div className="alert alert-info mb-2" role="alert">
                                                <small>
                                                    <strong>Current Job:</strong> {miningState.currentJob.searchQuery} |
                                                    <strong> Found:</strong> {miningState.currentJob.tweetsFound} tweets |
                                                    <strong> Earned:</strong> {miningState.currentJob.tokensEarned} tokens
                                                </small>
                                            </div>
                                        )}

                                        {/* Error Display */}
                                        {error && (
                                            <div className="alert alert-danger mb-2" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        {/* Mining Control Button */}
                                        <button
                                            className={`border border-black border-3 ${miningState.isActive && !miningState.isPaused
                                                    ? 'bg-light-green-950'
                                                    : miningState.isActive && miningState.isPaused
                                                        ? 'bg-warning'
                                                        : 'bg-gray-300'
                                                } fs-6 fs-xxl-13 px-3`}
                                            style={{ lineHeight: 'normal', height: '60px', width: 'calc(100% - 20px)' }}
                                            onClick={handleStartMining}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Loading...
                                                </>
                                            ) : miningState.isActive && !miningState.isPaused ? (
                                                <>Mining Active <IconHourGlass /></>
                                            ) : miningState.isActive && miningState.isPaused ? (
                                                'Mining Paused'
                                            ) : (
                                                'Start Mining'
                                            )}
                                        </button>

                                        {/* Pause/Stop Controls */}
                                        {miningState.isActive && (
                                            <>
                                                <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                                <div className="d-flex justify-content-around align-items-center gap-1">
                                                    <button
                                                        className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950"
                                                        onClick={handlePauseMining}
                                                    >
                                                        {miningState.isPaused ? 'Resume' : 'Pause'} <IconPause />
                                                    </button>
                                                    <button
                                                        className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950"
                                                        onClick={handleStopMining}
                                                    >
                                                        Stop <IconStop />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Mining Status or Messages */}
                                    {page_number === 3 ? (
                                        <MessageTable height='38vh' data={mockMessages} />
                                    ) : (
                                        <div className="w-100">
                                            <div className="mb-3">
                                                <div className="fs-4 fw-bold mb-3">⛏️ Mining Status & Progress</div>
                                                <hr className="border border-dashed border-black border-2 opacity-100" />
                                            </div>
                                            <div className="border border-3 border-dashed p-3" style={{ minHeight: '30vh' }}>
                                                <MiningStatus />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mined Tweets Table */}
                                <TableMiningProgress
                                    container_height="100%"
                                    table={
                                        <CustomTable
                                            height=""
                                            title="Mined Tweets"
                                            data={transformedTweets.length > 0 ? transformedTweets : [
                                                { text: 'No tweets mined yet', date: '-' },
                                                { text: 'Start mining to see results', date: '-' }
                                            ]}
                                            action_icons={['retweet', 'delete']}
                                        />
                                    }
                                />
                            </div>
                        </WalletGuard>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TweetMiningPage;
