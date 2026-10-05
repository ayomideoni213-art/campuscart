import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BlogPost } from '../../types';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export const AuthorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { blogPosts, createBlogPost, updateBlogPost, deleteBlogPost } = useMarketplace();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Founder Spotlights');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80');
  const [status, setStatus] = useState<BlogPost['status']>('published');
  const [readTime, setReadTime] = useState('4 min read');

  // Filter posts written by author or all if author
  const authorPosts = blogPosts.filter(
    (p) => p.author_id === currentUser?.id || currentUser?.role === 'admin'
  );

  const totalReads = authorPosts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = authorPosts.reduce((sum, p) => sum + p.likes, 0);

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setCategory('Founder Spotlights');
    setCoverImage('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80');
    setStatus('published');
    setReadTime('3 min read');
    setModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSummary(post.summary);
    setContent(post.content);
    setCategory(post.category);
    setCoverImage(post.cover_image);
    setStatus(post.status);
    setReadTime(post.read_time);
    setModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPostId) {
      updateBlogPost(editingPostId, {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        summary,
        content,
        category,
        cover_image: coverImage,
        status,
        read_time: readTime
      });
    } else {
      createBlogPost({
        author_id: currentUser?.id || 'user-author-1',
        author_name: currentUser?.full_name || 'David Kim',
        author_avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        author_role: 'Senior Campus Journalist & Fellow',
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        summary,
        content,
        category,
        cover_image: coverImage,
        status,
        read_time: readTime
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">Campus Stories & Journal Studio</h1>
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-800 text-[11px] font-bold rounded">
              Author Portal
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Writing stories that celebrate student founders, side-hustles, and campus entrepreneurship guides.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] text-stone-500 font-semibold uppercase">Published Articles</span>
          <p className="text-xl font-bold text-stone-900 font-mono mt-1">{authorPosts.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] text-stone-500 font-semibold uppercase">Total Article Views</span>
          <p className="text-xl font-bold text-stone-900 font-mono mt-1">{totalReads}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] text-stone-500 font-semibold uppercase">Student Reactions</span>
          <p className="text-xl font-bold text-stone-900 font-mono mt-1">{totalLikes}</p>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-stone-900">Your Campus Articles</h3>
        </div>

        <div className="divide-y divide-stone-100">
          {authorPosts.map((post) => (
            <div key={post.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">{post.read_time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{post.title}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1 max-w-lg">{post.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {post.likes}
                  </span>
                </div>

                <div className="space-x-1">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded"
                    title="Edit Story"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this article?')) {
                        deleteBlogPost(post.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl border border-stone-200 text-xs">
            <h3 className="text-base font-bold text-stone-900">
              {editingPostId ? 'Edit Campus Article' : 'Draft New Campus Story'}
            </h3>

            <form onSubmit={handleSavePost} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Article Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How I Built a $2,000/mo Custom Keyboard Brand Between Midterms"
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Founder Spotlights">Founder Spotlights</option>
                    <option value="Business Guides">Business Guides</option>
                    <option value="Campus Hustle Tips">Campus Hustle Tips</option>
                    <option value="Marketplace News">Marketplace News</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Summary / Lead-In</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief synopsis for the card preview..."
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Article Body</label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full editorial story here..."
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
