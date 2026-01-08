import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN'; 
  className?: string;
  balance: number;
  phone?: string;
  registration?: string;
}

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
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // 1. Carregar usuário do LocalStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('sesiUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. Buscar Produtos do Banco de Dados
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

  // 3. Buscar pedidos da API (MySQL)
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

  // --- FUNÇÕES DE PRODUTOS (BACKEND) ---

  // EXCLUIR PRODUTO
  const handleDeleteProduct = async (productId: string | number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove da lista local para atualizar a interface imediatamente
        setProducts(prev => prev.filter(p => p.id.toString() !== productId.toString()));
      } else {
        alert("Erro ao excluir produto no banco de dados.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Servidor offline ou erro de rede.");
    }
  };

  // ATUALIZAR ESTOQUE
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

  const handleUpdateOrderStatus = async (orderId: string | number, status: Order['status']) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${orderId}/status?novoStatus=${status}`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      alert("Erro ao atualizar status no servidor.");
    }
  };

  const handleUpdateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('sesiUser', JSON.stringify(updatedUser));
    }
  };

  // --- Roteamento ---

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
      onLogout={handleLogout}
      onUpdateOrderStatus={handleUpdateOrderStatus}
      onDeleteProduct={handleDeleteProduct}
      onUpdateStock={handleUpdateStock}
      onAddProduct={() => fetchProducts()} // Recarrega após adicionar
    />
  ) : (
    <StudentDashboard
      user={user}
      products={products}
      orders={orders}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
      onUpdateBalance={handleUpdateBalance}
    />
  );
}