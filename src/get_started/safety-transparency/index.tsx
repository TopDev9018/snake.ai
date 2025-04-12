
import { ReactComponent as IconLock } from "../../svgs/lock.svg";

function SafetyTransparencyPage() {
    return (
        <div className="w-100 border border-5 border-black w-100 p-2" style={{ minHeight: "84vh" }}>
            <div className="text-uppercase text-black fs-1 fs-lg-6 fs-xl-5 fw-bolder p-3" style={{ lineHeight: 'normal' }}>Safety & Transparency</div>
            <div className="row d-flex justify-content-center align-items-center px-3 pt-3 column-reverse">
                <div className="col-md-7 px-2">
                    <div className="px-1 py-1">
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>
                    <div className="d-flex justify-content-start align-items-center gap-3">
                        <div className="custom-checkbox-container">
                            <input type="checkbox" className="custom-checkbox" id="fully_automated" />
                            <label htmlFor="fully_automated" className="custom-label"></label>
                        </div>
                        <span className="fs-6 fs-lg-11 fs-xl-12 fw-bolder" style={{ lineHeight: 'normal' }}>Fully audited smart contracts (by CertiK/OtterSec)</span>
                    </div>
                    <div className="px-1">
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>
                    <div className="d-flex justify-content-start align-items-center gap-3">
                        <div className="custom-checkbox-container">
                            <input type="checkbox" className="custom-checkbox" id="alocked_liquidity_pools" />
                            <label htmlFor="alocked_liquidity_pools" className="custom-label"></label>
                        </div>
                        <span className="fs-6 fs-lg-11 fs-xl-11 fw-bolder" style={{ lineHeight: 'normal' }}>aLocked Liquidity pools (12-month lock minimum)</span>
                    </div>
                    <div className="px-1">
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>
                    <div className="d-flex justify-content-start align-items-center gap-3">
                        <div className="custom-checkbox-container">
                            <input type="checkbox" className="custom-checkbox" id="burn_vesting_schedule" />
                            <label htmlFor="burn_vesting_schedule" className="custom-label"></label>
                        </div>
                        <span className="fs-6 fs-lg-11 fs-xl-11 fw-bolder" style={{ lineHeight: 'normal' }}>Transparent token burn and vesting schedule</span>
                    </div>
                    <div className="px-1">
                        <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                    </div>
                </div>
                <div className="col-md-5 align-self-end d-flex justify-content-center align-items-center">
                    <IconLock className="lock-size" style={{ width: '40vh' }} />
                </div>
            </div>
        </div>
    );
}

export default SafetyTransparencyPage;
