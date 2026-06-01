import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  Award, 
  MessageSquare, 
  Bookmark, 
  User, 
  Settings,
  Sparkles,
  Shield,
  Server,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const getDashboardPath = () => {
    if (user?.role === 'instructor') return '/instructor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const navLinks = [
    { name: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
    { name: 'Browse Courses', path: '/courses', icon: BookOpen },
    { name: 'My Courses', path: getDashboardPath(), icon: GraduationCap },
    { name: 'Quizzes', path: '/quizzes', icon: ClipboardList },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Discussions', path: '/discussions', icon: MessageSquare },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <div className="p-4 h-full hidden md:block relative z-30">
      <div className={cn(
        "glass w-64 h-[calc(100vh-2rem)] space-y-6 py-6 px-4",
        "flex flex-col justify-between",
        "rounded-[2rem] shadow-2xl border border-white/10"
      )}>
        <div>
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-1 px-4 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles size={19} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">AIPS LMS</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-11">Learn. Track. Grow.</span>
          </div>
          
          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-600/20 text-white border border-blue-500/20 shadow-lg shadow-blue-500/5"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={17} className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                  )} />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Bottom AI Card */}
        <div className="px-2">
          <div className="glass p-4 rounded-2xl flex flex-col gap-2 border border-white/5 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">AIPS LMS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Your AI-powered learning companion.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
