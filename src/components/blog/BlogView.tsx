import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BlogPost } from '../../types';
import { BookOpen, Clock, Heart, Eye, ArrowRight, User, Search, Sparkles } from 'lucide-react';

interface BlogViewProps {
  onSelectPost: (post: BlogPost) => void;
  onOpenAuthorStudio: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ onSelectPost, onOpenAuthorStudio }) => {
  const { blogPosts } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'Founder Spotlights', 'Business Guides', 'Campus Hustle Tips'];

  const filteredPosts = blogPosts.filter((post) => {
    if (post.status !== 'published') return false;
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Editorial Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Campus Editorial & Founder Journal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
          Campus Stories & Student Entrepreneurship
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Real stories, actionable business blueprints, and spotlights on undergraduate peers building brands on campus.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 dark:border-[#262e3d] pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950'
                  : 'bg-stone-100 dark:bg-[#1c222e] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#252c3b]'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stories, tips, founders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-xs text-stone-500 dark:text-stone-400 bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d]">
          No articles found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group cursor-pointer bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden hover:shadow-md dark:hover:border-amber-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/9 w-full bg-stone-100 dark:bg-[#1c222e] overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{post.category}</span>
                    <span>{post.read_time}</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-stone-100 dark:border-[#262e3d] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{post.author_name}</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
