import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  class?: string;
  balance?: number;
  phone?: string; // Added phone for pickup code
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock: number; // Added stock management
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string; // Added for pickup code
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  pickupCode?: string; // Added pickup code (last 4 digits of phone)
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('sesiUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load orders from localStorage
    const savedOrders = localStorage.getItem('sesiOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('sesiUser', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sesiUser');
  };

  const handlePlaceOrder = (order: Order) => {
    const updatedOrders = [...orders, order];
    setOrders(updatedOrders);
    localStorage.setItem('sesiOrders', JSON.stringify(updatedOrders));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('sesiOrders', JSON.stringify(updatedOrders));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        orders={orders}
        onLogout={handleLogout}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      orders={orders.filter(o => o.userId === user.id)}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
    />
  );
}