import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '../data/blogPosts';
import { motion } from 'motion/react';

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-white dark:bg-[#151530] rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
        <img 
          src={post.imageUrl || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=600&auto=format&fit=crop'} 
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('unsplash.com')) {
              target.src = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=600&auto=format&fit=crop';
            }
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider shadow-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {post.date}
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </div>
        </div>

        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white leading-tight mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=E0E7FF&color=4F46E5&size=100`} 
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-black shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('ui-avatars.com')) {
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=E0E7FF&color=4F46E5&size=100`;
                }
              }}
            />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{post.author.name}</p>
            </div>
          </div>
          
          <Link 
            to={`/blog/${post.slug}`}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
          >
            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
