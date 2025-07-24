
import { ReactComponent as IconHeart } from "../svgs/heart-solid.svg";

function LandingHeader() {
    return (
        <div className="w-100 pt-2 px-2 px-md-4 px-lg-4" style={{ height: '10vh' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom border-black border-4 h-100">
                <div className="d-flex justify-content-start align-items-center gap-1">
                    <IconHeart style={{ width: '5vh' }} />
                    <IconHeart style={{ width: '5vh' }} />
                    <IconHeart style={{ width: '5vh' }} />
                </div>
                <div className="d-flex justify-content-start align-items-center gap-2" style={{ height: '6vh' }}>
                    <div className="border border-5 border-black h-75" style={{ width: "30px" }}></div>
                    <div className="border border-5 border-black h-75" style={{ width: "30px" }}></div>
                    <div className="border border-5 border-black h-75" style={{ width: "30px" }}></div>
                    <div className="border border-5 border-black h-75" style={{ width: "30px" }}></div>
                </div>
            </div>
        </div>
    );
}

export default LandingHeader;
