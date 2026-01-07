import { useState } from 'react';
import type { User, Order, Product } from '../App';
import { StockManagement } from './StockManagement';
import { PickupCodeSearch } from './PickupCodeSearch';
import { SalesDashboard } from './SalesDashboard';

interface AdminDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

type Tab = 'orders' | 'pickup' | 'stock' | 'dashboard';
type FilterStatus = 'all' | Order['status'];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '✅' },
  completed: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: '✓' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '✕' }
};

// Mock products - In real app, this would come from database
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Salgado Assado', description: 'Coxinha, esfiha ou risoles assados', price: 4.50, category: 'Salgados', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400', available: true, stock: 25 },
  { id: '2', name: 'Salgado Frito', description: 'Coxinha, pastel ou bolinha de queijo', price: 5.00, category: 'Salgados', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', available: true, stock: 30 },
  { id: '3', name: 'Hambúrguer', description: 'Hambúrguer artesanal com queijo', price: 12.00, category: 'Lanches', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', available: true, stock: 15 },
  { id: '4', name: 'Hot Dog', description: 'Hot dog completo com batata palha', price: 8.00, category: 'Lanches', image: 'https://images.unsplash.com/photo-1612392062798-2510c7b11573?w=400', available: true, stock: 20 },
  { id: '5', name: 'Sanduíche Natural', description: 'Pão integral com peito de peru e queijo', price: 7.50, category: 'Lanches', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400', available: true, stock: 18 },
  { id: '6', name: 'Suco Natural', description: 'Laranja, limão ou morango - 300ml', price: 5.50, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', available: true, stock: 40 },
  { id: '7', name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná ou Fanta - 350ml', price: 4.00, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', available: true, stock: 50 },
  { id: '8', name: 'Água Mineral', description: 'Água mineral sem gás - 500ml', price: 2.50, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', available: true, stock: 60 },
  { id: '9', name: 'Açaí no Copo', description: 'Açaí com banana e granola - 300ml', price: 10.00, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', available: true, stock: 12 },
  { id: '10', name: 'Brownie', description: 'Brownie de chocolate com nozes', price: 6.00, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', available: true, stock: 22 },
  { id: '11', name: 'Sorvete', description: 'Picolé de frutas variadas', price: 3.50, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', available: true, stock: 35 },
  { id: '12', name: 'Salada de Frutas', description: 'Mix de frutas frescas - 250g', price: 8.00, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400', available: true, stock: 10 }
];

export function AdminDashboard({ user, orders, onLogout, onUpdateOrderStatus }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const filteredOrders = orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    total: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    // In real app, would persist to database
    localStorage.setItem('sesiProducts', JSON.stringify(products));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-xs text-gray-500">{user.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'orders'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📦 Pedidos
            </button>
            <button
              onClick={() => setActiveTab('pickup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'pickup'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔑 Código de Retirada
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'stock'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Estoque
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Dashboard de Vendas
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pickup' && (
          <PickupCodeSearch orders={orders} onUpdateOrderStatus={onUpdateOrderStatus} />
        )}

        {activeTab === 'stock' && (
          <StockManagement products={products} onUpdateStock={handleUpdateStock} />
        )}

        {activeTab === 'dashboard' && (
          <SalesDashboard orders={orders} />
        )}

        {activeTab === 'orders' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pendentes</span>
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Preparando</span>
                  <span className="text-2xl">👨‍🍳</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.preparing}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Prontos</span>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.ready}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Entregues</span>
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white col-span-2 lg:col-span-1">
                <p className="text-sm mb-2 text-purple-100">Receita Total</p>
                <p className="text-2xl font-bold">R$ {stats.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    filterStatus === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todos ({orders.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as Order['status'])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      filterStatus === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {config.icon} {config.label} ({orders.filter(o => o.status === status).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrders.map(order => {
                  const status = STATUS_CONFIG[order.status];
                  const date = new Date(order.createdAt);

                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">#{order.id}</span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                <span>{status.icon}</span>
                                <span>{status.label}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{order.userName}</p>
                            <p className="text-xs text-gray-500">
                              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {order.pickupCode && (
                              <p className="text-xs text-purple-600 font-medium mt-1">
                                Código: {order.pickupCode}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-purple-600">R$ {order.total.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
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

                        {/* Actions */}
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                Iniciar Preparo
                              </button>
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                            >
                              Marcar como Pronto
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                            >
                              Marcar como Entregue
                            </button>
                          )}
                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <div className="flex-1 text-center text-sm text-gray-500 py-2">
                              {order.status === 'completed' ? 'Pedido finalizado' : 'Pedido cancelado'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
