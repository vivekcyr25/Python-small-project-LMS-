import * as React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LiquidGlassShader from '../effects/LiquidGlassShader';
import { motion } from 'framer-motion';
import { Shield, Server, FileText } from 'lucide-react';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-[#080a14] text-ios-text overflow-hidden relative font-sf">
      <LiquidGlassShader />

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 md:p-6 relative z-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col min-h-[calc(100vh-8rem)] justify-between">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-1"
            >
              <Outlet />
            </motion.div>

            <footer className="mt-12 mb-4 space-y-6 z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/privacy" className="block group">
                  <div className="glass-card p-5 h-full flex flex-col items-center text-center md:items-start md:text-left gap-3">
                    <div className="w-11 h-11 rounded-ios bg-ios-accent/15 flex items-center justify-center text-ios-accent group-hover:scale-105 transition-transform duration-500 ease-ios">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-ios-text tracking-wide">Privacy Policy</h3>
                      <ul className="mt-2 space-y-1 text-[11px] text-ios-text-secondary">
                        <li>User data protection</li>
                        <li>Secure authentication</li>
                        <li>Privacy-first approach</li>
                      </ul>
                    </div>
                  </div>
                </Link>

                <Link to="/sources" className="block group">
                  <div className="glass-card p-5 h-full flex flex-col items-center text-center md:items-start md:text-left gap-3">
                    <div className="w-11 h-11 rounded-ios bg-ios-purple/15 flex items-center justify-center text-ios-purple group-hover:scale-105 transition-transform duration-500 ease-ios">
                      <Server size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-ios-text tracking-wide">Sources & Infrastructure</h3>
                      <ul className="mt-2 space-y-1 text-[11px] text-ios-text-secondary">
                        <li>Firebase Auth & Firestore</li>
                        <li>Cloud Storage & YouTube</li>
                        <li>AI Core Integration</li>
                      </ul>
                    </div>
                  </div>
                </Link>

                <Link to="/terms" className="block group">
                  <div className="glass-card p-5 h-full flex flex-col items-center text-center md:items-start md:text-left gap-3">
                    <div className="w-11 h-11 rounded-ios bg-ios-green/15 flex items-center justify-center text-ios-green group-hover:scale-105 transition-transform duration-500 ease-ios">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-ios-text tracking-wide">Terms of Service</h3>
                      <ul className="mt-2 space-y-1 text-[11px] text-ios-text-secondary">
                        <li>Educational platform rules</li>
                        <li>Acceptable use guidelines</li>
                        <li>Community standards</li>
                      </ul>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/[0.06] text-[11px] text-ios-text-secondary gap-2">
                <p>&copy; 2026 AIPS LMS</p>
                <p className="font-medium tracking-wide text-ios-text-secondary/60">Learn. Track. Grow.</p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
