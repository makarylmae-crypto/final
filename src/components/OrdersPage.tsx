import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_METHODS, type OrderStatus } from '../types';

interface OrdersPageProps {
  role: 'farmer' | 'resident';
}

function OrderTimeline({ statusHistory }: { statusHistory: { status: OrderStatus; timestamp: string; note?: string }[] }) {
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatus = statusHistory[statusHistory.length - 1]?.status || 'pending';
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="relative">
      {statusOrder.map((status, index) => {
        const historyEntry = statusHistory.find((h) => h.status === status);
        const isCompleted = !!historyEntry;
        const isCurrent = status === currentStatus;
        return (
          <div key={status} className="flex items-start gap-3 pb-3 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isCompleted ? 'bg-[#00c853] border-[#00c853]' : isCancelled && index === 0 ? 'bg-[#ff5252] border-[#ff5252]' : 'bg-[#1a1a2e] border-[#3a3a5a]'}`} />
              {index < 4 && <div className={`w-0.5 h-full ${isCompleted && !isCancelled ? 'bg-[#00c853]/40' : 'bg-[#1a1a2e]'}`} />}
            </div>
            <div className="pb-3 flex-1">
              <p className={`text-sm font-medium capitalize ${isCompleted ? 'text-[#00e676]' : isCurrent ? 'text-[#448aff]' : 'text-[#6b708d]'}`}>
                {STATUS_LABELS[status]}
                {isCurrent && !isCompleted && <span className="ml-2 inline-block w-2 h-2 bg-[#448aff] rounded-full animate-pulse" />}
              </p>
              {historyEntry && <p className="text-xs text-[#6b708d] mt-0.5">{new Date(historyEntry.timestamp).toLocaleString('en-PH')}</p>}
              {historyEntry?.note && <p className="text-xs text-[#6b708d] mt-0.5 italic">{historyEntry.note}</p>}
            </div>
          </div>
        );
      })}
      {isCancelled && currentStatus === 'cancelled' && (
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded-full bg-[#ff5252] border-2 border-[#ff5252] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#ff5252]">Cancelled</p>
            <p className="text-xs text-[#ff5252]/60 mt-0.5">{new Date(statusHistory[statusHistory.length - 1].timestamp).toLocaleString('en-PH')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage({ role }: OrdersPageProps) {
  const { getFarmerOrders, getResidentOrders, updateOrderStatus, assignDelivery, updatePaymentStatus } = useApp();
  const [showDeliveryForm, setShowDeliveryForm] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({ driverName: '', driverPhone: '', estimatedDelivery: '' });

  const orders = (role === 'farmer' ? getFarmerOrders() : getResidentOrders())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAssignDelivery = (orderId: string) => {
    if (!deliveryForm.driverName || !deliveryForm.driverPhone) return;
    assignDelivery(orderId, {
      driverName: deliveryForm.driverName, driverPhone: deliveryForm.driverPhone,
      assignedAt: new Date().toISOString(),
      estimatedDelivery: deliveryForm.estimatedDelivery ? new Date(deliveryForm.estimatedDelivery).toISOString() : undefined,
    });
    setShowDeliveryForm(null);
    setDeliveryForm({ driverName: '', driverPhone: '', estimatedDelivery: '' });
  };

  const handleMarkPaid = (orderId: string) => {
    updatePaymentStatus(orderId, { method: 'cod', status: 'paid', paidAt: new Date().toISOString() });
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-lg font-semibold text-[#e8eaf6] mb-2">No orders yet</h3>
          <p className="text-[#6b708d]">{role === 'farmer' ? 'When residents place orders, they will appear here.' : 'Start shopping and your orders will appear here.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📋</span>
          <h1 className="text-2xl font-bold text-[#e8eaf6]">{role === 'farmer' ? 'Orders Received' : 'My Orders'}</h1>
          <span className="bg-[#00c853]/10 text-[#00e676] text-sm px-3 py-1 rounded-full font-medium border border-[#00c853]/20">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-5 shadow-lg">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#e8eaf6]">Order #{order.id.slice(-8)}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${order.payment.status === 'paid' ? 'bg-[#00c853]/10 text-[#00e676] border-[#00c853]/20' : 'bg-[#ff9100]/10 text-[#ff9100] border-[#ff9100]/20'}`}>
                      {order.payment.status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b708d] mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#00e676]">₱{order.totalAmount.toLocaleString()}</span>
                  <p className="text-xs text-[#6b708d]">via {PAYMENT_METHODS.find(p => p.value === order.payment.method)?.label || order.payment.method}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-[#1a1a2e] pt-3 mb-3">
                <p className="text-xs font-medium text-[#6b708d] uppercase tracking-wider mb-2">Items</p>
                <div className="bg-[#0d0d24] rounded-lg overflow-hidden border border-[#1a1a2e]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a2e]">
                        <th className="text-left px-3 py-2 text-[#6b708d] font-medium">Product</th>
                        <th className="text-center px-3 py-2 text-[#6b708d] font-medium">Qty</th>
                        <th className="text-right px-3 py-2 text-[#6b708d] font-medium">Price</th>
                        <th className="text-right px-3 py-2 text-[#6b708d] font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="border-b border-[#1a1a2e] last:border-0">
                          <td className="px-3 py-2 text-[#a0a4b8]">{item.productName}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="bg-[#00c853]/10 text-[#00e676] px-2 py-0.5 rounded-full text-xs font-medium">{item.quantity}</span>
                          </td>
                          <td className="px-3 py-2 text-right text-[#6b708d]">₱{item.unitPrice}</td>
                          <td className="px-3 py-2 text-right font-medium text-[#e8eaf6]">₱{(item.unitPrice * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#1a1a2e]">
                        <td colSpan={3} className="px-3 py-2 text-right font-semibold text-[#a0a4b8]">Total:</td>
                        <td className="px-3 py-2 text-right font-bold text-[#00e676]">₱{order.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="text-xs text-[#a0a4b8] bg-[#0d0d24] rounded-lg p-3 border border-[#1a1a2e]">
                  <span className="font-medium text-[#a0a4b8] block mb-1">{role === 'farmer' ? '👤 Customer' : '👨‍🌾 Farmer'}</span>
                  {role === 'farmer' ? `${order.residentName} • ${order.residentPhone}` : `Order from FreshKart`}<br />📍 {order.deliveryAddress}
                </div>
                <div className="text-xs text-[#a0a4b8] bg-[#0d0d24] rounded-lg p-3 border border-[#1a1a2e]">
                  <span className="font-medium text-[#a0a4b8] block mb-1">💳 Payment</span>
                  {PAYMENT_METHODS.find(p => p.value === order.payment.method)?.icon} {PAYMENT_METHODS.find(p => p.value === order.payment.method)?.label}<br />
                  Status: <span className={order.payment.status === 'paid' ? 'text-[#00e676] font-medium' : 'text-[#ff9100] font-medium'}>{order.payment.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                  {order.payment.reference && <> • Ref: {order.payment.reference}</>}
                  {order.payment.receiptUrl && (
                    <div className="mt-2">
                      <button
                        onClick={() => window.open(order.payment.receiptUrl, '_blank')}
                        className="inline-flex items-center gap-1 text-xs bg-[#448aff]/10 text-[#448aff] px-2 py-1 rounded-lg border border-[#448aff]/20 hover:bg-[#448aff]/20 transition-colors"
                      >
                        📸 View Payment Receipt
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {order.deliveryAssignment && (
                <div className="bg-[#7c4dff]/10 rounded-lg p-3 mb-3 text-xs text-[#b388ff] border border-[#7c4dff]/20">
                  <span className="font-medium block mb-1">🚚 Delivery Assignment</span>
                  Driver: {order.deliveryAssignment.driverName} ({order.deliveryAssignment.driverPhone})
                  {order.deliveryAssignment.estimatedDelivery && <> • ETA: {new Date(order.deliveryAssignment.estimatedDelivery).toLocaleString('en-PH')}</>}
                </div>
              )}

              {order.notes && <div className="text-xs text-[#a0a4b8] bg-[#ff9100]/10 rounded-lg p-3 mb-3 border border-[#ff9100]/20"><span className="font-medium text-[#ff9100]">📝 Notes:</span> {order.notes}</div>}

              {/* Timeline */}
              <div className="border-t border-[#1a1a2e] pt-3 mb-3">
                <p className="text-xs font-medium text-[#6b708d] uppercase tracking-wider mb-2">Order Progress</p>
                <OrderTimeline statusHistory={order.statusHistory} />
              </div>

              {/* Farmer Actions */}
              {role === 'farmer' && (
                <div className="border-t border-[#1a1a2e] pt-3 flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="bg-[#448aff] hover:bg-[#448aff]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">✅ Confirm Order</button>
                      <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="bg-[#ff5252]/10 hover:bg-[#ff5252]/20 text-[#ff5252] px-4 py-2 rounded-lg text-sm font-medium border border-[#ff5252]/20 transition-colors">❌ Cancel Order</button>
                    </>
                  )}
                  {order.status === 'confirmed' && <button onClick={() => updateOrderStatus(order.id, 'processing')} className="bg-[#7c4dff] hover:bg-[#7c4dff]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">🔄 Start Processing</button>}
                  {order.status === 'processing' && <button onClick={() => { setShowDeliveryForm(order.id); updateOrderStatus(order.id, 'shipped'); }} className="bg-[#ff9100] hover:bg-[#ff9100]/80 text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-medium transition-colors">🚚 Mark as Shipped</button>}
                  {order.status === 'shipped' && (
                    <>
                      {!order.deliveryAssignment && <button onClick={() => setShowDeliveryForm(order.id)} className="bg-[#7c4dff] hover:bg-[#7c4dff]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">🚚 Assign Delivery</button>}
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all">✅ Mark as Delivered</button>
                    </>
                  )}
                  {order.status === 'shipped' && order.payment.method === 'cod' && order.payment.status === 'unpaid' && (
                    <button onClick={() => handleMarkPaid(order.id)} className="bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] px-4 py-2 rounded-lg text-sm font-medium border border-[#00e676]/20 transition-colors">💰 Mark as Paid (COD)</button>
                  )}
                </div>
              )}

              {/* Delivery Form */}
              {showDeliveryForm === order.id && (
                <div className="border-t border-[#1a1a2e] pt-3 mt-3 bg-[#0d0d24] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#e8eaf6] mb-3">🚚 Assign Delivery Driver</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Driver Name" value={deliveryForm.driverName} onChange={(e) => setDeliveryForm({ ...deliveryForm, driverName: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm text-[#e8eaf6] focus:outline-none focus:border-[#7c4dff] placeholder:text-[#6b708d]" />
                    <input type="text" placeholder="Driver Phone" value={deliveryForm.driverPhone} onChange={(e) => setDeliveryForm({ ...deliveryForm, driverPhone: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm text-[#e8eaf6] focus:outline-none focus:border-[#7c4dff] placeholder:text-[#6b708d]" />
                    <input type="datetime-local" value={deliveryForm.estimatedDelivery} onChange={(e) => setDeliveryForm({ ...deliveryForm, estimatedDelivery: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm text-[#e8eaf6] focus:outline-none focus:border-[#7c4dff]" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAssignDelivery(order.id)} className="bg-[#7c4dff] hover:bg-[#7c4dff]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Assignment</button>
                    <button onClick={() => setShowDeliveryForm(null)} className="bg-[#1a1a2e] hover:bg-[#282845] text-[#a0a4b8] px-4 py-2 rounded-lg text-sm font-medium border border-[#2a2a4a] transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
