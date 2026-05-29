import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Server, Code, Database, Cpu, Compass, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SourcesPage = () => {
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

  const techStack = [
    {
      icon: Code,
      title: 'Frontend Framework',
      description: 'React 19, Vite, and TypeScript. A reactive development configuration providing lightning-fast compilation, hot module reloading, and type-safe interfaces.',
    },
    {
      icon: Cpu,
      title: 'Style & Layout',
      description: 'Tailwind CSS, PostCSS, and Framer Motion. Enables a customizable glassmorphic layout system with fluid micro-interactions, responsive design rules, and hardware-accelerated animations.',
    },
    {
      icon: Database,
      title: 'State & Caching',
      description: 'Zustand and React Query (TanStack Query). Zustand handles lightweight, persistent global states (e.g. auth data), while React Query optimizes cache validation and data pre-fetching.',
    },
    {
      icon: Server,
      title: 'Backend Infrastructure',
      description: 'FastAPI (Python 3.11+). A high-performance Python ASGI backend framework that generates automatic Swagger docs, handles token checking middleware, and parses schema logic via Pydantic.',
    },
    {
      icon: Layers,
      title: 'Database & ORM',
      description: 'SQLAlchemy 2.0 ORM with Alembic migrations. Uses SQLite in local development (`lms_dev.db`) and scales seamlessly to PostgreSQL databases for production environments.',
    },
    {
      icon: ShieldCheck,
      title: 'Firebase Services',
      description: 'Firebase Authentication SDK. Orchestrates Google OAuth identity verification and SMS Phone OTP validations, ensuring industry-standard security.',
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
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-white/10 p-8 text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <Server className="text-cyan-400" size={32} /> Sources & Infrastructure
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Detailed blueprint of the application technology stacks and systems.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5">
            Architecture v1.0
          </span>
        </div>
      </motion.div>

      {/* Grid of tech layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techStack.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <motion.div key={idx} variants={item}>
              <Card className="glass-card h-full border border-white/10 hover:border-white/20 transition-all duration-300 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/10">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white">{tech.title}</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{tech.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Development note card */}
      <motion.div variants={item}>
        <Card className="glass-card border border-white/10 bg-black/20 p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
            <Compass size={20} className="text-emerald-400" /> Sandboxed Local Preview Mode
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            This deployment preview utilizes a client-side interceptor adapter that models the backend endpoints within the browser sandbox. Changes to courses, lesson statuses, module additions, and registrations persist locally using <strong>localStorage</strong>, eliminating backend environment constraints.
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SourcesPage;
