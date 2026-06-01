import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { FileText, CheckCircle2, UserCheck, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPage = () => {
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

  const terms = [
    {
      icon: UserCheck,
      title: '1. Account Eligibility',
      description: 'By registering on AIPS LMS, you agree to provide truthful credentials and accept responsibility for maintaining the confidentiality of your session tokens and profile dashboard.',
    },
    {
      icon: CheckCircle2,
      title: '2. Academic Integrity',
      description: 'Learners must complete quizzes and modules honestly. Plagiarism or programmatic automation to simulate video playback or progress completion is strictly prohibited.',
    },
    {
      icon: Shield,
      title: '3. Intellectual Property',
      description: 'All courses, compilation videos, textbooks, and code snippets are protected under copyright laws. You are granted a limited personal study license; distributing materials without authorization is illegal.',
    },
    {
      icon: HelpCircle,
      title: '4. Limitation of Liability',
      description: 'All mock compilers, terminal scripts, and learning sandboxes are provided on an "as is" basis. AIPS LMS is not liable for system damage, compiler compilation errors, or local compiler crashes.',
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
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/10 p-8 text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <FileText className="text-violet-400" size={32} /> Terms of Service
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Terms and user guidelines for using the AIPS LMS platform.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
            Updated May 2026
          </span>
        </div>
      </motion.div>

      {/* Grid of Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {terms.map((term, idx) => {
          const Icon = term.icon;
          return (
            <motion.div key={idx} variants={item}>
              <Card className="glass-card h-full border border-white/10 hover:border-white/20 transition-all duration-300 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 border border-violet-500/10">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white">{term.title}</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{term.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TermsPage;
