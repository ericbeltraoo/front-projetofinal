import { useState } from 'react';
import type { User, Order } from '../App';
import { ProductCatalog } from './ProductCatalog';
import { Cart } from './Cart';
import { OrderHistory } from './OrderHistory';
import { UserProfile } from './UserProfile';

interface StudentDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onPlaceOrder: (order: Order) => void;
}

type Tab = 'catalog' | 'cart' | 'orders' | 'profile';

export function StudentDashboard({ user, orders, onLogout, onPlaceOrder }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    setActiveTab('cart');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.product.id !== productId));
    } else {
      setCartItems(cartItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleCheckout = (paymentMethod: string) => {
    // Generate pickup code from last 4 digits of phone
    const pickupCode = user.phone?.slice(-4) || '0000';
    
    const order: Order = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      status: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString(),
      pickupCode
    };
    onPlaceOrder(order);
    setCartItems([]);
    setActiveTab('orders');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Cantina Sesi</h1>
                <p className="text-xs text-gray-500">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">Saldo disponível</p>
                <p className="font-bold text-green-600">R$ {user.balance?.toFixed(2)}</p>
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
        </div>
      </header>

      {/* Mobile Balance */}
      <div className="sm:hidden bg-green-50 border-b border-green-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-700">Saldo disponível</span>
          <span className="font-bold text-green-600">R$ {user.balance?.toFixed(2)}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'catalog'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🍴 Cardápio
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`relative py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'cart'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🛒 Carrinho
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Perfil
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && <ProductCatalog onAddToCart={handleAddToCart} />}
        {activeTab === 'cart' && (
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            userBalance={user.balance || 0}
          />
        )}
        {activeTab === 'orders' && <OrderHistory orders={orders} />}
        {activeTab === 'profile' && <UserProfile user={user} orders={orders} />}
      </main>
    </div>
  );
}