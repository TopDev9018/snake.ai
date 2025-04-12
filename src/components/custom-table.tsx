import { ReactComponent as IconLike } from '../svgs/heart-regular.svg';
import { ReactComponent as IconReply } from '../svgs/refresh.svg';
import { ReactComponent as IconRetweet } from '../svgs/repost.svg';
import { ReactComponent as IconTrash } from '../svgs/trash.svg';

interface TableProps {
    height?: string;
    title: string;
    data: Array<{ text: string; date: string }>;
    action_icons: Array<'like' | 'reply' | 'retweet' | 'delete'>;
}

function CustomTable({ height = '38vh', title, data, action_icons }: TableProps) {
    return (
        <div className="">
            <div className="fs-1 mb-2" style={{ lineHeight: 'normal' }}>{title}</div>
            <div className='table-container' style={{ height: `${height}`, overflowY: 'scroll' }}>
                {data.length === 0 ? (
                    <div className="fs-3 text-center p-3 border border-1">No Data</div>
                ) : (
                    data.map((item, index) => {
                        const { text, date } = item;
                        return (
                            <div className="d-flex justify-content-between align-items-center gap-2" key={index}>
                                <div className="item-data">
                                    <div className="px-2 fs-7 fs-lg-13 fs-xl-14 fs-xxl-16 fw-bolder">{text}</div>
                                    <div className="px-3 fs-8 fs-lg-14 fs-xl-15 fs-xxl-17">{date}</div>
                                </div>
                                <div className="item-actions d-flex justify-content-between gap-1 mb-1 px-2">
                                    {action_icons.includes("like") && (
                                        <button className='text-center text-white bg-black border border-0 rounded-1 fs-7 icon-button' aria-label="Like">
                                            <IconLike />
                                            <span className='icon-text'>LIKE</span>
                                        </button>
                                    )}
                                    {action_icons.includes('reply') && (
                                        <button className='text-center text-white bg-black border border-0 rounded-1 fs-7 icon-button' aria-label="Reply">
                                            <IconReply />
                                            <span className='icon-text'>REPLY</span>
                                        </button>
                                    )}
                                    {action_icons.includes('retweet') && (
                                        <button className='text-center text-white bg-black border border-0 rounded-1 fs-7 icon-button' aria-label="Retweet">
                                            <IconRetweet />
                                            <span className='icon-text'>RETWEET</span>
                                        </button>
                                    )}
                                    {action_icons.includes('delete') && (
                                        <button className='text-center text-white bg-danger border border-0 rounded-1 fs-7 icon-button' aria-label="Delete">
                                            <IconTrash />
                                            <span className='icon-text'>DELETE</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CustomTable;
