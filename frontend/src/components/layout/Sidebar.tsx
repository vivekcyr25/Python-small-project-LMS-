import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Users, 
  GraduationCap, 
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Browse Courses', path: '/courses', icon: BookOpen },
  ];

  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/dashboard', icon: GraduationCap },
    { name: 'Create Course', path: '/courses/new', icon: PlusCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Courses', path: '/courses', icon: BookOpen },
    { name: 'Users', path: '/admin/users', icon: Users }, // Placeholder path
  ];

  let links = studentLinks;
  let roleIcon = <GraduationCap size={16} />;
  
  if (user?.role === 'instructor') {
    links = instructorLinks;
    roleIcon = <Sparkles size={16} />;
  } else if (user?.role === 'admin') {
    links = adminLinks;
    roleIcon = <Shield size={16} />;
  }

  return (
    <div className="p-4 h-full hidden md:block">
      <div className={cn(
        "glass w-64 h-[calc(100vh-2rem)] space-y-6 py-6 px-4",
        "flex flex-col justify-between",
        "rounded-[2rem] shadow-2xl border border-white/10"
      )}>
        <div>
          <div className="flex items-center gap-2 px-4 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Aurora LMS</span>
          </div>
          
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 group",
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={18} className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-white"
                  )} />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="px-2">
          <div className="glass p-4 rounded-2xl flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              {roleIcon}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
              <Badge variant="neutral" className="mt-0.5 text-[10px] py-0 px-1.5 bg-white/5 capitalize">
                {user?.role || 'Guest'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
