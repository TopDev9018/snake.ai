
import { ReactComponent as IconSmallLogo } from "../svgs/logo-small.svg";
import { useAuth } from "../contexts/AuthContext";

function MainHeader() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <>
            <div style={{ height: '10vh' }}></div>
            <div className="main-header d-flex fixed-top justify-content-between align-items-center border-bottom border-5 border-black bg-black w-100 pt-2 px-2 px-md-4 px-lg-4 shadow-bottom" style={{ height: '10vh' }}>
                <div className="d-flex justify-content-start align-items-center gap-2">
                    <IconSmallLogo className="fs-1" />
                    <span className="fs-1 fs-lg-7 fs-xl-7 text-white main-header-title">SNAKE.AI</span>
                </div>
                <div className="d-flex justify-content-end align-items-center gap-3 h-100 px-2">
                    {isAuthenticated ? (
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-white">Welcome, {user?.twitter_username || 'User'}!</span>
                            <button 
                                onClick={logout}
                                className="border border-0 fs-6 fw-bold py-1 px-2 text-decoration-none text-center" 
                                style={{ backgroundColor: "#ff4444", color: "white" }}
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <a href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1'}/login`} className="border border-0 fs-4 fw-bold py-2 px-3 text-decoration-none text-center" style={{ backgroundColor: "#A9E000", color: "black" }}>GET STARTED</a>
                    )}
                </div>
            </div>
        </>
    );
}

export default MainHeader;
