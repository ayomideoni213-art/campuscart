import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { EKITI_CAMPUSES, sanitizeCampus } from '../../data/campuses';
import { getCartIssues, shortCampus } from '../../lib/shopping';
import { isValidNigerianPhone, normalizeNigerianPhone } from '../../lib/formatters';
import { formatNaira } from '../../lib/formatters';
import { DeliveryDetails, PaymentMethod } from '../../types';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  Coins,
  Building,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Receipt
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderComplete
}) => {
  const { cart, subtotal, discount, total, clearCart, removeFromCart, updateQuantity } = useCart();
  const { currentUser, selectedCampus } = useAuth();
  const { placeOrder, products, stores } = useMarketplace();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);

  // Step 1: Customer details
  const [studentName, setStudentName] = useState(currentUser?.full_name || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [studentId, setStudentId] = useState(currentUser?.student_id || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Step 2: Delivery / Pickup info
  const [campus, setCampus] = useState(selectedCampus !== 'All' ? sanitizeCampus(selectedCampus) : sanitizeCampus(currentUser?.campus_name));
  const [deliveryType, setDeliveryType] = useState<DeliveryDetails['delivery_type']>('campus_dorm');
  const [locationDetail, setLocationDetail] = useState('');
  const [notes, setNotes] = useState('');

  // Step 4: Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_pickup');


  // Live problems with the bag for the chosen campus (stock, unpublished items, campus coverage).
  const issues = getCartIssues(cart, products, stores, campus);
  const hasIssues = issues.length > 0;

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (step === 1 && !isValidNigerianPhone(phone.trim())) {
      setOrderError('Enter a valid Nigerian phone number, e.g. 08012345678 or +2348012345678.');
      return;
    }
    if (step === 2 && hasIssues) {
      setStep(3);
      return;
    }
    if (step < 4) {
      setStep((s) => (s + 1) as 2 | 3 | 4);
    } else {
      executeOrder();
    }
  };

  const executeOrder = () => {
    if (isProcessing) return;
    setOrderError(null);
    if (hasIssues) {
      setStep(3);
      return;
    }
    setIsProcessing(true);

    setTimeout(() => {
      const deliveryInfo: DeliveryDetails = {
        student_name: studentName,
        student_email: studentEmail,
        student_id: studentId,
        phone: normalizeNigerianPhone(phone.trim()),
        campus,
        delivery_type: deliveryType,
        location_detail: locationDetail,
        notes
      };

      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        store_id: item.product.store_id,
        store_name: item.product.store_name,
        product_name: item.product.name,
        price: item.product.discount_price ?? item.product.price,
        quantity: item.quantity,
        image_url: item.product.images?.[0] || ''
      }));

      let newOrder;
      try {
        newOrder = placeOrder(orderItems, deliveryInfo, paymentMethod, subtotal, discount);
      } catch (err) {
        setIsProcessing(false);
        setOrderError(err instanceof Error ? err.message : 'We could not place your order. Please try again.');
        setStep(3);
        return;
      }
      setCreatedOrderNumber(newOrder.order_number);
      setPlacedTotal(newOrder.total_amount);
      clearCart();
      setIsProcessing(false);
      setStep(5);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="relative w-full max-w-2xl bg-white dark:bg-[#151921] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden my-6 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-[#222936]">
          <div>
            <h2 id="checkout-title" className="text-base font-bold text-stone-900 dark:text-white">Campus Checkout</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Reserve your items and pay the seller at the campus handoff</p>
          </div>
          {step !== 5 && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Tracker (Steps 1-4) */}
        {step !== 5 && (
          <div className="bg-stone-50 dark:bg-[#11151c] px-6 py-3 border-b border-stone-200 dark:border-[#222936] flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Student Info' },
              { num: 2, label: 'Campus Pickup' },
              { num: 3, label: 'Order Summary' },
              { num: 4, label: 'Payment' }
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 ${
                  step === s.num
                    ? 'font-bold text-stone-900 dark:text-white'
                    : step > s.num
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === s.num
                      ? 'bg-brand-600 text-white dark:bg-brand-400 dark:text-stone-950'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-[#262e3d] text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step Contents */}
        <div className="p-6">
          {orderError && (
            <div role="alert" className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl">
              {orderError}
            </div>
          )}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">1. Student Contact Information</h3>
              <p className="text-stone-500 dark:text-stone-400">
                Sellers use your campus email and phone to coordinate physical handoffs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus Email (.edu)</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Student ID Number</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Mobile Phone (For Handoff SMS)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Pickup Point</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">2. Campus Delivery & Pickup Location</h3>
              <p className="text-stone-500 dark:text-stone-400">
                Choose where you would prefer to meet or have items brought by student couriers.
              </p>

              <div className="pt-2 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus</label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  >
                    {EKITI_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Pickup Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'campus_dorm', label: 'Dorm Hall Desk' },
                      { id: 'student_union', label: 'Student Union' },
                      { id: 'library_desk', label: 'Library Desk' },
                      { id: 'off_campus', label: 'Off-Campus Local' }
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setDeliveryType(t.id as DeliveryDetails['delivery_type'])}
                        className={`p-2.5 border rounded-lg text-center transition-colors ${
                          deliveryType === t.id
                            ? 'border-stone-900 dark:border-brand-400 bg-stone-900 dark:bg-brand-400 text-white dark:text-stone-950 font-bold'
                            : 'border-stone-200 dark:border-[#262e3d] bg-stone-50 dark:bg-[#181e2a] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#222a3a]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Exact Room / Location Marker</label>
                  <input
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder="e.g. East Residence Hall Room 304B or Quad Bench near Oak Tree"
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Special Handoff Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I have class until 2 PM, can meet right after."
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 dark:focus:ring-brand-400"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">3. Order Summary & Item Review</h3>

              {hasIssues && (
                <div role="alert" className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 rounded-xl space-y-2 text-amber-900 dark:text-amber-200">
                  <p className="font-semibold">Fix these before you can place your order:</p>
                  <ul className="space-y-1.5">
                    {issues.map((issue) => (
                      <li key={issue.productId + issue.kind} className="flex items-center justify-between gap-2">
                        <span>{issue.message}</span>
                        {issue.kind === "insufficient_stock" ? (
                          <button type="button" onClick={() => updateQuantity(issue.productId, issue.maxQuantity - (cart.find((c) => c.product_id === issue.productId)?.quantity ?? 0))} className="shrink-0 px-2 py-1 rounded bg-amber-200 dark:bg-amber-900/60 font-semibold cursor-pointer">Reduce to {issue.maxQuantity}</button>
                        ) : (
                          <button type="button" onClick={() => removeFromCart(issue.productId)} className="shrink-0 px-2 py-1 rounded bg-amber-200 dark:bg-amber-900/60 font-semibold cursor-pointer">Remove</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Items List */}
              <div className="max-h-52 overflow-y-auto space-y-2 border border-stone-200 dark:border-[#262e3d] rounded-xl p-3 bg-stone-50 dark:bg-[#11151c]">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.images?.[0] || ''}
                        alt={item.product.name}
                        className="w-10 h-10 rounded object-cover bg-stone-200 dark:bg-[#1c222e]"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{item.product.name}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">Qty: {item.quantity} · {item.product.store_name}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {formatNaira((item.product.discount_price ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Handoff details summary */}
              <div className="p-3 bg-stone-100 dark:bg-[#181e2a] rounded-xl space-y-1 text-stone-600 dark:text-stone-300 border border-transparent dark:border-[#262e3d]">
                <div className="font-semibold text-stone-900 dark:text-white">Handoff Recipient:</div>
                <p>{studentName} ({studentId}) · {phone}</p>
                <p>{campus} — {locationDetail}</p>
              </div>

              {/* Financials */}
              <div className="pt-2 space-y-1.5 border-t border-stone-200 dark:border-[#222936]">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-stone-900 dark:text-stone-200">{formatNaira(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Applied</span>
                    <span className="font-mono tabular-nums">-{formatNaira(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Campus handoff fee</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Free (₦0)</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-[#222936]">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-base text-stone-900 dark:text-brand-400">{formatNaira(total)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={hasIssues || cart.length === 0}
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-stone-900 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Choose how you will pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">4. Select Payment Method</h3>
              <p className="text-stone-500 dark:text-stone-400">
                CampusMart does not process online payments. You pay the seller directly when you meet on campus.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'cash_on_pickup',
                    title: 'Cash at handoff',
                    desc: 'Pay the seller in cash after you inspect the item',
                    icon: <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  },
                  {
                    id: 'bank_transfer',
                    title: 'Bank transfer at handoff',
                    desc: 'Transfer to the seller when you meet; confirm details in chat first',
                    icon: <Building className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3.5 border rounded-xl text-left transition-all ${
                      paymentMethod === m.id
                        ? 'border-stone-900 dark:border-brand-400 bg-stone-50 dark:bg-[#1a2230] ring-2 ring-stone-900/10 dark:ring-brand-400/20'
                        : 'border-stone-200 dark:border-[#262e3d] bg-white dark:bg-[#151921] hover:border-stone-300 dark:hover:border-[#384358]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {m.icon}
                      <span className="font-bold text-stone-900 dark:text-white">{m.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">{m.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-800/40 rounded-xl flex items-center gap-2 text-brand-900 dark:text-brand-200">
                <ShieldCheck className="w-5 h-5 text-brand-700 dark:text-brand-400 shrink-0" />
                <p className="text-[11px]">
                  What happens next: each seller is notified, agrees a meeting time with you in chat, and you pay at the handoff on {shortCampus(campus)}. Nothing is charged online.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={isProcessing || hasIssues}
                  onClick={executeOrder}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <span>Placing order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order ({formatNaira(total)})</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-stone-950" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs border border-transparent dark:border-emerald-800/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Order Placed Successfully!</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Your campus order number is <span className="font-bold text-stone-900 dark:text-white font-mono">{createdOrderNumber}</span>
                </p>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d] max-w-md mx-auto text-left text-xs space-y-2 text-stone-600 dark:text-stone-300">
                <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1">
                  <Receipt className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span>Receipt Details</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{studentName} ({studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span>Handoff Location:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{locationDetail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase">{paymentMethod === 'cash_on_pickup' ? 'Pay cash at handoff' : 'Pay by transfer at handoff'}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 dark:text-white pt-1 border-t border-stone-200 dark:border-[#222936]">
                  <span>Total to pay at handoff:</span>
                  <span className="font-mono tabular-nums text-stone-900 dark:text-brand-400">{formatNaira(placedTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onOrderComplete(createdOrderNumber);
                  }}
                  className="px-5 py-2.5 bg-stone-900 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Order in Buyer Portal
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-100 dark:bg-[#181e2a] text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-[#252c3c] rounded-xl text-xs font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
