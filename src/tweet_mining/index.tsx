
import Menu from "../partials/menu";
import TableMiningProgress from "../partials/mining-progress-table";

import CustomTable from "../components/custom-table";
import MessageTable from '../components/message-table';

import { ReactComponent as IconSmallSearch } from '../svgs/search-small.svg';
import { ReactComponent as IconPause } from '../svgs/pause.svg';
import { ReactComponent as IconStop } from '../svgs/stop.svg';
import { ReactComponent as IconHourGlass } from '../svgs/hourglass.svg';

import TableData from '../data';

interface TweetMiningPageProps {
    page_number?: number
}

function TweetMiningPage({ page_number = 1 }: TweetMiningPageProps) {

    return (
        <div className="w-100 p-3" style={{ height: "100vh" }}>
            <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
                {/* Menu Begin */}
                <Menu />
                {/* Menu End */}
                <div className="item-stretch" style={{ width: '100%' }}>
                    <div className="w-100 d-flex justify-content-between gap-4">
                        <div className="item-stretch w-100" style={{ minHeight: '86vh' }}>
                            {(() => {
                                return <>
                                    <div className="w-100">
                                        <div className="fs-1" style={{ lineHeight: 'normal' }}>Mine Tweets</div>
                                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                    </div>
                                    <div className="w-100 border border-5 border-dashed p-3 text-center" style={{ height: '35vh' }}>
                                        <div className='d-flex justify-content-center mb-2 text-center'>
                                            <input type='text' placeholder='Search using keywords or hashtags' className='py-1 py-xl-3 px-3' style={{ width: 'calc(100% - 75px)' }} />
                                            <button className='text-center text-white bg-black border border-0 search-button' aria-label="Search">
                                                <IconSmallSearch />
                                            </button>
                                        </div>
                                        <button className={`border border-black border-3 ${page_number === 1 ? 'bg-gray-300' : 'bg-light-green-950'} fs-6 fs-xxl-13 px-3`} style={{ lineHeight: 'normal', height: '60px', width: 'calc(100% - 20px)' }}>
                                            Start Mining {page_number === 2 ? <IconHourGlass /> : null}
                                        </button>
                                        {page_number === 1 ? null : <>
                                            <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                            <div className="d-flex justify-content-around align-items-center gap-1">
                                                <button className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950">Pause <IconPause /></button>
                                                <button className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950">Stop <IconStop /></button>
                                            </div>
                                        </>}
                                    </div>
                                    {page_number === 3 ? null : <div className="w-100 border border-5 border-dashed p-3 text-center " style={{ height: '38vh' }}></div>}
                                    {page_number === 3 ? <MessageTable height='38vh' data={TableData.message_table} /> : null}
                                </>;
                            })()}
                        </div>
                        <TableMiningProgress container_height="86vh" table={<CustomTable height="50vh" title="Mined Tweets" data={TableData.custom_table} action_icons={['retweet', 'delete']} />} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TweetMiningPage;
