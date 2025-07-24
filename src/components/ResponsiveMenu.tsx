import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import { ReactComponent as IconHome } from "../svgs/menu/home.svg";
import { ReactComponent as IconProfile } from "../svgs/menu/profile.svg";
import { ReactComponent as IconClaim } from "../svgs/menu/claim.svg";
import { ReactComponent as IconStaking } from "../svgs/menu/staking.svg";
import { ReactComponent as IconSwap } from "../svgs/menu/swap.svg";
import { ReactComponent as IconDao } from "../svgs/menu/dao.svg";
import { ReactComponent as IconMining } from "../svgs/menu/mining.svg";
import { ReactComponent as HamburgerIcon } from "../svgs/hamburger.svg";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: "home", label: "Home", icon: IconHome, path: "/home" },
  { id: "profile", label: "Profile", icon: IconProfile, path: "/profile" },
  { id: "mining", label: "Mining", icon: IconMining, path: "/tweet-mining" },
  // { id: "meme", label: "Memes", icon: IconProfile, path: "/meme-generation" },
  // { id: "roles", label: "Roles", icon: IconProfile, path: "/patron-framework/roles" },
  { id: "staking", label: "Staking", icon: IconStaking, path: "/staking" },
  { id: "claim", label: "Claim", icon: IconClaim, path: "/claim" },
  { id: "swap", label: "Swap", icon: IconSwap, path: "/swap" },
  // { id: "mining-status", label: "Mining Status", icon: IconMining, path: "/patron-framework/mining" },
  { id: "patron", label: "Patron", icon: IconDao, path: "/patron-framework/application" },
];

interface ResponsiveMenuProps {
  className?: string;
}

function ResponsiveMenu({ className = "" }: ResponsiveMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Desktop Menu
  const DesktopMenu = () => (
    <div className="custom-menu d-none d-md-block">
      <div className="w-100">
        <div className="fs-1 text-center" style={{ lineHeight: 'normal' }}>MENU</div>
      </div>
      <div className="custom-border-y custom-content-height d-flex align-items-center">
        <div className="w-100 text-center custom-border d-flex align-items-center justify-content-center" style={{ height: '98%' }}>
          <div className="w-100">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={item.id}
                  className="menu-item-container"
                  onClick={() => handleMenuClick(item.path)}
                  style={{
                    opacity: isActive(item.path) ? 1 : 0.5,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <IconComponent 
                    className="py-3" 
                    style={{ maxWidth: '57%', height: 'auto' }} 
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <button
      className="d-md-none btn p-2 mobile-menu-button"
      onClick={toggleMobileMenu}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'black',
        color: '#A9E000',
        border: '2px dashed #A9E000',
        borderRadius: '8px'
      }}
    >
      <HamburgerIcon width="24" height="24" />
    </button>
  );

  // Mobile Dropdown Menu
  const MobileDropdownMenu = () => (
    <div
      className={`mobile-dropdown-menu d-md-none ${isMobileMenuOpen ? 'show' : ''}`}
      style={{
        position: 'fixed',
        top: '70px',
        left: '20px',
        backgroundColor: 'black',
        border: '2px solid #A9E000',
        borderRadius: '8px',
        zIndex: 999,
        minWidth: '200px',
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
        opacity: isMobileMenuOpen ? 1 : 0,
        visibility: isMobileMenuOpen ? 'visible' : 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="p-3">
        <div className="text-center mb-3" style={{ color: '#A9E000', fontSize: '1.2rem', fontWeight: 'bold' }}>
          MENU
        </div>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="mobile-menu-item d-flex align-items-center p-2 mb-2"
              onClick={() => handleMenuClick(item.path)}
              style={{
                opacity: isActive(item.path) ? 1 : 0.5,
                cursor: 'pointer',
                backgroundColor: isActive(item.path) ? '#A9E000' : 'transparent',
                color: isActive(item.path) ? 'black' : '#A9E000',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <IconComponent 
                width="24" 
                height="24" 
                className="me-2"
                style={{ fill: 'currentColor' }}
              />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />
      
      {/* Mobile Dropdown Menu */}
      <MobileDropdownMenu />
      
      {/* Desktop Menu */}
      <DesktopMenu />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay d-md-none"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}
    </>
  );
}

export default ResponsiveMenu;