
import ResponsiveMenu from "../../components/ResponsiveMenu";
import WalletGuard from "../../components/WalletGuard";

import TableMiningProgress from "../../partials/mining-progress-table";

import MessageTable from "../../components/message-table";

import { ReactComponent as IconHourGlass } from '../../svgs/hourglass.svg';
import { ReactComponent as IconPause } from '../../svgs/pause.svg';
import { ReactComponent as IconStop } from '../../svgs/stop.svg';

import { ReactComponent as IconEdit } from '../../svgs/edit.svg';
import { ReactComponent as IconReply } from '../../svgs/refresh.svg';
import { ReactComponent as IconRetweet } from '../../svgs/repost.svg';
import { ReactComponent as IconTrash } from '../../svgs/trash.svg';

import TableData from '../../data'

interface GenerateMemeProps {
    page_number?: number
}

function GenerateMeme({ page_number = 1 }: GenerateMemeProps) {
    return (
        <div className="w-100 p-3">
            <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
                <ResponsiveMenu />
                <div className="item-stretch" style={{ width: '100%' }}>
                    <div className="w-100">
                        <div className="fs-1" style={{ lineHeight: 'normal' }}>Generate Meme</div>
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>
                    
                    <WalletGuard>
                        <div className="d-flex justify-content-between gap-4">
                            <div className="item-stretch" style={{ width: 'calc(100% - 150px)', minHeight: '86vh' }}>
                                <div className="w-100 border border-5 border-dashed p-3 text-center" style={{ height: '75vh' }}>
                                    <div className='d-flex justify-content-center mb-3 text-center'>
                                        <textarea placeholder='input tweet test' className='w-80 py-3 px-3' style={{ width: '90%' }} rows={6}></textarea>
                                    </div>
                                    <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                    <button className={`border border-black border-3 ${page_number === 1 ? 'bg-gray-300' : 'bg-light-green-950'} fs-6 fs-xxl-13 px-3`} style={{ lineHeight: 'normal', height: '60px', width: 'calc(100% - 20px)' }}>
                                        Generate {page_number === 2 ? <IconHourGlass /> : null}
                                    </button>
                                    <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                    {page_number === 2 ? <>
                                        <div className="d-flex justify-content-center align-items-center gap-1">
                                            <button className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950">Pause <IconPause /></button>
                                            <button className="fs-6 fs-xxl-15 bg-green-960 border border-0 py-2 px-2 text-light-green-950">Stop <IconStop /></button>
                                        </div>
                                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                    </> : null}
                                    {page_number === 3 ? <>
                                        <div className="row justify-content-around px-3">
                                            <button className='text-center text-white bg-black border border-0 fs-7 mb-2' style={{ width: '75px', height: '75px' }} aria-label="Like">
                                                <IconEdit />
                                                <div>LIKE</div>
                                            </button>
                                            <button className='text-center text-white bg-black border border-0 fs-7 mb-2' style={{ width: '75px', height: '75px' }} aria-label="Reply">
                                                <IconReply />
                                                <div>REPLY</div>
                                            </button>
                                            <button className='text-center text-white bg-black border border-0 fs-7' style={{ width: '75px', height: '75px' }} aria-label="Retweet">
                                                <IconRetweet />
                                                <div>RETWEET</div>
                                            </button>
                                            <button className='text-center text-white bg-danger border border-0 fs-7' style={{ width: '75px', height: '75px' }} aria-label="Delete">
                                                <IconTrash />
                                                <div>DELETE</div>
                                            </button>
                                        </div>
                                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                                    </> : null}
                                </div>
                            </div>
                            {page_number === 3 ? null : <TableMiningProgress container_height="86vh" />}
                            {page_number === 3 ? <TableMiningProgress container_height="86vh" table={<MessageTable height="58vh" data={TableData.message_table} />} /> : null}
                        </div>
                    </WalletGuard>
                </div>
            </div>
        </div>
    );
}

export default GenerateMeme;
