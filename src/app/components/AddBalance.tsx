import { useState } from 'react';
import type { User } from '../App';

interface AddBalanceProps {
  user: User;
  // Alterado para Promise para podermos esperar a resposta do banco de dados
  onAddBalance: (amount: number) => Promise<void>; 
  onBack: () => void;
}

const QUICK_AMOUNTS = [20, 50, 100, 200];

export function AddBalance({ user, onAddBalance, onBack }: AddBalanceProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return;
    }

    setLoading(true);

    try {
      // AQUI ESTÁ A MUDANÇA:
      // Removemos o setTimeout (simulação) e aguardamos a função do pai (StudentDashboard)
      // que faz o fetch real no banco de dados.
      await onAddBalance(value);
      
      // Se chegou aqui, o banco atualizou com sucesso
      setSuccess(true);

      // Limpa o formulário após 2 segundos e volta
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setPaymentMethod('');
        // Opcional: Se quiser voltar para o perfil automaticamente descomente abaixo
        // onBack(); 
      }, 2000);

    } catch (error) {
      console.error("Erro ao adicionar saldo:", error);
      alert("Houve um erro ao processar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="max-w-2xl mx-auto">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Adicionar Saldo</h2>
        <p className="text-gray-600">Recarregue sua conta para realizar pedidos</p>
      </div>

      {/* Current Balance */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <p className="text-green-100 mb-2">Saldo Atual</p>
        <p className="text-4xl font-bold">R$ {user.balance?.toFixed(2)}</p>
      </div>

      {success ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Saldo Adicionado!</h3>
          <p className="text-gray-600">R$ {parseFloat(amount).toFixed(2)} foi adicionado à sua conta</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* Quick Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Valores Rápidos
              </label>
              <div className="grid grid-cols-4 gap-3">
                {QUICK_AMOUNTS.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleQuickAmount(value)}
                    className={`py-3 rounded-lg font-medium transition ${
                      amount === value.toString()
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    R$ {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou digite um valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 text-lg">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'pix'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💠</div>
                    <p className="font-medium text-gray-900">PIX</p>
                    <p className="text-xs text-gray-500">Instantâneo</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <p className="font-medium text-gray-900">Cartão</p>
                    <p className="text-xs text-gray-500">Crédito/Débito</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Valor a adicionar:</span>
                  <span className="font-bold text-gray-900">R$ {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-gray-700">Novo saldo:</span>
                  <span className="font-bold text-green-600">
                    R$ {((user.balance || 0) + parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!amount || !paymentMethod || loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Confirmar Pagamento'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ℹ️ Informações Importantes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• O saldo é creditado instantaneamente após confirmação</li>
              <li>• Pagamentos via PIX são processados em tempo real</li>
              <li>• Cartões de crédito/débito são aceitos</li>
              <li>• Valor mínimo: R$ 5,00</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}