import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Award, 
  HelpCircle, 
  MessageSquare, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

// -------------------------------------------------------------
// 1. QUIZZES PAGE
// -------------------------------------------------------------
export const QuizzesPage = () => {
  const quizzes = [
    { id: 1, title: 'C Programming basics: Syntax check', course: 'Learning C Programming', score: '80%', status: 'Passed' },
    { id: 2, title: 'Pointers & Dynamic Buffers', course: 'Advanced C: Pointers & Algorithms', score: 'Pending', status: 'Incomplete' },
    { id: 3, title: 'Python Control Flow and Loops', course: 'Python Fundamentals & Automation', score: '95%', status: 'Passed' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="text-amber-400" size={32} /> Quizzes Hub
        </h1>
        <p className="text-slate-300 mt-2 text-base">Validate your knowledge and track your test performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quizzes.map((quiz) => (
          <motion.div key={quiz.id} initial="hidden" animate="show" variants={itemVariants}>
            <Card className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/30">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {quiz.course}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{quiz.title}</h3>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <div>
                  <p className="text-xs text-slate-500">Score Obtained</p>
                  <p className="text-base font-extrabold text-white">{quiz.score}</p>
                </div>
                <Button variant={quiz.status === 'Passed' ? 'glass' : 'gradient'} size="sm" className="btn-premium">
                  {quiz.status === 'Passed' ? 'Review Quiz' : 'Take Quiz'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. CERTIFICATES PAGE (WWDC WALLET STYLE)
// -------------------------------------------------------------
export const CertificatesPage = () => {
  const certs = [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Award className="text-purple-400" size={32} /> Certificates Wallet
        </h1>
        <p className="text-slate-300 mt-2 text-base">Access and download your verified course credentials.</p>
      </div>

      {certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Award size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-semibold">No certificates earned yet</p>
          <p className="text-slate-500 text-sm mt-1">Complete courses to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <motion.div key={cert.id} initial="hidden" animate="show" variants={itemVariants}>
              <Card className="glass-card p-6 h-full border border-white/10 bg-gradient-to-br from-purple-950/20 to-pink-950/10 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500" />
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <Award size={28} className="text-purple-400" />
                    <span className="text-[9px] font-mono tracking-widest text-slate-500">{cert.code}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{cert.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Instructor: {cert.instructor}</p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Issued: {cert.date}</span>
                  <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                    View <ExternalLink size={12} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 3. DISCUSSIONS PAGE
// -------------------------------------------------------------
export const DiscussionsPage = () => {
  const threads = [
    { id: 1, title: 'How to implement custom malloc free in C?', author: 'Aman Patel', replies: 8, activity: '2h ago' },
    { id: 2, title: 'Trouble connecting Firebase token in local dev env', author: 'Vikram', replies: 15, activity: '5h ago' },
    { id: 3, title: 'Python requests.get headers configuration parameters', author: 'Neha Sen', replies: 3, activity: '1d ago' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="text-blue-400" size={32} /> Discussions Board
        </h1>
        <p className="text-slate-300 mt-2 text-base">Join the community, ask questions, and share solutions.</p>
      </div>

      <Card className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Start a New Thread</h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Type your discussion topic..." 
            className="apple-input flex-grow"
          />
          <Button variant="gradient" className="btn-premium flex items-center gap-2">
            <Send size={14} /> Send
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {threads.map((thread) => (
          <motion.div key={thread.id} initial="hidden" animate="show" variants={itemVariants}>
            <Card className="glass-card p-5 flex justify-between items-center hover:border-blue-500/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{thread.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">By {thread.author} • {thread.activity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{thread.replies} replies</span>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. BOOKMARKS PAGE
// -------------------------------------------------------------
export const BookmarksPage = () => {
  const bookmarks = [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 relative z-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Bookmark className="text-emerald-400" size={32} /> Bookmarks
        </h1>
        <p className="text-slate-300 mt-2 text-base">Access your pinned lectures, notes, and topics.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Bookmark size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-semibold">No bookmarks yet</p>
          <p className="text-slate-500 text-sm mt-1">Bookmark lessons to access them quickly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((bookmark) => (
            <motion.div key={bookmark.id} initial="hidden" animate="show" variants={itemVariants}>
              <Card className="glass-card p-6 h-full border border-white/10 flex flex-col justify-between hover:border-emerald-500/30">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {bookmark.type}
                    </span>
                    <Bookmark size={16} className="text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <h3 className="text-base font-bold text-white">{bookmark.title}</h3>
                  <p className="text-xs text-slate-400">{bookmark.course}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                    Resume <ChevronRight size={12} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
