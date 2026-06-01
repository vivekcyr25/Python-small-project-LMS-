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
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

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

  // Close dropdown on outside click
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
    <header className="sticky top-0 z-50 p-4">
      <div className={cn(
        "max-w-7xl mx-auto py-3 px-6 flex justify-between items-center",
        "glass rounded-2xl shadow-lg border border-white/10"
      )}>
        {/* Left Side: Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-white tracking-wide">AIPS Studio</h1>
          {user?.role && (
            <Badge variant="premium" className="capitalize text-[10px] tracking-wider px-2 py-0.5">
              {user.role}
            </Badge>
          )}
        </div>
        
        {/* Right Side Controls */}
        <div className="flex items-center space-x-5">
          {/* Mock Search & Notification */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Search size={18} />
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
          </div>

          {/* User Profile Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-1 px-2 rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.full_name || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name ? getInitials(user.full_name) : <UserIcon size={16} />}
                </div>
              )}
              <span className="text-sm font-semibold text-white hidden md:inline">
                {user?.full_name || 'User'}
              </span>
              <ChevronDown size={14} className="text-slate-400 hidden md:inline" />
            </button>

            {/* Dropdown Menu Overlay */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 glass-card bg-[#0b1329] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                {/* User Header Profile Card */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  {user?.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {user?.full_name ? getInitials(user.full_name) : <UserIcon size={20} />}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || 'user@aips.lms'}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      AIPS Learner
                    </span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="flex flex-col gap-1.5">
                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                  >
                    <UserIcon size={16} className="text-slate-400 group-hover:text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold">My Profile</p>
                      <p className="text-[10px] text-slate-500">View & edit your profile</p>
                    </div>
                  </Link>

                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                  >
                    <Edit3 size={16} className="text-slate-400 group-hover:text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold">Edit Profile</p>
                      <p className="text-[10px] text-slate-500">Name, email, bio, avatar</p>
                    </div>
                  </Link>

                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                  >
                    <Settings size={16} className="text-slate-400 group-hover:text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold">Account Settings</p>
                      <p className="text-[10px] text-slate-500">Preferences & security</p>
                    </div>
                  </Link>

                  <Link 
                    to="/certificates" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                  >
                    <Award size={16} className="text-slate-400 group-hover:text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold">My Certificates</p>
                      <p className="text-[10px] text-slate-500">Earned awards and prints</p>
                    </div>
                  </Link>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 mt-1 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl transition-all"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
