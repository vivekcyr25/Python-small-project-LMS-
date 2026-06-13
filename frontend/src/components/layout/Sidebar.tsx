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
} from 'lucide-react';
import { cn } from '../../lib/utils';

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
    <div className="p-3 h-full hidden md:block relative z-30">
      <div
        className={cn(
          'glass w-[260px] h-[calc(100vh-1.5rem)] flex flex-col justify-between',
          'rounded-ios-lg py-5 px-3',
        )}
      >
        <div>
          <div className="flex flex-col gap-0.5 px-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[14px] bg-gradient-to-b from-ios-accent to-ios-accent-deep flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-[17px] font-semibold text-ios-text tracking-tight">AIPS LMS</span>
            </div>
            <span className="text-[10px] tracking-wide text-ios-text-secondary font-medium ml-[46px]">
              Learn. Track. Grow.
            </span>
          </div>

          <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-16rem)] pr-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 py-2.5 px-3 rounded-[14px] transition-all duration-500 ease-ios group',
                    isActive
                      ? 'bg-white/10 text-ios-text shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-ios-text-secondary hover:bg-white/[0.04] hover:text-ios-text',
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      'transition-all duration-300',
                      isActive ? 'text-ios-accent' : 'text-ios-text-secondary group-hover:text-ios-text',
                    )}
                  />
                  <span className="text-[13px] font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-1">
          <div className="glass-pill p-4 flex flex-col gap-1.5 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-ios-accent" />
              <span className="text-[10px] font-semibold text-ios-text tracking-wide">AI Companion</span>
            </div>
            <p className="text-[11px] text-ios-text-secondary leading-relaxed">
              Your intelligent learning assistant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
