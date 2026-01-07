import type { Order } from '../App';

interface OrderHistoryProps {
  orders: Order[];
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '✅' },
  completed: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '✕' }
};

const PAYMENT_LABELS = {
  balance: 'Saldo da Conta',
  pix: 'PIX',
  card: 'Cartão'
};

export function OrderHistory({ orders }: OrderHistoryProps) {
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Pedidos</h2>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      <div className="space-y-4">
        {sortedOrders.map(order => {
          const status = STATUS_CONFIG[order.status];
          const date = new Date(order.createdAt);
          
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Header */}
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
                    <p className="text-xl font-bold text-indigo-600">R$ {order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-medium text-gray-900">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Pagamento: {PAYMENT_LABELS[order.paymentMethod as keyof typeof PAYMENT_LABELS]}</span>
                </div>

                {/* Pickup Code - Show when ready or completed */}
                {(order.status === 'ready' || order.status === 'completed') && order.pickupCode && (
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

                {/* Status Timeline */}
                {order.status !== 'cancelled' && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      {['pending', 'preparing', 'ready'].map((s, idx) => {
                        const isActive = ['pending', 'preparing', 'ready', 'completed'].indexOf(order.status) >= idx;
                        return (
                          <div key={s} className="flex-1 flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                              isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {idx + 1}
                            </div>
                            {idx < 2 && (
                              <div className={`flex-1 h-1 mx-2 transition ${
                                isActive ? 'bg-indigo-600' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">Recebido</span>
                      <span className="text-xs text-gray-500">Preparando</span>
                      <span className="text-xs text-gray-500">Pronto</span>
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