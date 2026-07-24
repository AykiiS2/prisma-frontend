import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, BarChart3, Send, GraduationCap, Settings, 
  Crown, Sparkles, X, MailCheck
} from 'lucide-react';
import logoImage from '../../assets/losango - prisma.png';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { icon: Briefcase, label: 'Opportunities', path: '/dashboard' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Send, label: 'Send Message', path: '/messages' },
  { icon: GraduationCap, label: 'Tutorial', path: '/tutorial' },
  { icon: MailCheck, label: 'Feedback', path: '/feedback' },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo-link" onClick={handleLinkClick}>
            <img src={logoImage} alt="Prisma" className="sidebar-logo-image" />
            Prisma
          </NavLink>
          <button className="sidebar-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon size={20} className="sidebar-item-icon" />
              <span className="sidebar-item-label">{item.label}</span>
              {index === 0 && <Sparkles size={12} className="sidebar-sparkle" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/plans" className="sidebar-upgrade" onClick={handleLinkClick}>
            <div className="sidebar-upgrade-content">
              <div className="sidebar-upgrade-icon">
                <Crown size={18} />
              </div>
              <div>
                <span className="sidebar-upgrade-title">Upgrade to Pro</span>
                <span className="sidebar-upgrade-subtitle">Access all features</span>
              </div>
              <Sparkles size={14} className="sidebar-upgrade-sparkle" />
            </div>
          </NavLink>
        </div>
      </aside>

      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={handleClose} />
    </>
  );
}
