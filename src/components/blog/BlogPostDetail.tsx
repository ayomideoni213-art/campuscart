import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ArrowLeft, Clock, Eye, Heart, Share2, Sparkles, User } from 'lucide-react';

interface BlogPostDetailProps {
  post: BlogPost;
  onBack: () => void;
  onSelectOtherPost: (post: BlogPost) => void;
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({
  post,
  onBack,
  onSelectOtherPost
}) => {
  const { blogPosts, updateBlogPost } = useMarketplace();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
      updateBlogPost(post.id, { likes: post.likes + 1 });
    }
  };

  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.status === 'published')
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Stories</span>
      </button>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded">
            {post.category}
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">{post.read_time}</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-400 font-mono">
            Published {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
          {post.summary}
        </p>

        {/* Author Card */}
        <div className="flex items-center justify-between border-y border-stone-200 py-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-stone-900">{post.author_name}</p>
              <p className="text-[11px] text-stone-500">{post.author_role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Eye className="w-3.5 h-3.5" />
              {post.views} reads
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                liked
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'border-stone-300 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="aspect-16/9 w-full rounded-2xl overflow-hidden border border-stone-200">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Article Body */}
      <div className="prose prose-stone max-w-none text-stone-700 text-sm leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Related Stories */}
      {relatedPosts.length > 0 && (
        <div className="pt-10 border-t border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-stone-900">More from CampusMart Editorial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectOtherPost(rel)}
                className="p-4 bg-white border border-stone-200 rounded-xl hover:shadow-xs transition-all cursor-pointer space-y-2 text-xs"
              >
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {rel.category}
                </span>
                <h4 className="font-bold text-stone-900 line-clamp-1">{rel.title}</h4>
                <p className="text-[11px] text-stone-500 line-clamp-2">{rel.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
