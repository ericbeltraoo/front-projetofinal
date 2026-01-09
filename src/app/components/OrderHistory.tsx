import { useState } from 'react'; // Importado useState
import type { Order } from '../App';

interface OrderHistoryProps {
  orders: Order[];
  onCancelOrder: (orderId: number, reason: string) => Promise<void>; // Nova prop necessária
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '✅' },
  completed: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '✕' }
};

const PAYMENT_LABELS: Record<string, string> = {
  balance: 'Saldo da Conta', pix: 'PIX', card: 'Cartão',
  BALANCE: 'Saldo da Conta', PIX: 'PIX', CARD: 'Cartão'
};

export function OrderHistory({ orders, onCancelOrder }: OrderHistoryProps) {
  // --- ESTADOS PARA O CANCELAMENTO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getProgressWidth = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'preparing' || s === 'preparando') return '33%';
    if (s === 'ready' || s === 'pronto') return '66%';
    if (s === 'completed' || s === 'delivered' || s === 'entregue') return '100%';
    return '0%';
  };

  const isStepActive = (currentStatus: string, stepIndex: number) => {
    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    let s = currentStatus.toLowerCase();
    if (s === 'recebido') s = 'pending';
    if (s === 'preparando') s = 'preparing';
    if (s === 'pronto') s = 'ready';
    if (s === 'delivered' || s === 'entregue') s = 'completed';
    if (s === 'cancelled') return false;
    const currentIndex = statusOrder.indexOf(s);
    return currentIndex !== -1 && currentIndex >= stepIndex;
  };

  // --- FUNÇÕES DE AÇÃO ---
  const handleOpenCancelModal = (id: number) => {
    setSelectedOrderId(id);
    setCancelReason('');
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim() || selectedOrderId === null) return;
    setIsSubmitting(true);
    try {
      await onCancelOrder(selectedOrderId, cancelReason);
      setIsModalOpen(false);
    } catch (error) {
      alert("Erro ao cancelar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido ainda</h3>
        <p className="text-gray-500">Seus pedidos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div>
      {/* --- MODAL DE CANCELAMENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancelar Pedido</h3>
            <p className="text-sm text-gray-500 mb-4">Por favor, informe o motivo do cancelamento para prosseguirmos com o estorno.</p>
            
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
              rows={3}
              placeholder="Ex: Errei o item, vou refazer o pedido..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim() || isSubmitting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Pedidos</h2>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      <div className="space-y-4">
        {sortedOrders.map(order => {
          const statusKey = order.status.toLowerCase();
          const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG['pending'];
          const date = new Date(order.createdAt);
          
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">Pedido #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        <span>{status.icon}</span>
                        <span>{status.label}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-xl font-bold text-indigo-600">R$ {order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Exibição do Motivo caso já esteja cancelado */}
                {statusKey === 'cancelled' && order.cancelReason && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-[10px] font-bold text-red-600 uppercase">Motivo do Cancelamento</p>
                    <p className="text-sm text-red-800 italic">"{order.cancelReason}"</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.product?.name || "Produto"}
                        </span>
                        <span className="font-medium text-gray-900">
                          R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Pagamento: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                  </div>

                  {/* --- BOTÃO DE CANCELAR --- */}
                  {statusKey === 'pending' && (
                    <button 
                      onClick={() => handleOpenCancelModal(Number(order.id))}
                      className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors underline underline-offset-4"
                    >
                      Cancelar Pedido
                    </button>
                  )}
                </div>

                {(isStepActive(statusKey, 2)) && order.pickupCode && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-900 mb-1">Código para Retirada</p>
                        <p className="text-xs text-indigo-700">Apresente este código na cantina</p>
                      </div>
                      <div className="bg-white px-6 py-3 rounded-lg border-2 border-indigo-300">
                        <p className="text-3xl font-bold text-indigo-600 tracking-wider">{order.pickupCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {statusKey !== 'cancelled' && (
                  <div className="mt-8 relative px-2">
                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 rounded z-0"></div>
                    <div 
                      className="absolute top-4 left-0 h-1 bg-indigo-600 rounded z-0 transition-all duration-500 ease-out"
                      style={{ width: getProgressWidth(statusKey) }}
                    ></div>
                    <div className="relative z-10 flex justify-between w-full">
                      {[
                        { step: 1, label: 'Recebido' },
                        { step: 2, label: 'Preparando' },
                        { step: 3, label: 'Pronto' },
                        { step: 4, label: 'Entregue' }
                      ].map((s, idx) => (
                        <div key={idx} className="flex flex-col items-center w-20">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                            isStepActive(statusKey, idx) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {s.step}
                          </div>
                          <span className={`mt-2 text-xs font-medium text-center ${isStepActive(statusKey, idx) ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}