import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Badge } from '../ui/badge';
import {
  LogOut,
  User as UserIcon,
  Settings,
  Award,
  Edit3,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 p-3">
      <div
        className={cn(
          'max-w-7xl mx-auto py-2.5 px-5 flex justify-between items-center',
          'glass rounded-ios shadow-ios-glass',
        )}
      >
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold text-ios-text tracking-tight">AIPS Studio</h1>
          {user?.role && (
            <Badge variant="premium" className="capitalize text-[10px] tracking-wide px-2 py-0.5">
              {user.role}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1">
            <button className="p-2 rounded-[12px] text-ios-text-secondary hover:text-ios-text hover:bg-white/[0.06] transition-all duration-300 ease-ios">
              <Search size={17} />
            </button>
            <button className="p-2 rounded-[12px] text-ios-text-secondary hover:text-ios-text hover:bg-white/[0.06] transition-all duration-300 ease-ios relative">
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-ios-accent rounded-full" />
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1 px-2 rounded-[14px] hover:bg-white/[0.06] transition-all duration-300 ease-ios"
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.full_name || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-ios-accent to-ios-accent-deep flex items-center justify-center text-white font-medium text-xs">
                  {user?.full_name ? getInitials(user.full_name) : <UserIcon size={14} />}
                </div>
              )}
              <span className="text-[13px] font-medium text-ios-text hidden md:inline">
                {user?.full_name || 'User'}
              </span>
              <ChevronDown size={13} className="text-ios-text-secondary hidden md:inline" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute right-0 mt-2 w-72 glass-card rounded-ios p-3 flex flex-col gap-2 z-50"
                >
                  <div className="flex items-center gap-3 pb-2.5 border-b border-white/[0.06]">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.full_name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-white/15"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-b from-ios-accent to-ios-accent-deep flex items-center justify-center text-white font-medium">
                        {user?.full_name ? getInitials(user.full_name) : <UserIcon size={18} />}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-semibold text-ios-text truncate">{user?.full_name || 'User'}</p>
                      <p className="text-[11px] text-ios-text-secondary truncate">{user?.email || 'user@aips.lms'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    {[
                      { to: '/profile', icon: UserIcon, title: 'My Profile', desc: 'View & edit profile' },
                      { to: '/profile', icon: Edit3, title: 'Edit Profile', desc: 'Name, email, bio' },
                      { to: '/profile', icon: Settings, title: 'Settings', desc: 'Preferences & security' },
                      { to: '/certificates', icon: Award, title: 'Certificates', desc: 'Earned awards' },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-[12px] text-ios-text-secondary hover:bg-white/[0.05] hover:text-ios-text transition-all duration-300 ease-ios group"
                      >
                        <item.icon size={15} className="text-ios-text-secondary group-hover:text-ios-accent" />
                        <div>
                          <p className="text-[12px] font-medium">{item.title}</p>
                          <p className="text-[10px] text-ios-text-secondary/70">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 p-2 mt-1 border border-ios-red/20 bg-ios-red/5 hover:bg-ios-red/10 text-ios-red text-[12px] font-medium rounded-[12px] transition-all duration-300 ease-ios"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
