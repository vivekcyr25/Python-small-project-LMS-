import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Shield, Lock, Eye, Database, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const sections = [
    {
      icon: Shield,
      title: 'Data Collection & Storage',
      description: 'We do not sell or monetize your personal information. When you create an account, register your role, or log in, your user credentials and identifiers are saved locally in secure application states. The system uses secure token storage inside the browser session to keep you logged in.',
    },
    {
      icon: Lock,
      title: 'Authentication Infrastructure',
      description: 'Aurora LMS integrates with Firebase Authentication to handle OAuth Google Sign-in and Phone OTP. Firebase secures these operations, and only verification hashes are exchanged with our backend. In development/mock mode, credentials remain entirely local to your sandbox.',
    },
    {
      icon: Database,
      title: 'Course Progress Tracking',
      description: 'To provide a tailored learning experience, we record your active enrollments and mark completed lessons. This allows you to pause learning and resume later. Under the client-side infrastructure, this state is maintained dynamically in your browser\'s local database.',
    },
    {
      icon: Eye,
      title: 'No Hidden Tracking',
      description: 'We do not employ third-party advertising trackers or behavioral analytics pixels. Your learning speed, course selections, and active modules are kept confidential, visible only to you and, if enrolled in a teacher-led course, the certified course instructor.',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-4xl mx-auto py-4"
    >
      {/* Header Banner */}
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-white/10 p-8 text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <Shield className="text-emerald-400" size={32} /> Privacy Policy
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Learn how we protect your security, credentials, and data privacy.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
            Effective May 2026
          </span>
        </div>
      </motion.div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div key={idx} variants={item}>
              <Card className="glass-card h-full border border-white/10 hover:border-white/20 transition-all duration-300 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{section.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Deep-dive detailed information card */}
      <motion.div variants={item}>
        <Card className="glass-card border border-white/10 bg-black/20 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock size={20} className="text-cyan-400" /> Infrastructure Access & Sources
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your credentials and progress data are fully managed inside the sandbox.
            Authentication uses HTTPS and OAuth 2.0 flow models, ensuring secure authorization scopes.
            For details about libraries and third-party resources, refer to our{' '}
            <a href="#/sources" className="text-cyan-400 hover:underline">
              Sources & Infrastructure page
            </a>
            .
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;
