import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CAMPUS_OPTIONS } from '../../services/storage';
import { DeliveryDetails, PaymentMethod } from '../../types';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  CreditCard,
  Wallet,
  Coins,
  Building,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Truck,
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
  const { cart, subtotal, discount, total, clearCart } = useCart();
  const { currentUser, selectedCampus } = useAuth();
  const { placeOrder } = useMarketplace();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Step 1: Customer details
  const [studentName, setStudentName] = useState(currentUser?.full_name || 'Maya Lin');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || 'maya.buyer@campus.edu');
  const [studentId, setStudentId] = useState(currentUser?.student_id || 'MCU-2024-8842');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 234-8901');

  // Step 2: Delivery / Pickup info
  const [campus, setCampus] = useState(selectedCampus);
  const [deliveryType, setDeliveryType] = useState<DeliveryDetails['delivery_type']>('campus_dorm');
  const [locationDetail, setLocationDetail] = useState('East Residential Hall, Suite 304B');
  const [notes, setNotes] = useState('Text when approaching the lobby desk.');

  // Step 4: Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('campus_pay');

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((s) => (s + 1) as 2 | 3 | 4);
    } else {
      executeOrder();
    }
  };

  const executeOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const deliveryInfo: DeliveryDetails = {
        student_name: studentName,
        student_email: studentEmail,
        student_id: studentId,
        phone,
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
        image_url: item.product.images[0]
      }));

      const newOrder = placeOrder(orderItems, deliveryInfo, paymentMethod, subtotal, discount);
      setCreatedOrderNumber(newOrder.order_number);
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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">Campus Express Checkout</h2>
            <p className="text-xs text-stone-500">Fast, zero-fee student marketplace handoff</p>
          </div>
          {step !== 5 && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Tracker (Steps 1-4) */}
        {step !== 5 && (
          <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 flex items-center justify-between text-xs">
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
                    ? 'font-bold text-stone-900'
                    : step > s.num
                    ? 'text-emerald-700'
                    : 'text-stone-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === s.num
                      ? 'bg-stone-900 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600'
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
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900">1. Student Contact Information</h3>
              <p className="text-stone-500">
                Sellers use your campus email and phone to coordinate physical handoffs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Campus Email (.edu)</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Student ID Number</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (For Handoff SMS)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 flex items-center gap-1.5"
                >
                  <span>Continue to Pickup Point</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900">2. Campus Delivery & Pickup Location</h3>
              <p className="text-stone-500">
                Choose where you would prefer to meet or have items brought by student couriers.
              </p>

              <div className="pt-2 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">University Campus</label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    {CAMPUS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pickup Type</label>
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
                            ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Exact Room / Location Marker</label>
                  <input
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder="e.g. East Residence Hall Room 304B or Quad Bench near Oak Tree"
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Special Handoff Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I have class until 2 PM, can meet right after."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 flex items-center gap-1.5"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900">3. Order Summary & Item Review</h3>

              {/* Items List */}
              <div className="max-h-52 overflow-y-auto space-y-2 border border-stone-200 rounded-xl p-3 bg-stone-50">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity} · {item.product.store_name}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      ${((item.product.discount_price ?? item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Handoff details summary */}
              <div className="p-3 bg-stone-100 rounded-xl space-y-1 text-stone-600">
                <div className="font-semibold text-stone-900">Handoff Recipient:</div>
                <p>{studentName} ({studentId}) · {phone}</p>
                <p>{campus} — {locationDetail}</p>
              </div>

              {/* Financials */}
              <div className="pt-2 space-y-1.5 border-t border-stone-200">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied</span>
                    <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Campus Handoff Fee</span>
                  <span className="text-emerald-700 font-semibold">Free ($0.00)</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 flex items-center gap-1.5"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-900">4. Select Payment Method</h3>
              <p className="text-stone-500">
                Supports campus balance, card, or physical cash upon verified peer meetup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'campus_pay',
                    title: 'CampusPay Student Card',
                    desc: 'Instant escrow deduction from your university ID balance',
                    icon: <Wallet className="w-5 h-5 text-indigo-600" />
                  },
                  {
                    id: 'card',
                    title: 'Credit / Debit Card',
                    desc: 'Secured via standard student merchant gateway',
                    icon: <CreditCard className="w-5 h-5 text-amber-600" />
                  },
                  {
                    id: 'cash_on_pickup',
                    title: 'Cash on Campus Pickup',
                    desc: 'Pay seller in person once you inspect the item',
                    icon: <Coins className="w-5 h-5 text-emerald-600" />
                  },
                  {
                    id: 'bank_transfer',
                    title: 'Direct Campus Bank Wire',
                    desc: 'Direct peer-to-peer wire transfer via student app',
                    icon: <Building className="w-5 h-5 text-stone-600" />
                  }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3.5 border rounded-xl text-left transition-all ${
                      paymentMethod === m.id
                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {m.icon}
                      <span className="font-bold text-stone-900">{m.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">{m.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <p className="text-[11px]">
                  Funds are held in CampusMart Escrow and only released when both buyer and seller confirm physical meetup and item condition.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={isProcessing}
                  onClick={executeOrder}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Authorizing Escrow...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (${total.toFixed(2)})</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Order Placed Successfully!</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Your campus order number is <span className="font-bold text-stone-900 font-mono">{createdOrderNumber}</span>
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 max-w-md mx-auto text-left text-xs space-y-2 text-stone-600">
                <div className="font-bold text-stone-900 flex items-center gap-1">
                  <Receipt className="w-4 h-4 text-stone-500" />
                  <span>Receipt Details</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-semibold text-stone-900">{studentName} ({studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span>Handoff Location:</span>
                  <span className="font-semibold text-stone-900">{locationDetail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-emerald-700 font-semibold uppercase">{paymentMethod === 'cash_on_pickup' ? 'Cash Pending' : 'Paid / Escrow Locked'}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Paid:</span>
                  <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onOrderComplete(createdOrderNumber);
                  }}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
                >
                  View Order in Buyer Portal
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-200"
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
