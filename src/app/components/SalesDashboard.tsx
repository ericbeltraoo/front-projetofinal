import { useState } from 'react';
import type { Order } from '../App';

interface SalesDashboardProps {
  orders: Order[];
}

export function SalesDashboard({ orders }: SalesDashboardProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    if (order.status === 'cancelled') return false;
    
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    return orderDate >= start && orderDate <= end;
  });

  // Calculate products sold
  const productStats: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};
  
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productStats[item.product.id]) {
        productStats[item.product.id] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
          category: item.product.category
        };
      }
      productStats[item.product.id].quantity += item.quantity;
      productStats[item.product.id].revenue += item.product.price * item.quantity;
    });
  });

  const productArray = Object.entries(productStats).map(([id, data]) => ({
    id,
    ...data
  }));

  const topProducts = [...productArray].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  const leastProducts = [...productArray].sort((a, b) => a.quantity - b.quantity).slice(0, 10);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const totalItems = productArray.reduce((sum, p) => sum + p.quantity, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h2>
        <p className="text-gray-600">Análise de performance e produtos mais vendidos</p>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Filtros de Período</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 mb-2">Receita Total</p>
          <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Total de Pedidos</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Itens Vendidos</p>
          <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Ticket Médio</p>
          <p className="text-3xl font-bold text-gray-900">R$ {avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="font-bold text-green-900">🏆 Produtos Mais Vendidos</h3>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum produto vendido no período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.quantity} un.</p>
                      <p className="text-xs text-gray-600">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Least Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
            <h3 className="font-bold text-orange-900">📉 Produtos Menos Vendidos</h3>
          </div>
          <div className="p-6">
            {leastProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum produto vendido no período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leastProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{product.quantity} un.</p>
                      <p className="text-xs text-gray-600">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Vendas por Categoria</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Salgados', 'Lanches', 'Bebidas', 'Sobremesas'].map(category => {
            const categoryProducts = productArray.filter(p => p.category === category);
            const categoryQuantity = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
            const categoryRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
            
            return (
              <div key={category} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-indigo-900 mb-2">{category}</p>
                <p className="text-2xl font-bold text-indigo-600">{categoryQuantity}</p>
                <p className="text-xs text-indigo-700 mt-1">R$ {categoryRevenue.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
