
import { useState, useEffect } from "react";

import ResponsiveMenu from "../../components/ResponsiveMenu";
import { useAuth } from "../../contexts/AuthContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { usePhantom } from "../../hooks/usePhantom";
import { userApi, roleApi } from "../patron/services/apiService";
import RoleSelection from "../patron/components/RoleSelection";
import SimpleWalletConnection from "../patron/components/SimpleWalletConnection";
import { UserRole } from "../patron/index";
import './index.css';
// icons
import { ReactComponent as IconLeftLogo } from "../../svgs/logo-left.svg";

interface ProfileData {
    twitter_username: string;
    wallet_address: string;
    latest_claim_timestamp: string | null;
    reward_balance: number;
    tweets: number;
    likes: number;
    replies: number;
}

interface UserDetails {
    selected_role: string | null;
    patron_status: string | null;
    ranking?: number; // Based on token count
}

// Simple ranking calculation based on token balance
const calculateRanking = (rewardBalance: number): number => {
    // Simplified ranking logic based on token tiers
    // In production, this would come from a ranking API endpoint
    if (rewardBalance >= 1000000) return Math.floor(rewardBalance / 10000); // High tier
    if (rewardBalance >= 100000) return Math.floor(rewardBalance / 1000) + 100; // Mid tier
    if (rewardBalance >= 10000) return Math.floor(rewardBalance / 100) + 1000; // Entry tier
    return Math.floor(rewardBalance / 10) + 10000; // Base tier
};

function Profile() {
    // eslint-disable-next-line no-empty-pattern
    const { } = usePhantom();
    const { user } = useAuth();
    const { connected } = useWalletContext();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [userRole, setUserRole] = useState<UserRole>({ role: 'none' });
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState({
        days: 12,
        hours: 12,
        minutes: 12,
        seconds: 12,
    })

    // Fetch profile data on component mount and when wallet connects
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                
                // Fetch profile data
                const profileResponse = await userApi.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    setProfileData(profileResponse.data);
                }

                // Only fetch role-related data if wallet is connected
                if (connected) {
                    // Fetch user details
                    const userResponse = await userApi.getMe();
                    if (userResponse.success && userResponse.data) {
                        setUserDetails({
                            selected_role: userResponse.data.selected_role,
                            patron_status: userResponse.data.patron_status,
                            ranking: calculateRanking(profileResponse.data?.reward_balance || 0)
                        });
                    }

                    // Fetch user role
                    const roleResponse = await roleApi.getUserRole();
                    if (roleResponse.success && roleResponse.data) {
                        const backendRole = roleResponse.data.role?.toLowerCase();
                        let mappedRole: UserRole['role'] = 'none';
                        if (backendRole === 'staker') mappedRole = 'staker';
                        else if (backendRole === 'patron') mappedRole = 'patron';
                        setUserRole({ ...roleResponse.data, role: mappedRole });
                    }
                } else {
                    // Reset role data when wallet is disconnected
                    setUserRole({ role: 'none' });
                    setUserDetails(null);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [connected]); // Add connected as dependency

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
                }
                return prev
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleRoleChange = async (newRole: UserRole) => {
        setUserRole(newRole);
        // Refresh user details when role changes
        setUserDetails(prev => prev ? { ...prev, selected_role: newRole.role } : null);
        
        // Refresh profile data to get updated information
        try {
            const profileResponse = await userApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
                setProfileData(profileResponse.data);
            }
            
            const userResponse = await userApi.getMe();
            if (userResponse.success && userResponse.data) {
                setUserDetails({
                    selected_role: newRole.role,
                    patron_status: userResponse.data.patron_status,
                    ranking: calculateRanking(profileResponse.data?.reward_balance || 0)
                });
            }
        } catch (error) {
            console.error('Error refreshing profile data after role change:', error);
        }
    };

    if (loading) {
        return (
            <div className="w-100 p-3 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="fs-3 mb-3">Loading Profile...</div>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-100 p-3" style={{ height: '100vh', overflow: 'auto' }}>
            <div className="d-flex gap-3" style={{ height: "calc(100vh-60px)", paddingTop: '35px' }}>
                {/* Menu Begin */}
                <ResponsiveMenu />
                {/* Menu End */}

                <div className="custom-content">
                    <div className="w-100 d-flex justify-space-between align-items-end">
                        <div className="fs-1" style={{ lineHeight: 'normal' }}>
                            DASHBOARD
                        </div>
                        <div className="fs-6 text-muted">
                            Welcome back, {profileData?.twitter_username || user?.twitter_username || 'User'}!
                        </div>
                    </div>

                    <div className="custom-border-y custom-content-height d-flex flex-column px-3">
                        {/* Wallet Connection */}
                            <div className="mb-1">
                                <SimpleWalletConnection />
                            </div>
                        <div className="custom-border-bottom fs-2 mt-4" >USER PROFILE</div>
                        <div className="row ">
                            {/* Left Column - Profile Info */}
                            <div className="col-12 col-lg-7 custom-border mt-4">
                                <div className="profile-section p-5">
                                    <div className="row align-items-center gap-4">
                                        <div className="col-auto">
                                            <div className="avatar-container">
                                                <div className="pixel-avatar"><IconLeftLogo /></div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="profile-info">
                                                <div className="mb-2">
                                                    <span className="retro-text-small">USER:</span>
                                                    <div className="retro-text text-danger">
                                                        {profileData?.twitter_username || user?.twitter_username || 'Unknown'}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <span className="retro-text-small">WALLET:</span>
                                                    <div className="retro-text text-xs">
                                                        {profileData?.wallet_address ? 
                                                            `${profileData.wallet_address.slice(0, 4)}...${profileData.wallet_address.slice(-4)}` : 
                                                            'Not Connected'
                                                        }
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <span className="retro-text-small">ROLE:</span>
                                                    <div className="retro-text">
                                                        {userRole.role.toUpperCase()} 
                                                        {userDetails?.patron_status === 'approved' && '♥'}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <span className="retro-text-small">RANK:</span>
                                                    <div className="retro-text">
                                                        #{userDetails?.ranking?.toLocaleString() || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>  
                                        </div>
                                        {/* <button className="btn proposal-btn bg-light-green-950">PROPOSAL SUBMISSION FORM →</button> */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5 col-sm-12 px-3 py-5 gap-4">
                                <div className="d-flex flex-column gap-3 pt-3">
                                    <div className="custom-border-bottom ">REWARD BALANCE:</div>
                                    <div className="d-flex justify-content-center p-3 bg-black text-light-green-950 align-items-center" >
                                        <span className="fs-5">{loading ? '...' : (profileData?.reward_balance?.toLocaleString() || '0')}</span> 
                                        &nbsp;&nbsp;&nbsp;<span className="fs-6">snakes</span>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-3 pt-3">
                                    <div className="custom-border-bottom ">ENGAGEMENT METRICS:</div>
                                    <div className="d-flex justify-content-center p-3 bg-black text-light-green-950 align-items-center" >
                                        <span className="fs-5">{loading ? '...' : (profileData?.tweets || '0')}</span> 
                                        &nbsp;&nbsp;&nbsp;<span className="fs-6">tweets</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Selection Section */}
                        {connected ? (
                            <div className="border border-3 border-dashed mt-4 p-3">
                                <RoleSelection userRole={userRole} onRoleChange={handleRoleChange} />
                            </div>
                        ) : (
                            <div className="border border-3 border-dashed mt-4 p-3 text-center">
                                <h5 className="text-muted mb-3">🔗 Role Management</h5>
                                <p className="text-muted">Connect your wallet to access role management features</p>
                                <div className="alert alert-info">
                                    <small>Role management allows you to become a Staker or Patron for enhanced benefits</small>
                                </div>
                            </div>
                        )}

                        {/* Countdown Section */}
                        <div className="countdown-section mt-4 py-3 custom-border-top w-100">
                            <div className="retro-text mb-3">COUNTDOWN TO "EVENT NAME"</div>
                            <div className="row g-2 justify-content-center">
                                <div className="col-auto">
                                    <div className="countdown-box">
                                        <div className="bg-black text-white px-3 py-1 text-center fs-4 fw-bold" style={{ width: '55px' }}>{countdown.days.toString().padStart(2, "0")}</div>
                                        <div className="text-center fs-8">DAYS</div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="countdown-box">
                                        <div className="bg-black text-white px-3 py-1 text-center fs-4 fw-bold" style={{ width: '55px' }}>{countdown.hours.toString().padStart(2, "0")}</div>
                                        <div className="text-center fs-8">HOURS</div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="countdown-box">
                                        <div className="bg-black text-white px-3 py-1 text-center fs-4 fw-bold" style={{ width: '55px' }}>{countdown.minutes.toString().padStart(2, "0")}</div>
                                        <div className="text-center fs-8">MINUTES</div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="countdown-box">
                                        <div className="bg-black text-white px-3 py-1 text-center fs-4 fw-bold" style={{ width: '55px' }}>{countdown.seconds.toString().padStart(2, "0")}</div>
                                        <div className="text-center fs-8">SECONDS</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
