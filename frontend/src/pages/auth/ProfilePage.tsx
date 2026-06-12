import * as React from 'react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  User, 
  Mail, 
  FileText, 
  MapPin, 
  Globe, 
  Lock, 
  Bell, 
  Camera, 
  Moon, 
  CheckCircle,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  // Settings states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Full name cannot be empty', 'error');
      return;
    }

    // Update in global authStore
    if (user) {
      setUser({
        ...user,
        full_name: fullName,
      });
    }

    addToast('Profile changes saved successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    addToast('Password updated successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 relative z-20">
      
      {/* Toast Alert Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="pointer-events-auto"
            >
              <div className="glass p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 bg-black/40 backdrop-blur-xl max-w-sm">
                <CheckCircle size={20} className={toast.type === 'success' ? "text-emerald-400" : "text-red-400"} />
                <p className="text-sm font-semibold text-white">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-white/10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
            Profile Studio
          </h1>
          <p className="text-slate-300 mt-2 text-base">Manage your personal information, settings and preferences.</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="glass p-3 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Display */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="glass-card p-6 flex flex-col items-center text-center">
            {/* Glowing Avatar Wrapper */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Profile" 
                  className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 relative z-10"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-500/30 relative z-10 shadow-inner">
                  {fullName ? fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : 'VS'}
                </div>
              )}
            </div>

            <h2 className="mt-5 text-xl font-bold text-white tracking-wide">{fullName}</h2>
            <p className="text-xs font-semibold text-blue-400 mt-1 capitalize uppercase tracking-widest">{user?.role || 'Learner'}</p>

            {/* Metadata Card */}
            <div className="mt-6 w-full py-4 border-t border-white/5 text-left flex justify-between items-center text-xs text-slate-400">
              <span>Member since</span>
              <span className="font-bold text-white">June 2025</span>
            </div>
          </Card>
        </div>

        {/* Right Side: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card p-8">
            <form onSubmit={handleSaveChanges} className="space-y-6">
              
              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <Input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="apple-input w-full !pl-10" 
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="Your Name"
                    />
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Email (Read only) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Input 
                      type="email" 
                      value={email} 
                      readOnly
                      className="apple-input w-full !pl-10 opacity-60 cursor-not-allowed bg-black/20" 
                      style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
                    />
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <Lock size={14} className="absolute right-3.5 top-4 text-slate-500" />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <Input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="apple-input w-full !pl-10" 
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="City, Country"
                    />
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                  <div className="relative">
                    <Input 
                      type="url" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="apple-input w-full !pl-10" 
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="https://..."
                    />
                    <Globe size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio Description</label>
                <div className="relative">
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="apple-input w-full !pl-10 resize-none"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Tell us about yourself..."
                  />
                  <FileText size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="gradient"
                  className="w-full btn-premium py-3 text-sm font-semibold rounded-2xl"
                >
                  Save Changes
                </Button>
              </div>

            </form>
          </Card>
        </div>

      </div>

      {/* Preferences & Password Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Change Password Trigger */}
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/15 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Security</p>
              <p className="text-[10px] text-slate-500">Change your account password</p>
            </div>
          </div>
          <span className="text-slate-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>

        {/* Notifications Preference */}
        <button 
          onClick={() => {
            setEmailNotifications(!emailNotifications);
            addToast(`Email alerts ${!emailNotifications ? 'enabled' : 'disabled'}`);
          }}
          className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/15 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-[10px] text-slate-500">Manage email alerts & triggers</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase">{emailNotifications ? 'On' : 'Off'}</span>
        </button>

        {/* Dark Mode toggle */}
        <div className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Moon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dark Mode</p>
              <p className="text-[10px] text-slate-500">Toggle dark visual appearance</p>
            </div>
          </div>
          {/* Custom Toggle Switch */}
          <button 
            onClick={() => {
              setDarkMode(!darkMode);
              addToast(`Premium Dark Mode is locked by system default.`);
            }}
            className={cn(
              "w-11 h-6 rounded-full p-0.5 transition-colors duration-300",
              darkMode ? "bg-blue-600" : "bg-slate-700"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md",
              darkMode ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>

      </div>

      {/* Password Modal Popup */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">Update Password</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                <Input 
                  type="password"
                  value={currentPassword}
                  onChange={(e)=>setCurrentPassword(e.target.value)}
                  className="apple-input w-full"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e)=>setNewPassword(e.target.value)}
                  className="apple-input w-full"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  className="apple-input w-full"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="glass" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="gradient"
                  className="flex-1 btn-premium"
                >
                  Save Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
