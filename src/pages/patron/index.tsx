import React, { useState, useEffect } from 'react';
import ResponsiveMenu from "../../components/ResponsiveMenu";
import WalletGuard from "../../components/WalletGuard";
import RoleSelection from './components/RoleSelection';
import TokenManagement from './components/TokenManagement';
import PatronApplication from './components/PatronApplication';
import OTCTrading from './components/OTCTrading';
import SimpleWalletConnection from './components/SimpleWalletConnection';
import MiningStatus from './components/MiningStatus';
import { roleApi } from './services/apiService';
import { useAppContext } from '../../contexts/AppContext';

export interface UserRole {
  role: 'none' | 'staker' | 'patron';
  status?: string;
  locked_until?: number;
  stake_amount?: number;
}

interface PatronFrameworkPageProps {
  page_number?: number;
}

function PatronFrameworkPage({ page_number = 1 }: PatronFrameworkPageProps) {
  const { userRole: globalUserRole } = useAppContext();
  const [userRole, setUserRole] = useState<UserRole>({ role: 'none' });
  const [activeTab, setActiveTab] = useState<'role' | 'tokens' | 'patron' | 'otc' | 'mining'>('role');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserRole();
  }, []);

  // Sync with global user role
  useEffect(() => {
    if (globalUserRole && globalUserRole.role !== userRole.role) {
      setUserRole(globalUserRole);
    }
  }, [globalUserRole, userRole.role]);

  const fetchUserRole = async () => {
  setLoading(true);
  try {
    const response = await roleApi.getUserRole();
    if (response.success && response.data) {
      // Map backend role string to frontend UserRole
      const backendRole = response.data.role?.toLowerCase();
      let mappedRole: UserRole['role'] = 'none';
      if (backendRole === 'staker') mappedRole = 'staker';
      else if (backendRole === 'patron') mappedRole = 'patron';
      // Add other mappings if needed

      setUserRole({ ...response.data, role: mappedRole });
    } else {
      console.error('Failed to fetch user role:', response.error);
      setUserRole({ role: 'none' });
    }
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    setUserRole({ role: 'none' });
  } finally {
    setLoading(false);
  }
};

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole.role === 'patron') {
      setActiveTab('patron');
    } else if (newRole.role === 'staker') {
      setActiveTab('tokens');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'role':
        return <RoleSelection userRole={userRole} onRoleChange={handleRoleChange} />;
      case 'tokens':
        return <TokenManagement userRole={userRole} />;
      case 'patron':
        return <PatronApplication userRole={userRole} />;
      case 'otc':
        return <OTCTrading userRole={userRole} />;
      case 'mining':
        return <MiningStatus />;
      default:
        return <RoleSelection userRole={userRole} onRoleChange={handleRoleChange} />;
    }
  };

  return (
    <div className="w-100 p-3" style={{ height: "100vh" }}>
      <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
        {/* Menu Begin */}
        <ResponsiveMenu />
        {/* Menu End */}
        
        <div className="item-stretch" style={{ width: '100%' }}>
          <div className="w-100 d-flex justify-content-between gap-4">
            <div className="item-stretch w-100" style={{ minHeight: '86vh' }}>
              
              {/* Header */}
              <div className="w-100">
                <div className="fs-1" style={{ lineHeight: 'normal' }}>
                  🏆 Patron Framework
                </div>
                <div className="fs-6 text-muted mb-3">
                  Choose your role and unlock exclusive features in the Snake AI ecosystem
                </div>
                <hr className="border border-dashed border-black border-3 opacity-100" />
              </div>

              {/* Tab Navigation */}
              <div className="w-100 mb-4">
                <div className="d-flex gap-2">
                  <button
                    className={`btn border border-2 px-3 py-2 ${
                      activeTab === 'role' 
                        ? 'bg-dark text-white border-dark' 
                        : 'bg-light text-dark border-secondary'
                    }`}
                    onClick={() => setActiveTab('role')}
                  >
                    🎭 Role Selection
                  </button>
                  
                  <button
                    className={`btn border border-2 px-3 py-2 ${
                      activeTab === 'tokens' 
                        ? 'bg-dark text-white border-dark' 
                        : 'bg-light text-dark border-secondary'
                    }`}
                    onClick={() => setActiveTab('tokens')}
                    disabled={userRole.role === 'none'}
                  >
                    💰 Token Management
                  </button>
                  
                  <button
                    className={`btn border border-2 px-3 py-2 ${
                      activeTab === 'patron' 
                        ? 'bg-dark text-white border-dark' 
                        : 'bg-light text-dark border-secondary'
                    }`}
                    onClick={() => setActiveTab('patron')}
                    disabled={userRole.role !== 'patron'}
                  >
                    👑 Patron Features
                  </button>
                  
                  <button
                    className={`btn border border-2 px-3 py-2 ${
                      activeTab === 'otc' 
                        ? 'bg-dark text-white border-dark' 
                        : 'bg-light text-dark border-secondary'
                    }`}
                    onClick={() => setActiveTab('otc')}
                    disabled={userRole.role === 'none'}
                  >
                    🔄 OTC Trading
                  </button>
                  
                  <button
                    className={`btn border border-2 px-3 py-2 ${
                      activeTab === 'mining' 
                        ? 'bg-dark text-white border-dark' 
                        : 'bg-light text-dark border-secondary'
                    }`}
                    onClick={() => setActiveTab('mining')}
                  >
                    ⛏️ Mining Status
                  </button>
                </div>
              </div>

              {/* Content with Wallet Guard */}
              <WalletGuard>
                {/* Wallet Connection */}
                <div className="w-100 mb-4">
                  <SimpleWalletConnection />
                </div>

                {/* Current Role Display */}
                <div className="w-100 mb-4">
                  <div className="alert alert-info border border-3 border-dashed">
                    <strong>Current Role:</strong> {userRole.role}
                    {userRole.role !== 'none' && (
                      <span className="ms-2 badge bg-success">Active</span>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="w-100 border border-3 border-dashed p-4" style={{ minHeight: '60vh' }}>
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    renderTabContent()
                  )}
                </div>
              </WalletGuard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatronFrameworkPage;
