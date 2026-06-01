import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, ArrowLeft, Loader2 } from 'lucide-react';
import BlogCard from '../components/BlogCard';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        const json = await res.json();
        if (json.success) setBlogs(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] transition-colors duration-500">
      
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 rounded-full blur-3xl dark:opacity-20 pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl dark:opacity-20 pointer-events-none" />

      {/* Simplified Navbar for secondary pages */}
      <nav className="h-24 bg-transparent sticky top-0 z-40 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">ZENOVA</span>
        </Link>
        <Link 
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clinic
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-cyan-100 dark:border-cyan-500/20 mb-6">
            ✦ Clinical Insights
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-slate-800 dark:text-white tracking-tight mb-6">
            The For Your Dentist <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Journal</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Discover the latest in dental technology, expert oral health advice, and news from our clinic.
          </p>
        </motion.div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length === 0 && <p className="text-slate-500 col-span-full text-center">No blogs found.</p>}
            {blogs.map((post, idx) => (
              <BlogCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
