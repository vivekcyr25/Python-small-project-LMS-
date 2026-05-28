import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 p-4">
      <div className={cn(
        "max-w-7xl mx-auto py-3 px-6 flex justify-between items-center",
        "glass rounded-2xl shadow-lg border border-white/10"
      )}>
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          {user?.role && (
            <Badge variant="premium" className="capitalize">
              {user.role}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name ? getInitials(user.full_name) : <UserIcon size={16} />}
            </div>
            <span className="text-sm font-medium text-white hidden md:inline">
              {user?.full_name || 'User'}
            </span>
          </div>
          
          <Button variant="glass" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
