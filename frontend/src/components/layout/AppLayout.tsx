import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden aurora-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
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
            
            {/* Footer */}
            <footer className="mt-12 py-6 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/2 px-6 rounded-2xl border border-white/5 backdrop-blur-md">
              <p>&copy; 2026 Aurora LMS. All rights reserved.</p>
              <div className="flex gap-6 font-medium">
                <a href="#/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="#/sources" className="hover:text-cyan-400 transition-colors">Sources & Infrastructure</a>
                <a href="#/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
