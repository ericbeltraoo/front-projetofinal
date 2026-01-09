import type { User, Product } from '../App';

interface FavoriteProductsProps {
  user: User;
  products: Product[]; // Mantemos aqui caso precise no futuro, mas não usaremos para filtro
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string | number) => void;
  onBack: () => void;
}

export function FavoriteProducts({ user, onAddToCart, onToggleFavorite, onBack }: FavoriteProductsProps) {
  
  // Agora a lista vem pronta dentro do usuário!
  // Se for undefined ou null, usa array vazio
  const favoriteProducts = user.favorites || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Favoritos</h2>
        <p className="text-gray-600">Produtos que você marcou como favoritos</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum favorito ainda</h3>
          <p className="text-gray-600 mb-6">Comece a favoritar produtos no cardápio!</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Ver Cardápio
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              {favoriteProducts.length} {favoriteProducts.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {/* Botão de Remover dos Favoritos */}
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition group"
                    title="Remover dos favoritos"
                  >
                    <svg className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                  
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                      Últimas unidades
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      Esgotado
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full whitespace-nowrap ml-2">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-medium ${product.stock < 10 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {product.stock > 0 ? `${product.stock} disponíveis` : 'Esgotado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                        product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}