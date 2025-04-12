
import { useNavigate } from "react-router-dom";
import { ReactComponent as IconLeftLogo } from "../svgs/logo-left.svg";

function MainLanding() {
    const navigate = useNavigate()
    return (
        <div className="d-flex justify-content-center align-items-center border border-5 border-black w-100 p-3" style={{ height: "82vh" }}>
            <div className="w-100">
                <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-4 w-100">
                    <IconLeftLogo style={{ width: '30vh', height: '30vh' }} />
                    <span className="fs-1 fs-lg-1 fs-xl-1">SNAKE.AI</span>
                </div>
                <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 mb-4 w-100">
                    <button onClick={() => navigate('/get-started')} className="bg-green-900 text-green-200 border border-0 fs-1" style={{ width: "270px", height: "70px" }}>ENTER</button>
                </div>
            </div>
        </div>
    );
}

export default MainLanding;
