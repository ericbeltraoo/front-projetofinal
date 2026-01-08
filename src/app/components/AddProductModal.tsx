import { useState } from 'react';

export function AddProductModal({ isOpen, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Lanches', stock: '', image: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Cadastrar Novo Produto</h2>
        <div className="space-y-3">
          <input placeholder="Nome" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input placeholder="Descrição" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="flex gap-2">
            <input placeholder="Preço" type="number" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, price: e.target.value})} />
            <input placeholder="Estoque" type="number" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <input placeholder="URL da Imagem" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, image: e.target.value})} />
          <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="Lanches">Lanches</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Sobremesas">Sobremesas</option>
          </select>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded font-bold">Cancelar</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2 bg-purple-600 text-white rounded font-bold">Salvar no Banco</button>
        </div>
      </div>
    </div>
  );
}