import { useState, useEffect } from 'react';
import type { Product } from '../App';
import axios from 'axios';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
}

const CATEGORIES = ['Todos', 'Salgados', 'Lanches', 'Bebidas', 'Sobremesas'];

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  // Estados para armazenar os produtos do banco
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Busca os produtos do Spring Boot ao carregar a página
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // URL do seu ProdutoController (verifique se é /api/produtos ou /api/products)
      const response = await axios.get('http://localhost:8080/api/produtos');
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Não foi possível carregar o cardápio.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtro aplicada sobre os produtos vindos do banco
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mostra apenas se estiver disponível e tiver estoque (opcional, conforme sua regra de negócio)
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Carregando cardápio fresquinho...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cardápio da Cantina</h2>
        <p className="text-gray-600">Escolha seus produtos favoritos e adicione ao carrinho</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center">
          {error}
          <button onClick={fetchProducts} className="block mx-auto mt-2 underline font-bold">Tentar novamente</button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
              <div className="aspect-video overflow-hidden bg-gray-100">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full uppercase">
                    {product.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-gray-500'}`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0 || !product.available}
                    className={`px-4 py-2 rounded-lg transition text-sm font-bold ${
                      product.stock <= 0 || !product.available
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {product.stock <= 0 ? 'Sem Estoque' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}