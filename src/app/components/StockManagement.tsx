import { useState } from 'react';
import type { Product } from '../App';

interface StockManagementProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: () => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>; 
}

export function StockManagement({ products, onUpdateStock, onAddProduct, onDeleteProduct, onUpdateProduct }: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Lista de categorias atualizada (sem "Lanches")
  const CATEGORIES = ['Salgados', 'Bebidas', 'Sobremesas'];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingId(product.id.toString());
    setEditForm({ ...product });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveFull = async () => {
    if (editForm) {
      if (onUpdateProduct) {
        await onUpdateProduct(editForm);
      } else {
        onUpdateStock(editForm.id.toString(), editForm.stock);
      }
      setEditingId(null);
      setEditForm(null);
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await onDeleteProduct(productToDelete.id.toString());
        setProductToDelete(null);
      } catch (error) {
        setProductToDelete(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-0">
      {/* Modal de Exclusão */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Produto</h3>
            <p className="text-gray-600 mb-6">
              Deseja realmente remover <span className="font-bold text-gray-800">"{productToDelete.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setProductToDelete(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-md">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Gerenciamento de Estoque</h2>
          <p className="text-gray-500">Controle total do cardápio e disponibilidade</p>
        </div>
        <button onClick={onAddProduct} className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm" />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produto / Imagem</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Nome e URL Imagem */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <input 
                          type="text" 
                          value={editForm?.name} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                          placeholder="Nome"
                        />
                        <input 
                          type="text" 
                          value={editForm?.image} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, image: e.target.value} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-[10px] text-gray-500"
                          placeholder="URL da Imagem"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover mr-4 shadow-sm" />
                        <span className="font-semibold text-gray-800">{product.name}</span>
                      </div>
                    )}
                  </td>

                  {/* Descrição */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <textarea 
                        value={editForm?.description}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, description: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm min-w-[150px]"
                        rows={2}
                      />
                    ) : (
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-[150px]">{product.description}</div>
                    )}
                  </td>

                  {/* Categoria Arredondada */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <div className="relative min-w-[130px]">
                        <select 
                          value={editForm?.category}
                          onChange={(e) => setEditForm(prev => prev ? {...prev, category: e.target.value} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full">{product.category}</span>
                    )}
                  </td>

                  {/* Preço */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <input 
                        type="number" 
                        value={editForm?.price}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">R$ {product.price.toFixed(2)}</span>
                    )}
                  </td>

                  {/* Estoque */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <input
                        type="number"
                        value={editForm?.stock}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, stock: parseInt(e.target.value)} : null)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        min="0"
                      />
                    ) : (
                      <span className={`font-bold px-3 py-1 rounded-lg ${product.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {product.stock}
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    {editingId === product.id.toString() ? (
                      <div className="flex items-center gap-3">
                        <button onClick={handleSaveFull} className="bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 font-bold text-xs shadow-sm transition-all">Salvar</button>
                        <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 font-bold text-xs">Sair</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(product)} className="text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors">Editar</button>
                        <button onClick={() => setProductToDelete(product)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}