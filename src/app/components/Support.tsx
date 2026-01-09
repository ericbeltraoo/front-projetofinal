import { useState } from 'react';
import type { User, SupportMessage } from '../App';

interface SupportProps {
  user: User;
  onSendMessage: (message: Omit<SupportMessage, 'id' | 'createdAt' | 'status'>) => void;
  onBack: () => void;
  messages: SupportMessage[];
}

export function Support({ user, onSendMessage, onBack, messages }: SupportProps) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const userMessages = messages.filter(m => m.userId === user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !category) return;

    setSending(true);

    setTimeout(() => {
      onSendMessage({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userClass: user.class,
        message: `[${category}] ${message}`
      });

      setSending(false);
      setShowSuccess(true);
      setMessage('');
      setCategory('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Suporte e Atendimento</h2>
        <p className="text-gray-600">Precisa de ajuda? Entre em contato conosco</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Nova Mensagem</h3>
            
            {showSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800">Mensagem enviada com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* User Info (Read-only) */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma
                  </label>
                  <input
                    type="text"
                    value={user.class || '-'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Problema com Pedido">Problema com Pedido</option>
                  <option value="Problema com Pagamento">Problema com Pagamento</option>
                  <option value="Produto com Defeito">Produto com Defeito</option>
                  <option value="Sugestão">Sugestão</option>
                  <option value="Dúvida">Dúvida</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Descreva seu problema ou dúvida detalhadamente..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} caracteres
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending || !message.trim() || !category}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>

          {/* Message History */}
          {userMessages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Minhas Mensagens</h3>
              <div className="space-y-4">
                {userMessages.map(msg => (
                  <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {msg.status === 'resolved' ? 'Resolvido' : 'Em Aberto'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{msg.message}</p>
                    {msg.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Resposta da Administração:</p>
                        <p className="text-sm text-blue-800">{msg.response}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(msg.respondedAt!).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(msg.respondedAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">💡 Dicas</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Seja claro e detalhado</li>
              <li>• Informe o número do pedido se aplicável</li>
              <li>• Responderemos em até 24h</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-3">📞 Contatos</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Telefone</p>
                <p className="font-medium text-gray-900">(11) 3000-0000</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">suporte@sesi.edu.br</p>
              </div>
              <div>
                <p className="text-gray-500">Horário</p>
                <p className="font-medium text-gray-900">Seg-Sex: 7h-17h</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-green-900 mb-3">❓ FAQ</h3>
            <div className="text-sm text-green-800 space-y-2">
              <details className="cursor-pointer">
                <summary className="font-medium">Como adicionar saldo?</summary>
                <p className="mt-2 text-green-700">Acesse "Adicionar Saldo" no menu e escolha o valor.</p>
              </details>
              <details className="cursor-pointer">
                <summary className="font-medium">Como cancelar pedido?</summary>
                <p className="mt-2 text-green-700">Entre em contato imediatamente pelo suporte.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
