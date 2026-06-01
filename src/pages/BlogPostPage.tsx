import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { getBlogPostBySlug, BlogPost } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      const foundPost = getBlogPostBySlug(slug);
      if (foundPost) {
        setPost(foundPost);
      } else {
        navigate('/blog');
      }
    }
  }, [slug, navigate]);

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] transition-colors duration-500">
      
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 rounded-full blur-3xl dark:opacity-20 pointer-events-none" />

      {/* Simplified Navbar */}
      <nav className="h-24 bg-transparent sticky top-0 z-40 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">ZENOVA</span>
        </Link>
        <Link 
          to="/blog"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32 relative z-10">
        
        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-500/10 rounded-full text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider border border-cyan-100 dark:border-cyan-500/20">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-slate-800 dark:text-white tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-4">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md"
              />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{post.author.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-[32px] overflow-hidden mb-16 shadow-2xl"
        >
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Article Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-black prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-img:rounded-[24px] prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50 dark:prose-blockquote:bg-cyan-500/10 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Read More Articles
          </Link>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </main>
    </div>
  );
}
