
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ReactComponent as IconLeftLogo } from "../../svgs/logo-left.svg";

function MainLanding() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    
    if (isAuthenticated) {
        return (
            <div className="d-flex justify-content-center align-items-center border border-5 border-black w-100 p-3" style={{ height: "82vh" }}>
                <div className="w-100 text-center">
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-4 w-100">
                        <IconLeftLogo style={{ width: '20vh', height: '20vh' }} />
                        <span className="fs-1 fs-lg-1 fs-xl-1">SNAKE.AI</span>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-success">✅ Welcome back, {user?.twitter_username}!</h2>
                        <p className="fs-4">Redirecting to dashboard...</p>
                    </div>
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 w-100">
                        <button onClick={() => navigate('/home')} className="btn btn-primary fs-3" style={{ width: "200px", height: "60px" }}>GO TO DASHBOARD</button>
                        <button onClick={() => navigate('/patron-framework')} className="btn btn-warning fs-3" style={{ width: "200px", height: "60px" }}>PATRON FRAMEWORK</button>
                        <button onClick={() => navigate('/tweet-mining')} className="btn btn-success fs-3" style={{ width: "200px", height: "60px" }}>TWEET MINING</button>
                    </div>
                </div>
            </div>
        );
    }

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
