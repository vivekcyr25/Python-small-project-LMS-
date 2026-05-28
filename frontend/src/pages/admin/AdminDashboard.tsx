import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, CreditCard, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Card */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700/10 rounded-full blur-3xl -z-10" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Admin Control Center <Shield className="text-slate-400" size={24} />
            </h1>
            <p className="text-slate-300 mt-2 text-lg">System overview and management.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-xs text-slate-500">Not available</p>
          </div>
        </Card>

        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Courses</p>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-xs text-slate-500">Not available</p>
          </div>
        </Card>

        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Enrollments</p>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-xs text-slate-500">Not available</p>
          </div>
        </Card>

        <Card className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Revenue</p>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-xs text-slate-500">Not available</p>
          </div>
        </Card>
      </motion.div>

      {/* Placeholder for more admin features */}
      <motion.div variants={item}>
        <Card className="glass-card p-12 text-center">
          <Shield size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Platform Management</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Advanced management features will appear here. Currently verified for Phase 1 stability.
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
