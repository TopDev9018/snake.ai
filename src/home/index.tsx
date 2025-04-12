
import { useState } from "react";

import Menu from "../partials/menu";

import TableMiningProgress from "../partials/mining-progress-table";

import CustomTable from "../components/custom-table";
import TableData from "../data";

// icons
import { ReactComponent as IconColoredLogo } from '../svgs/logo-colored.svg';
import QRCodeComponent from "../components/qrcode";

import { usePhantom } from "../hooks/usePhantom";

interface HomeProps {
    pagename?: string
}

function Home({ pagename = 'dashboard' }: HomeProps) {
    const { walletAvailable, publicKey, connect } = usePhantom();
    // state
    const [pageName, setPageName] = useState<string | undefined>(pagename);

    // your rewards button click event
    const showClaimYourRewards = () => {
        setPageName("claim-rewards");
    }

    const handleWallet = () => {

    }

    return (
        <div className="w-100 p-3" style={{ height: '100vh' }}>
            <div className="d-flex gap-3" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
                {/* Menu Begin */}
                <Menu />
                {/* Menu End */}
                {(() => {
                    return <>
                        <div className="item-stretch" style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between gap-3">
                                {/* Home page 1 */}
                                {pageName === 'dashboard' ? <>
                                    <div className="item-stretch" style={{ width: 'calc(100% - 150px)', minHeight: '86vh' }}>
                                        <div className="w-100">
                                            <div className="fs-1" style={{ lineHeight: 'normal' }}>DASHBOARD</div>
                                            <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                        </div>
                                        <div className="d-flex justify-content-center align-items-center">
                                            <div className="d-flex align-items-center w-100 border border-dashed border-5 p-1">
                                                <IconColoredLogo className="mx-1" />
                                                <span className="mx-2 fs-6 fs-xxl-14">Hello,</span>
                                                <span className="fs-5 fs-xxl-13" style={{ color: '#D7263D' }}>ISA47</span>
                                            </div>
                                        </div>
                                        <div className="py-2 d-flex justify-content-between align-items-center">
                                            <span className="fs-5 fw-bolder" style={{ lineHeight: 'normal' }}>REWARD BALANCE:</span>
                                            <span className="py-2 px-2 border border-4 border-black rounded-4 bg-light-green-950 text-center">123,456 SNAKES</span>
                                        </div>
                                        <hr className="border border-dashed border-black border-3 opacity-100 my-0"></hr>
                                        <div className="w-100 py-2">
                                            <div className="w-100 d-flex justify-content-center">
                                                <button className="border border-4 border-black bg-gray-300 w-75 py-2 fs-4 fs-xxl-13 mb-3" style={{ lineHeight: 'normal' }} onClick={showClaimYourRewards}>Your Rewards</button>
                                            </div>
                                        </div>
                                        <hr className="border border-dashed border-black border-3 opacity-100 my-2"></hr>
                                        <span className="fs-5 fw-bolder">REWARD BALANCE:</span>
                                        <hr className="border border-dashed border-black border-3 opacity-100 my-2"></hr>
                                        <div className="row gutter-1">
                                            <div className="col-md-4">
                                                <div className="w-100 border border-light-green-950 border-3 py-4 px-2 text-center bg-green-950 rounded-2">
                                                    <div className="fs-4 fs-xxl-8 fw-bolder text-light-green-950">42</div>
                                                    <div className="fs-7 fs-xxl-14 text-green-300">Tweets</div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="w-100 border border-light-green-950 border-3 py-4 px-2 text-center bg-green-950 rounded-2">
                                                    <div className="fs-4 fs-xxl-8 fw-bolder text-light-green-950">189</div>
                                                    <div className="fs-7 fs-xxl-14 text-green-300">Likes</div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="w-100 border border-light-green-950 border-3 py-4 px-2 text-center bg-green-950 rounded-2">
                                                    <div className="fs-4 fs-xxl-8 fw-bolder text-light-green-950">87</div>
                                                    <div className="fs-7 fs-xxl-14 text-green-300">Replies</div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="border border-dashed border-black border-3 opacity-100 my-0"></hr>
                                    </div>
                                    <TableMiningProgress container_height="70vh" />
                                </> : null}

                                {/* Home page 2 */}
                                {pageName === 'claim-rewards' ? <>
                                    <div className="item-stretch" style={{ width: 'calc(100% - 150px)', height: '70vh' }}>
                                        <div className="w-100">
                                            <div className="fs-1" style={{ lineHeight: 'normal' }}>claim your rewards</div>
                                            <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                        </div>
                                        <div className="d-flex justify-content-center align-items-center bg-black p-3 p-lg-4 p-xl-5" style={{ height: 'calc(100% - 150px)' }}>
                                            <div className="w-100 text-center">
                                                <div className="fs-5 text-light-green-950 mb-2" style={{ lineHeight: 'normal' }}>Scan code and Claim Rewards</div>
                                                <div className="my-4 my-xxl-4">
                                                    <QRCodeComponent value={"https://snake.ai"} size={144} />
                                                </div>
                                                <div className="fs-6 text-light-green-950 mb-1" style={{ lineHeight: 'normal' }}>Code expires in</div>
                                                <div className="fs-5 fw-bolder text-light-green-950" style={{ lineHeight: 'normal' }}>5:00 minutes</div>
                                            </div>
                                        </div>
                                    </div>
                                    <TableMiningProgress container_height="70vh" table={<CustomTable height="38vh" title="Mined Tweets" data={TableData.custom_table} action_icons={['like', 'reply', 'retweet', 'delete']} />} />
                                </> : null}
                            </div>
                            {/* Home page 2 */}
                            {pageName === 'claim-rewards' ? <div className="">
                                <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                <div className="d-flex justify-content-center align-items-center gap-5">
                                    <button className="fs-6 fs-xl-12 fs-xxl-14 bg-light-green-950 border border-3 border-black p-2 px-5">Claim Now!</button>
                                    <button onClick={handleWallet} className="fs-6 fs-xl-12 fs-xxl-14 bg-gray-400 border border-3 border-black p-2 px-5">Link Wallet</button>
                                </div>
                                <hr className="border border-dashed border-black border-3 opacity-100 mt-3 my-0"></hr>
                            </div> : null}
                        </div>
                    </>
                })()}
            </div>
        </div>
    );
}

export default Home;
