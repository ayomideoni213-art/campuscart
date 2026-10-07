import React, { useState } from 'react';
import { Product, Store, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  X,
  Star,
  ShieldCheck,
  ShoppingBag,
  Heart,
  MessageSquare,
  MapPin,
  Flag,
  Share2,
  CheckCircle,
  Truck
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onVisitStore: (storeId: string) => void;
  onOpenMessage: (sellerId: string, storeId: string, productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onVisitStore,
  onOpenMessage
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { currentUser } = useAuth();
  const { stores, reviews, addReview, submitReport } = useMarketplace();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect Information');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const store = stores.find((s) => s.id === product.store_id);
  const productReviews = reviews.filter(
    (r) => r.product_id === product.id && r.status === 'approved'
  );
  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(product.id, newRating, newComment.trim());
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setNewComment('');
    }, 1500);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport('product', product.id, product.name, reportReason, reportDetails);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#151921] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden my-8 max-h-[90vh] flex flex-col transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-[#222936]">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>{product.category_name}</span>
            <span>·</span>
            <span>{product.campus_name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="aspect-4/3 w-full bg-stone-100 dark:bg-[#1c222e] rounded-xl overflow-hidden border border-stone-200 dark:border-[#262e3d]">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === idx
                          ? 'border-stone-900 dark:border-amber-400 shadow-xs'
                          : 'border-stone-200 dark:border-[#262e3d] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Campus Delivery / Pickup Details Box */}
              <div className="p-3.5 bg-stone-50 dark:bg-[#1a202c] rounded-xl border border-stone-200/80 dark:border-[#2b3545] text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Verified Campus Pickup Point</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 pl-6 leading-relaxed">
                  {store?.pickup_point || 'Student Union Lobby / Library Central Quad'}
                </p>
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 pl-6 pt-1 text-[11px]">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free zero-fee student handoff between classes</span>
                </div>
              </div>
            </div>

            {/* Product Details & Purchase Module */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">{product.name}</h1>

                {/* Rating & Reviews */}
                <div className="mt-2 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{product.rating.toFixed(1)}</span>
                    <span className="text-stone-400 dark:text-stone-500">({product.reviews_count} reviews)</span>
                  </div>
                  <span>·</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded">
                    {product.condition}
                  </span>
                  <span>·</span>
                  <span className="text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                    {product.stock} units available
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                    ${(product.discount_price ?? product.price).toFixed(2)}
                  </span>
                  {product.discount_price && (
                    <span className="text-sm text-stone-400 dark:text-stone-500 line-through font-mono tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Store Card */}
                {store && (
                  <div className="mt-5 p-3.5 bg-stone-50 dark:bg-[#1a202c] rounded-xl border border-stone-200 dark:border-[#2b3545] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-300 dark:border-stone-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">{store.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{store.tagline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onVisitStore(store.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#2b3545] rounded-lg hover:bg-stone-100 dark:hover:bg-[#252c3c] transition-colors"
                      >
                        Visit Store
                      </button>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mt-5">
                  <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider">
                    About this Item
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="mt-6 pt-5 border-t border-stone-200 dark:border-[#222936] space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 dark:border-[#2b3545] bg-white dark:bg-[#1a202c] rounded-lg">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-semibold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(product, quantity);
                      onClose();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isOutOfStock
                        ? 'bg-stone-200 dark:bg-[#1c222e] text-stone-400 dark:text-stone-500 cursor-not-allowed'
                        : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 font-bold shadow-sm'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Bag'}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 rounded-xl border border-stone-300 dark:border-[#2b3545] hover:bg-stone-50 dark:hover:bg-[#1c222e] text-stone-700 dark:text-stone-300 transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Secondary Actions: Message Seller & Report */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMessage(product.seller_id, product.store_id, product.id);
                    }}
                    className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-medium flex items-center gap-1.5 underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>Message Student Seller</span>
                  </button>

                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 flex items-center gap-1 text-[11px]"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report Listing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="pt-6 border-t border-stone-200 dark:border-[#222936]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">Verified Campus Reviews</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">From undergraduate peers who bought this item.</p>
              </div>

              {currentUser && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-[#1c222e] hover:bg-stone-200 dark:hover:bg-[#262e3d] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleAddReview} className="mb-6 p-4 bg-stone-50 dark:bg-[#1a202c] border border-stone-200 dark:border-[#2b3545] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-200">Rate your experience:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details on product condition, meetup punctuality, or quality..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-[#151921] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  required
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-semibold rounded-lg text-xs"
                  >
                    {reviewSubmitted ? 'Submitted!' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {productReviews.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 py-4 text-center">
                No reviews yet for this listing. Be the first student buyer to leave feedback!
              </p>
            ) : (
              <div className="space-y-4">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-stone-50/70 dark:bg-[#181e2a] border border-stone-200/70 dark:border-[#262e3d] rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.user_avatar}
                          alt={rev.user_name}
                          className="w-6 h-6 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">{rev.user_name}</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-transparent dark:border-emerald-800/40 px-1.5 py-0.2 rounded font-medium">
                          Verified Buyer
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pl-8">{rev.comment}</p>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500 pl-8 pt-0.5">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151921] rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-stone-200 dark:border-[#262e3d]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-rose-500" />
                Report Listing to Campus Moderators
              </h3>
              <button onClick={() => setReportModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Thank you. Your report has been dispatched to student editors.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-[#1a202c] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg text-xs"
                  >
                    <option value="Prohibited or Restricted Item">Prohibited or Restricted Item</option>
                    <option value="Counterfeit or Misleading">Counterfeit or Misleading</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Non-Student Impersonation">Non-Student Impersonation</option>
                    <option value="Pricing Gouging">Pricing Gouging</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Additional details</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide context for our editorial team..."
                    className="w-full p-2 bg-stone-50 dark:bg-[#1a202c] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
