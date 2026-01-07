import { useState } from 'react';
import type { CartItem } from '../App';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: (paymentMethod: string) => void;
  userBalance: number;
}

export function Cart({ items, onUpdateQuantity, onCheckout, userBalance }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'pix' | 'card'>('balance');

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const canPurchase = paymentMethod === 'balance' ? total <= userBalance : true;

  const handleCheckout = () => {
    if (!canPurchase && paymentMethod === 'balance') {
      alert('Saldo insuficiente. Escolha outra forma de pagamento.');
      return;
    }
    onCheckout(paymentMethod);
    setShowCheckout(false);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Carrinho vazio</h3>
        <p className="text-gray-500">Adicione produtos do cardápio para começar seu pedido</p>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Finalizar Pedido</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Resumo do Pedido</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-indigo-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Forma de Pagamento</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="payment"
                  value="balance"
                  checked={paymentMethod === 'balance'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Saldo da Conta</span>
                    <span className="text-sm text-gray-600">R$ {userBalance.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'balance' && total > userBalance && (
                    <p className="text-sm text-red-600 mt-1">Saldo insuficiente</p>
                  )}
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">PIX</span>
                  <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">Cartão de Débito/Crédito</span>
                  <p className="text-sm text-gray-500">Pague com seu cartão</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Voltar
            </button>
            <button
              onClick={handleCheckout}
              disabled={!canPurchase && paymentMethod === 'balance'}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meu Carrinho</h2>
        <p className="text-gray-600">Revise seus itens antes de finalizar</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="divide-y divide-gray-200">
          {items.map(item => (
            <div key={item.product.id} className="p-6 flex gap-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{item.product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.product.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="font-bold text-indigo-600">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onUpdateQuantity(item.product.id, 0)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Remover item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Total and Checkout */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg text-gray-600">Total do Pedido</span>
          <span className="text-3xl font-bold text-indigo-600">R$ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-lg"
        >
          Finalizar Pedido
        </button>
      </div> 
    </div>
  );
}
