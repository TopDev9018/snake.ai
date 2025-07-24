
import { ReactComponent as IconHome } from "../svgs/menu/home.svg";
import { ReactComponent as IconProfile } from "../svgs/menu/profile.svg";
import { ReactComponent as IconClaim } from "../svgs/menu/claim.svg";
import { ReactComponent as IconStaking } from "../svgs/menu/staking.svg";
import { ReactComponent as IconSwap } from "../svgs/menu/swap.svg";
import { ReactComponent as IconDao } from "../svgs/menu/dao.svg";

function Menu() {
    return (
        <div className="custom-menu">
            <div className="w-100">
                <div className="fs-1 text-center" style={{ lineHeight: 'normal' }}>MENU</div>
            </div>
            <div className="custom-border-y custom-content-height d-flex align-items-center" >
                <div className="w-100 text-center custom-border d-flex align-items-center justify-content-center" style={{ height: '98%' }}>
                    <div className="w-100">
                        <div>
                            <IconHome className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                        <div>
                            <IconProfile className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                        <div>
                            <IconClaim className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                        <div>
                            <IconStaking className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                        <div>
                            <IconSwap className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                        <div>
                            <IconDao className="py-3" style={{ maxWidth: '57%', height: 'auto' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu;