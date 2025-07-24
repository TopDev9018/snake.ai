
import { useEffect, useState } from 'react';

import MainHeader from '../../partials/main-header';
import LandingHeader from '../../partials/landing-header';

import DashboardPage from './dashboard';
import WhatIsSnakePage from './what-is-snake';
import HowItWorksPage from './how-it-works'; // needs to fix
import TokennomicsPage from './tokenomics';
import RoadmapPage from './roadmap';
import SafetyTransparencyPage from './safety-transparency';
import WhyJoinPage from './safety-transparency/why-join';
import GetInvolvedPage from './safety-transparency/get-involved';

interface GetStartedPageProps {
    bar_status?: number
}

function GetStartedPage({ bar_status = 0 }: GetStartedPageProps) {
    // state
    const [barStatus, setBarStatus] = useState<number | undefined>(bar_status);

    // begin wheel event //
    const handleScroll = () => {
        if (window.scrollY === 0) { // set landing header
            setBarStatus(0)
        } else {
            setBarStatus(1)
        }
    }
    // end wheel event //
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, []);

    return (
        <>
            {(() => {
                return barStatus === 0 ? <LandingHeader /> : <MainHeader />
            })()}
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ height: '90vh' }}>
                <DashboardPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ height: '90vh' }}>
                <WhatIsSnakePage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <HowItWorksPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <TokennomicsPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <RoadmapPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <SafetyTransparencyPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <WhyJoinPage />
            </div>
            <div className='w-100 p-2 p-md-4 p-lg-4' style={{ minHeight: '90vh' }}>
                <GetInvolvedPage />
            </div>
        </>
    );
}

export default GetStartedPage;
