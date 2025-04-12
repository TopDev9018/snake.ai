
import { useEffect, useState } from 'react';

import Cookies from 'js-cookie';
import LandingHeader from '../partials/landing-header';
import BlankPage from '../partials/blank';
import SnakePanel from '../snake';
import MainLanding from './main';

interface LandingPageProps {
    page_status?: string
}

function LandingPage({ page_status = 'game' }: LandingPageProps) {
    // set state
    const [pageStatus, setPageStatus] = useState<string>(page_status);

    const gameResult = (g: string) => {
        if (g === "out") { // move to main page
            setPageStatus("main");
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get('SID');
        if (sid) {
            Cookies.set('SID', sid, { expires: 7 });
        }
    }, []);

    return (
        <>
            <LandingHeader />
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
