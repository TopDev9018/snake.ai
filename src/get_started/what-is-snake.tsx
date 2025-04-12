
import { ReactComponent as IconRocket } from "../svgs/rocket-small.svg";

function WhatIsSnakePage() {
    return (
        <div className="d-flex justify-content-center align-items-center border border-5 border-black w-100 p-3" style={{ minHeight: "84vh" }}>
            <div className="row">
                <div className="d-flex flex-column flex-md-row justify-content-end align-items-center col-md-4">
                    <IconRocket style={{ transform: 'rotate(30deg)', width: '30vh', height: '30vh' }} />
                </div>
                <div className="text-center col-md-7">
                    <div className="fs-4 fs-lg-5 fs-xl-5 fw-bold mb-4" style={{ lineHeight: 'normal' }}>What is SNAKE.AI?</div>
                    <span className="fs-5 fs-lg-10 fs-xl-10 text-center w-75" style={{ lineHeight: 'normal' }}><b>SNAKE.AI</b> is the world’s first meme-fuelled, deflationary token ecosystem built on Solana, inspired by the legendary Nokia Snake game. Tweet, mine tokens, and be part of a viral cultural moment.
                    </span>
                </div>
            </div>
        </div>
    );
}

export default WhatIsSnakePage;
