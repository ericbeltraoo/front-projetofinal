import { useState } from 'react';
import type { Order } from '../App';

interface PickupCodeSearchProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '✅' },
  completed: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '✕' }
};

export function PickupCodeSearch({ orders, onUpdateOrderStatus }: PickupCodeSearchProps) {
  const [code, setCode] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    setNotFound(false);
    setSearchedOrder(null);

    if (!code.trim()) return;

    const order = orders.find(o => o.pickupCode === code && (o.status === 'ready' || o.status === 'completed'));
    
    if (order) {
      setSearchedOrder(order);
    } else {
      setNotFound(true);
    }
  };

  const handleComplete = () => {
    if (searchedOrder) {
      onUpdateOrderStatus(searchedOrder.id, 'completed');
      setSearchedOrder({ ...searchedOrder, status: 'completed' });
    }
  };

  const handleClear = () => {
    setCode('');
    setSearchedOrder(null);
    setNotFound(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buscar por Código de Retirada</h2>
        <p className="text-gray-600">Digite o código do cliente para localizar o pedido</p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite os 4 dígitos do código"
              className="w-full px-4 py-3 text-2xl text-center font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tracking-widest"
              maxLength={4}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={code.length !== 4}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Buscar
          </button>
          {(searchedOrder || notFound) && (
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Not Found Message */}
      {notFound && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-red-900 mb-1">Pedido não encontrado</h3>
          <p className="text-red-700">Nenhum pedido pronto com o código <span className="font-bold">{code}</span></p>
        </div>
      )}

      {/* Order Details */}
      {searchedOrder && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-purple-200">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-bold">Pedido #{searchedOrder.id}</h3>
                <p className="text-sm text-purple-100">{searchedOrder.userName}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${STATUS_CONFIG[searchedOrder.status].color}`}>
                <span>{STATUS_CONFIG[searchedOrder.status].icon}</span>
                <span>{STATUS_CONFIG[searchedOrder.status].label}</span>
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Itens do Pedido</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {searchedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium text-gray-900">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <span className="text-lg font-medium text-gray-900">Total</span>
              <span className="text-2xl font-bold text-purple-600">R$ {searchedOrder.total.toFixed(2)}</span>
            </div>

            {/* Action Button */}
            {searchedOrder.status === 'ready' && (
              <button
                onClick={handleComplete}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg"
              >
                ✓ Confirmar Entrega
              </button>
            )}

            {searchedOrder.status === 'completed' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <svg className="w-12 h-12 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-green-900">Pedido já foi entregue</p>
                <p className="text-sm text-green-700 mt-1">
                  Entregue em {new Date(searchedOrder.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!searchedOrder && !notFound && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span>O cliente apresenta o código de 4 dígitos (últimos dígitos do telefone)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>Digite o código no campo acima e clique em "Buscar"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>Verifique os itens do pedido e confirme a entrega</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
