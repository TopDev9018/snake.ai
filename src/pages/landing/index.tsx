
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { useAuth } from '../../contexts/AuthContext';
import LandingHeader from '../../partials/landing-header';
import BlankPage from '../../partials/blank';
import SnakePanel from '../snake';
import MainLanding from './main';
import AuthDebug from '../../components/AuthDebug';
import WalletTestPanel from '../../components/WalletTestPanel';

interface LandingPageProps {
    page_status?: string
}

function LandingPage({ page_status = 'game' }: LandingPageProps) {
    // set state
    const [pageStatus, setPageStatus] = useState<string>(page_status);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const gameResult = (g: string) => {
        if (g === "out") { // move to main page
            setPageStatus("main");
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get('SID');
        if (sid) {
            login(sid); // Use AuthContext instead of directly setting cookie
        }
    }, [login]);

    // Redirect to home page after successful authentication
    useEffect(() => {
        if (isAuthenticated) {
            // Add a small delay to allow user to see the login success
            const timer = setTimeout(() => {
                navigate('/home');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <LandingHeader />
            <AuthDebug />
            {/* <WalletTestPanel /> */}
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ height: '90vh' }}>
                {
                    (() => {
                        return pageStatus === "game" ? <BlankPage component={<SnakePanel callback={gameResult} />} /> : <MainLanding />
                    })()
                }
            </div>
        </>
    );
};

export default LandingPage;
