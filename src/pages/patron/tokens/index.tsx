import React, { useState, useEffect } from 'react';
import ResponsiveMenu from "../../../components/ResponsiveMenu";
import TokenManagement from '../components/TokenManagement';
import SimpleWalletConnection from '../components/SimpleWalletConnection';
import { roleApi } from '../services/apiService';
import { UserRole } from '../index';

function TokensPage() {
  const [userRole, setUserRole] = useState<UserRole>({ role: 'none' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    setLoading(true);
    try {
      const response = await roleApi.getUserRole();
      if (response.success && response.data) {
        const backendRole = response.data.role?.toLowerCase();
        let mappedRole: UserRole['role'] = 'none';
        if (backendRole === 'staker') mappedRole = 'staker';
        else if (backendRole === 'patron') mappedRole = 'patron';

        setUserRole({ ...response.data, role: mappedRole });
      } else {
        setUserRole({ role: 'none' });
      }
    } catch (error) {
      setUserRole({ role: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 p-3" style={{ height: "100vh" }}>
      <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
        <ResponsiveMenu />
         
        <div className="custom-content" >
            <div className="w-100 d-flex justify-space-between align-items-end">
                <div className="fs-1" style={{ lineHeight: 'normal' }}>
                    💰 Token Management
                </div>
                <div className="fs-6 text-muted">
                    Manage your token stakes, locks, and rewards
                </div>
            </div>

            <div className="custom-border-y custom-content-height d-flex flex-column" >
              <div className="w-100 mb-4">
              <SimpleWalletConnection />
            </div>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <TokenManagement userRole={userRole} />
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default TokensPage;
