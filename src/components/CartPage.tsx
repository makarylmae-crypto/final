import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PAYMENT_METHODS, type PaymentMethod } from '../types';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { state, removeFromCart, updateCartQuantity, placeOrder } = useApp();
  const { cart } = state;
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (!paymentStep && paymentMethod !== 'cod') { setPaymentStep(true); return; }
    placeOrder(notes, paymentMethod, receiptPreview || undefined);
    setOrderPlaced(true);
    setTimeout(() => { setOrderPlaced(false); onNavigate('orders'); }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-7xl block mb-6">🎉</span>
          <h2 className="text-2xl font-bold text-[#e8eaf6] mb-2">Order Placed Successfully!</h2>
          <p className="text-[#6b708d]">{paymentMethod === 'cod' ? 'Pay when you receive your order. The farmer has been notified.' : 'Receipt uploaded! Awaiting farmer confirmation.'}</p>
          <div className="mt-6 animate-spin inline-block w-8 h-8 border-4 border-[#00c853] border-t-transparent rounded-full" />
          <p className="text-sm text-[#6b708d] mt-4">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛒</span>
          <h1 className="text-2xl font-bold text-[#e8eaf6]">{paymentStep ? 'Complete Payment' : 'Shopping Cart'}</h1>
          {totalItems > 0 && !paymentStep && (
            <span className="bg-[#00c853]/10 text-[#00e676] text-sm px-3 py-1 rounded-full font-medium border border-[#00c853]/20">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl p-16 text-center border border-[#2a2a4a] shadow-lg">
            <span className="text-6xl block mb-4">🛒</span>
            <h3 className="text-lg font-semibold text-[#e8eaf6] mb-2">Your cart is empty</h3>
            <p className="text-[#6b708d] mb-6">Start shopping for fresh produce!</p>
            <button onClick={() => onNavigate('shop')} className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#00c853]/20">Browse Products</button>
          </div>
        ) : paymentStep ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] p-6 shadow-lg">
              <div className="text-center mb-6">
                <span className="text-5xl block mb-3">💳</span>
                <h2 className="text-xl font-bold text-[#e8eaf6]">Complete Your Payment</h2>
                <p className="text-[#6b708d] text-sm mt-1">Pay via {PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}</p>
              </div>
              <div className="bg-[#00c853]/10 rounded-xl p-4 mb-6 border border-[#00c853]/20">
                <div className="flex justify-between items-center">
                  <span className="text-[#a0a4b8]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#00e676]">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* GCash Payment Info */}
              {paymentMethod === 'gcash' && (
                <div className="bg-[#448aff]/10 border border-[#448aff]/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-[#448aff] mb-2">📱 GCash Payment</h3>
                  <div className="text-sm text-[#a0a4b8] space-y-1">
                    <p>1. Open GCash app</p>
                    <p>2. Send payment to: <strong className="text-[#e8eaf6]">0917 123 4567</strong></p>
                    <p>3. Amount: <strong className="text-[#448aff]">₱{totalAmount.toLocaleString()}</strong></p>
                    <p className="mt-2 text-yellow-400">📸 Take a screenshot of your payment confirmation</p>
                  </div>
                </div>
              )}

              {/* Maya Payment Info */}
              {paymentMethod === 'maya' && (
                <div className="bg-[#7c4dff]/10 border border-[#7c4dff]/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-[#b388ff] mb-2">💳 Maya Payment</h3>
                  <div className="text-sm text-[#a0a4b8] space-y-1">
                    <p>1. Open Maya app</p>
                    <p>2. Send payment to: <strong className="text-[#e8eaf6]">0918 765 4321</strong></p>
                    <p>3. Amount: <strong className="text-[#b388ff]">₱{totalAmount.toLocaleString()}</strong></p>
                    <p className="mt-2 text-yellow-400">📸 Take a screenshot of your payment confirmation</p>
                  </div>
                </div>
              )}

              {/* Receipt Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#a0a4b8] mb-2">
                  📤 Upload Payment Receipt / Screenshot
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    receiptPreview ? 'border-[#00c853] bg-[#00c853]/5' : 'border-[#2a2a4a] hover:border-[#3a3a5a]'
                  }`}
                >
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="Receipt preview" className="max-h-40 mx-auto rounded-lg" />
                      <p className="text-xs text-[#00e676]">✅ Receipt uploaded — click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-4xl block">📄</span>
                      <p className="text-sm text-[#6b708d]">Tap to upload receipt screenshot</p>
                      <p className="text-xs text-[#6b708d]">PNG, JPG accepted</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaymentStep(false)} className="flex-1 bg-[#1a1a2e] hover:bg-[#282845] text-[#a0a4b8] py-3 rounded-xl font-medium border border-[#2a2a4a] transition-colors">Back</button>
                <button onClick={handlePlaceOrder} disabled={!receiptPreview} className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  receiptPreview
                    ? 'bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] shadow-[#00c853]/20'
                    : 'bg-[#2a2a4a] text-[#6b708d] cursor-not-allowed'
                }`}>
                  {receiptPreview ? 'Confirm & Place Order' : 'Upload receipt first'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-4 shadow-lg flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0d0d24] flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#e8eaf6] truncate">{item.product.name}</h3>
                    <p className="text-sm text-[#6b708d]">{item.product.farmName}</p>
                    <p className="text-sm text-[#6b708d]">₱{item.product.price} / {item.product.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (item.quantity <= 1) removeFromCart(item.productId); else updateCartQuantity(item.productId, item.quantity - 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0d0d24] hover:bg-[#282845] text-[#a0a4b8] transition-colors border border-[#2a2a4a]">-</button>
                    <span className="w-8 text-center font-medium text-[#e8eaf6]">{item.quantity}</span>
                    <button onClick={() => { if (item.quantity < item.product.stock) updateCartQuantity(item.productId, item.quantity + 1); }} disabled={item.quantity >= item.product.stock} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-[#2a2a4a] ${item.quantity >= item.product.stock ? 'bg-[#0d0d24] text-[#2a2a4a] cursor-not-allowed' : 'bg-[#0d0d24] hover:bg-[#282845] text-[#a0a4b8]'}`}>+</button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="font-bold text-[#00e676]">₱{(item.product.price * item.quantity).toLocaleString()}</div>
                    <div className="text-xs text-[#6b708d]">{item.quantity} × ₱{item.product.price}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-[#ff5252]/60 hover:text-[#ff5252] transition-colors p-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg h-fit sticky top-24">
              <h3 className="font-semibold text-[#e8eaf6] mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-[#6b708d] truncate max-w-[180px]">{item.product.name} <span className="text-[#3a3a5a]">×{item.quantity}</span></span>
                    <span className="font-medium text-[#e8eaf6]">₱{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2a2a4a] pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#e8eaf6]">Total</span>
                  <span className="text-xl font-bold text-[#00e676]">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#a0a4b8] mb-2">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button key={pm.value} type="button" onClick={() => setPaymentMethod(pm.value)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === pm.value ? 'border-[#00c853] bg-[#00c853]/10' : 'border-[#2a2a4a] hover:border-[#3a3a5a]'}`}>
                      <span className="text-2xl">{pm.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#e8eaf6]">{pm.label}</div>
                        <div className="text-xs text-[#6b708d]">{pm.description}</div>
                      </div>
                      {paymentMethod === pm.value && <span className="text-[#00c853]">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Delivery Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions for the farmer?" className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" rows={2} />
              </div>

              <button onClick={handlePlaceOrder} className="w-full bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#00c853]/20">
                {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay via ${PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}`}
              </button>
              <button onClick={() => onNavigate('shop')} className="w-full text-center text-sm text-[#6b708d] hover:text-[#00c853] mt-3 transition-colors">Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
