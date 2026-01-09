import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

// --- INTERFACES ATUALIZADAS ---

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock: number;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN'; 
  className?: string;
  balance: number;
  phone?: string;
  registration?: string;
  favorites?: Product[]; 
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string | number;
  userId: string | number;
  userName: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  pickupCode?: string;
  cancelReason?: string; // Motivo salvo no banco
}

export interface SupportMessage {
  id: string;
  userId: string | number;
  userName: string;
  userEmail: string;
  userClass?: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  // 1. Carregar usuário e mensagens do LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('sesiUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedMessages = localStorage.getItem('sesiSupportMessages');
    if (savedMessages) {
      setSupportMessages(JSON.parse(savedMessages));
    }
  }, []);

  // 2. Buscar Produtos
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/produtos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. Buscar pedidos da API (Polling de 30s)
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const url = user.role === 'ADMIN' 
          ? 'http://localhost:8080/api/pedidos' 
          : `http://localhost:8080/api/pedidos/usuario/${user.id}`;
          
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos do banco:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // --- FUNÇÕES DE PRODUTOS ---

  const handleDeleteProduct = async (productId: string | number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${productId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id.toString() !== productId.toString()));
      }
    } catch (error) {
      alert("Erro ao excluir produto.");
    }
  };

  const handleUpdateStock = async (productId: string | number, newStock: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${productId}/estoque?quantidade=${newStock}`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id.toString() === productId.toString() ? { ...p, stock: newStock } : p
        ));
      }
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
    }
  };

  // --- FUNÇÕES DE USUÁRIO E PEDIDOS ---

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setIsRegistering(false);
    localStorage.setItem('sesiUser', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem('sesiUser');
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Atualização de Status padrão (Admin)
  const handleUpdateOrderStatus = async (orderId: string | number, status: Order['status'], reason?: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }) // O motivo pode ser enviado aqui também
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status, cancelReason: reason } : order
        ));
      }
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  };

  // NOVA FUNÇÃO: Cancelamento específico com motivo (Cliente)
  const handleCancelOrder = async (orderId: string | number, reason: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${orderId}/cancelar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', reason: reason })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Atualiza pedidos localmente
        setOrders(prev => prev.map(order =>
          order.id.toString() === orderId.toString() 
            ? { ...order, status: 'cancelled', cancelReason: reason } 
            : order
        ));

        // Atualiza saldo se o banco retornar o estorno
        if (data.updatedBalance !== undefined) {
          handleUpdateBalance(data.updatedBalance);
        }
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      console.error("Erro no cancelamento:", error);
      throw error;
    }
  };

  const handleUpdateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('sesiUser', JSON.stringify(updatedUser));
    }
  };

  const handleToggleFavorite = async (productId: string | number) => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const updatedUser: User = await response.json();
        setUser(updatedUser);
        localStorage.setItem('sesiUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  // --- SUPORTE ---

  const handleSendSupportMessage = (message: Omit<SupportMessage, 'id' | 'createdAt' | 'status'>) => {
    const newMessage: SupportMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    const updatedMessages = [...supportMessages, newMessage];
    setSupportMessages(updatedMessages);
    localStorage.setItem('sesiSupportMessages', JSON.stringify(updatedMessages));
  };

  const handleResolveSupportMessage = (messageId: string, response: string) => {
    const updatedMessages = supportMessages.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'resolved' as const, response, respondedAt: new Date().toISOString() }
        : msg
    );
    setSupportMessages(updatedMessages);
    localStorage.setItem('sesiSupportMessages', JSON.stringify(updatedMessages));
  };

  // --- ROTEAMENTO ---

  if (!user) {
    if (isRegistering) {
      return <Register onRegister={handleAuthSuccess} onBackToLogin={() => setIsRegistering(false)} />;
    }
    return <Login onLogin={handleAuthSuccess} onGoToRegister={() => setIsRegistering(true)} />;
  }

  return user.role === 'ADMIN' ? (
    <AdminDashboard
      user={user}
      products={products}
      orders={orders}
      supportMessages={supportMessages}
      onLogout={handleLogout}
      onUpdateOrderStatus={handleUpdateOrderStatus}
      onDeleteProduct={handleDeleteProduct}
      onUpdateStock={handleUpdateStock}
      onAddProduct={() => fetchProducts()}
      onResolveSupportMessage={handleResolveSupportMessage}
    />
  ) : (
    <StudentDashboard
      user={user}
      products={products}
      orders={orders}
      supportMessages={supportMessages.filter(m => m.userId.toString() === user.id.toString())}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
      onUpdateBalance={handleUpdateBalance}
      onToggleFavorite={handleToggleFavorite}
      onSendSupportMessage={handleSendSupportMessage}
      onCancelOrder={handleCancelOrder}
    />
  );
}