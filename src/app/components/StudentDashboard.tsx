import { useState, useEffect } from 'react';
import type { User, Order, Product } from '../App';
import { ProductCatalog } from './ProductCatalog';
import { Cart } from './Cart';
import { OrderHistory } from './OrderHistory';
import { UserProfile } from './UserProfile';

interface StudentDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onPlaceOrder: (order: Order) => void;
  onUpdateBalance: (newBalance: number) => void;
}

type Tab = 'catalog' | 'cart' | 'orders' | 'profile';

export function StudentDashboard({ 
  user, 
  orders, 
  onLogout, 
  onPlaceOrder, 
  onUpdateBalance 
}: StudentDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  // Estado para o Modal de Aviso
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const [cartItems, setCartItems] = useState<any[]>(() => {
    const savedCart = localStorage.getItem(`sesi_cart_${user.id}`);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error("Erro ao ler carrinho:", error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`sesi_cart_${user.id}`, JSON.stringify(cartItems));
  }, [cartItems, user.id]);

  const handleAddToCart = (product: Product) => {
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

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.product.id !== productId));
    } else {
      setCartItems(cartItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Validação local de saldo
    if (paymentMethod === 'balance' && (user.balance || 0) < total) {
      setAlertModal({ isOpen: true, message: "Saldo Insuficiente" });
      return;
    }

    const pedidoRequest = {
      userId: user.id,
      paymentMethod: paymentMethod.toUpperCase(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoRequest)
      });

      if (response.ok) {
        const orderData = await response.json();

        if (paymentMethod === 'balance') {
          onUpdateBalance(user.balance - total);
        }

        onPlaceOrder(orderData);
        setCartItems([]); 
        localStorage.removeItem(`sesi_cart_${user.id}`);
        setActiveTab('orders');
        setAlertModal({ isOpen: true, message: "Pedido realizado com sucesso!" });
      } else {
        const errorText = await response.text();
        
        // Verificação de mensagens do servidor para exibição amigável
        if (errorText.includes("Estoque insuficiente")) {
          setAlertModal({ isOpen: true, message: "Estoque Insuficiente" });
        } else if (errorText.includes("Saldo insuficiente") || errorText.includes("balance")) {
          setAlertModal({ isOpen: true, message: "Saldo Insuficiente" });
        } else {
          setAlertModal({ isOpen: true, message: "Erro ao processar pedido: " + errorText });
        }
      }
    } catch (error) {
      setAlertModal({ isOpen: true, message: "Erro ao conectar com o servidor da cantina." });
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de Aviso */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aviso</h3>
            <p className="text-gray-600 mb-6">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

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

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'catalog' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
              }`}
            >
              🍴 Cardápio
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`relative py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'cart' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
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
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
              }`}
            >
              📋 Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
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