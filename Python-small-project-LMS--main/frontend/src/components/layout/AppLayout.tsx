import * as React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Shield, Server, FileText } from 'lucide-react';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-[#02040a] text-white overflow-hidden relative">
      {/* Animated Deep Space Background (GPU-optimized) */}
      <div className="space-container">
        <div className="space-stars"></div>
        <div className="space-nebula"></div>
        <div className="space-dust"></div>
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col min-h-[calc(100vh-8rem)] justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <Outlet />
            </motion.div>
            
            {/* Premium Responsive Apple Glass Footer */}
            <footer className="mt-16 mb-6 space-y-8 z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Privacy Policy Section */}
                <Link to="/privacy" className="block group">
                  <div className="glass-card p-6 h-full border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Privacy Policy</h3>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                        <li>• User data protection</li>
                        <li>• Secure authentication</li>
                        <li>• Privacy-first approach</li>
                        <li>• Educational use transparency</li>
                      </ul>
                    </div>
                  </div>
                </Link>

                {/* 2. Sources & Infrastructure Section */}
                <Link to="/sources" className="block group">
                  <div className="glass-card p-6 h-full border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-300">
                      <Server size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Sources & Infrastructure</h3>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                        <li>• Firebase Auth & Firestore</li>
                        <li>• Cloud Storage & YouTube</li>
                        <li>• AI Core Integration</li>
                        <li>• Secure Cloud Infrastructure</li>
                      </ul>
                    </div>
                  </div>
                </Link>

                {/* 3. Terms of Service Section */}
                <Link to="/terms" className="block group">
                  <div className="glass-card p-6 h-full border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Terms of Service</h3>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                        <li>• Educational platform rules</li>
                        <li>• Acceptable use guidelines</li>
                        <li>• Student responsibilities</li>
                        <li>• Community standards</li>
                      </ul>
                    </div>
                  </div>
                </Link>

              </div>

              {/* Copyright Row */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-white/5 text-[11px] text-slate-500 gap-3">
                <p>&copy; 2026 AIPS LMS. All rights reserved.</p>
                <p className="font-medium tracking-wider uppercase text-slate-600">Learn. Track. Grow.</p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
