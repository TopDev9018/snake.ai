import React, { useState, useEffect } from 'react';
import ResponsiveMenu from "../../components/ResponsiveMenu";
import WalletGuard from "../../components/WalletGuard";
import OTCTrading from '../patron/components/OTCTrading';
import { roleApi } from '../patron/services/apiService';
import { UserRole } from '../patron/index';

function SwapPage() {
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
                {/* Menu Begin */}
                <ResponsiveMenu />
                {/* Menu End */}

                <div className="item-stretch" style={{ width: '100%' }}>
                    <div className="w-100">
                        <div className="fs-1" style={{ lineHeight: 'normal' }}>🔄 Token Swap</div>
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>

                    <WalletGuard>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <OTCTrading userRole={userRole} />
                        )}
                    </WalletGuard>
                </div>
            </div>
        </div>
    );
}

export default SwapPage;
