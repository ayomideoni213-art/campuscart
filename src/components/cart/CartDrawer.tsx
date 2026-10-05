import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    promoCode,
    applyPromoCode,
    removePromoCode,
    total
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-base font-bold text-stone-900">Your Student Bag</h2>
              <span className="text-xs text-stone-500 font-mono">({cart.length} items)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Browse products from student entrepreneurs across your campus to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
                >
                  Explore Campus Market
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-3 p-3 bg-stone-50/70 border border-stone-200 rounded-xl"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-stone-400 hover:text-rose-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {item.product.store_name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-300 rounded bg-white">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="px-2 py-0.5 text-xs text-stone-600 hover:text-stone-900"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-mono font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.product.stock}
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="px-2 py-0.5 text-xs text-stone-600 hover:text-stone-900 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-stone-900 font-mono tabular-nums">
                          ${((item.product.discount_price ?? item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Promo Code Input */}
              <div>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      {promoCode} applied
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. CAMPUS10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-700"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <p
                    className={`mt-1 text-[11px] ${
                      promoMessage.isError ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Student Discount</span>
                    <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Campus Pickup / Delivery</span>
                  <span className="text-emerald-700 font-medium">Free (Quad Handoff)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Due</span>
                  <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Proceed to Campus Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by CampusMart Student Escrow Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
