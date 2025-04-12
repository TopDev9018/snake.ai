
function RoadmapPage() {
    return (
        <div className="w-100 border border-5 border-black w-100 p-3" style={{ minHeight: "84vh" }}>
            <div className="text-uppercase text-black fs-1 fs-lg-4 fs-xl-4 fw-bolder pt-3 pb-5 px-3">ROADMAP</div>
            <div className="d-flex justify-content-center align-items-center pt-lg-5">
                <div className="roadmap-container gap-3 gap-lg-5">
                    <div className="phase-container position-relative mb-5">
                        <div className="w-90 d-flex justify-content-center align-items-center position-absolute top-0 start-50 translate-middle">
                            <div className="phase-title">PHASE 1</div>
                        </div>
                        <div className="phase-box text-center border border-5 border-black p-3">
                            Token creation & simplified mining
                        </div>
                    </div>
                    <div className="phase-container position-relative mb-5">
                        <div className="w-90 d-flex justify-content-center align-items-center position-absolute top-0 start-50 translate-middle">
                            <div className="phase-title">PHASE 2</div>
                        </div>
                        <div className="phase-box text-center border border-5 border-black p-3">
                            Public launch & viral activation
                        </div>
                    </div>
                    <div className="phase-container position-relative mb-5">
                        <div className="w-90 d-flex justify-content-center align-items-center position-absolute top-0 start-50 translate-middle">
                            <div className="phase-title">PHASE 3</div>
                        </div>
                        <div className="phase-box text-center border border-5 border-black p-3">
                            DAO Governance & Game Studio
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoadmapPage;
