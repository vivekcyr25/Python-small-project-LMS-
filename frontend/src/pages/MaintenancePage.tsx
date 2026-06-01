import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Hammer, ShieldAlert } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Dynamic Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header (Top) */}
      <header className="relative z-10 flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">AIPS LMS</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
          <Hammer size={12} className="animate-bounce" /> System Mode: Maintenance
        </div>
      </header>

      {/* Centered Main Content Card */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass rounded-[2.5rem] p-8 md:p-12 text-center border border-white/10 w-full shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle inside glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {/* Logo / Badge circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute -inset-2 rounded-full bg-cyan-500/20 blur-sm animate-ping" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 relative z-10">
                <Sparkles size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
            Under{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Development
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
            We're currently working on exciting improvements. Please check back soon.
          </p>

          {/* Custom Loading/Progress Animation */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: 'easeInOut',
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-blue-500 rounded-full"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">
              Upgrading Systems...
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer (Bottom) */}
      <footer className="relative z-10 text-center max-w-7xl w-full mx-auto">
        <p className="text-[10px] md:text-xs text-slate-600 font-mono uppercase tracking-widest">
          &copy; 2026 AIPS LMS. Security Code: 503-DEV
        </p>
      </footer>
    </div>
  );
};

export default MaintenancePage;
