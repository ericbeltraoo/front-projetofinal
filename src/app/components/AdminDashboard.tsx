import { useState, useEffect } from 'react';
import type { User, Order, Product } from '../App';
import { StockManagement } from './StockManagement';
import { PickupCodeSearch } from './PickupCodeSearch';
import { SalesDashboard } from './SalesDashboard';

// --- Interface do Modal ---
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>; 
}

function AddProductModal({ isOpen, onClose, onSave }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Lanches', stock: '', image: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsSaving(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (isSaving) return; 

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
    } catch (error) {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Novo Produto</h2>
        <div className="space-y-4">
          <input 
            placeholder="Nome do Produto" 
            className="w-full border p-2 rounded-lg" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <textarea 
            placeholder="Descrição" 
            className="w-full border p-2 rounded-lg" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          <div className="flex gap-2">
            <input 
              placeholder="Preço" 
              type="number" 
              className="w-full border p-2 rounded-lg" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})} 
            />
            <input 
              placeholder="Estoque Inicial" 
              type="number" 
              className="w-full border p-2 rounded-lg" 
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: e.target.value})} 
            />
          </div>
          <input 
            placeholder="URL da Imagem" 
            className="w-full border p-2 rounded-lg" 
            value={formData.image}
            onChange={e => setFormData({...formData, image: e.target.value})} 
          />
          <select 
            className="w-full border p-2 rounded-lg" 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="Lanches">Lanches</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Sobremesas">Sobremesas</option>
          </select>
        </div>
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className={`flex-1 py-2 text-white rounded-lg font-bold transition-all ${
              isSaving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSaving ? 'Criando...' : 'Criar no Banco'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string | number, status: Order['status']) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
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

export function AdminDashboard({ user, orders, onLogout, onUpdateOrderStatus, onDeleteProduct }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/produtos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveNewProduct = async (productData: any) => {
    try {
      const response = await fetch('http://localhost:8080/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts(prev => [...prev, newProduct]);
        setIsModalOpen(false);
      } else {
        throw new Error("Erro ao salvar");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor Java.");
      throw error;
    }
  };

  const handleDeleteProductInternal = async (productId: string) => {
    await onDeleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id.toString() !== productId));
  };

  const handleUpdateStock = async (productId: string | number, newStock: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${productId}/estoque`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id.toString() === productId.toString() ? { ...p, stock: newStock } : p
        ));
      } else {
        alert("Erro ao atualizar estoque no servidor.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Falha na conexão com o servidor.");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <button onClick={onLogout} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button onClick={() => setActiveTab('orders')} className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'orders' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>📦 Pedidos</button>
            <button onClick={() => setActiveTab('pickup')} className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'pickup' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>🔑 Código de Retirada</button>
            <button onClick={() => setActiveTab('stock')} className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'stock' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>📊 Estoque</button>
            <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'dashboard' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>📈 Vendas</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pickup' && <PickupCodeSearch orders={orders} onUpdateOrderStatus={onUpdateOrderStatus} />}

        {activeTab === 'stock' && (
          loading ? <div className="text-center py-10">Carregando estoque...</div> : 
          <StockManagement 
            products={products} 
            onUpdateStock={handleUpdateStock} 
            onAddProduct={() => setIsModalOpen(true)} 
            onDeleteProduct={handleDeleteProductInternal} 
          />
        )}

        {activeTab === 'dashboard' && <SalesDashboard orders={orders} />}

        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6"><span className="text-sm text-gray-600">Pendentes</span><p className="text-3xl font-bold text-yellow-600">{stats.pending}</p></div>
              <div className="bg-white rounded-xl shadow-sm p-6"><span className="text-sm text-gray-600">Preparando</span><p className="text-3xl font-bold text-blue-600">{stats.preparing}</p></div>
              <div className="bg-white rounded-xl shadow-sm p-6"><span className="text-sm text-gray-600">Prontos</span><p className="text-3xl font-bold text-green-600">{stats.ready}</p></div>
              <div className="bg-white rounded-xl shadow-sm p-6"><span className="text-sm text-gray-600">Entregues</span><p className="text-3xl font-bold text-gray-600">{stats.completed}</p></div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white col-span-2 lg:col-span-1"><p className="text-sm mb-1 text-purple-100">Receita Total</p><p className="text-2xl font-bold">R$ {stats.total.toFixed(2)}</p></div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>Todos ({orders.length})</button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button key={status} onClick={() => setFilterStatus(status as Order['status'])} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === status ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
                  {config.icon} {config.label} ({orders.filter(o => o.status === status).length})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map(order => {
                const status = STATUS_CONFIG[order.status];
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <span className="font-bold text-gray-900">#{order.id}</span>
                        <p className="text-sm text-gray-600">{order.userName}</p>
                        
                        {/* Layout de Motivo de Cancelamento solicitado */}
                        {order.status === 'cancelled' && order.cancelReason && (
                          <div className="mt-3 mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <p className="text-[10px] font-bold text-red-600 uppercase">Motivo do Cancelamento</p>
                            <p className="text-sm text-red-800 italic">"{order.cancelReason}"</p>
                          </div>
                        )}

                        <span className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.icon} {status.label}</span>
                      </div>
                      <p className="text-xl font-bold text-purple-600">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm"><span>{item.quantity}x {item.product.name}</span><span className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && <button onClick={() => onUpdateOrderStatus(order.id, 'preparing')} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Iniciar Preparo</button>}
                      {order.status === 'preparing' && <button onClick={() => onUpdateOrderStatus(order.id, 'ready')} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">Pronto para Retirada</button>}
                      {order.status === 'ready' && <button onClick={() => onUpdateOrderStatus(order.id, 'completed')} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition">Entregue</button>}
                      
                      {['pending', 'preparing', 'ready'].includes(order.status) && (
                        <button 
                          onClick={() => onUpdateOrderStatus(order.id, 'cancelled')} 
                          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                          title="Cancelar Pedido"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveNewProduct} 
      />
    </div>
  );
}