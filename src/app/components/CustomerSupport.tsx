import { useState } from 'react';
import type { SupportMessage } from '../App';

interface CustomerSupportProps {
  messages: SupportMessage[];
  onResolveMessage: (messageId: string, response: string) => void;
}

export function CustomerSupport({ messages, onResolveMessage }: CustomerSupportProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  const filteredMessages = messages
    .filter(m => filter === 'all' || m.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleRespond = () => {
    if (!selectedMessage || !response.trim()) return;

    setResponding(true);
    setTimeout(() => {
      onResolveMessage(selectedMessage.id, response);
      setResponding(false);
      setResponse('');
      setSelectedMessage(null);
    }, 500);
  };

  const stats = {
    total: messages.length,
    open: messages.filter(m => m.status === 'open').length,
    resolved: messages.filter(m => m.status === 'resolved').length
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Atendimento ao Cliente</h2>
        <p className="text-gray-600">Mensagens e solicitações de suporte dos alunos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Mensagens</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Em Aberto</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Resolvidas</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'open'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Em Aberto ({stats.open})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'resolved'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Resolvidas ({stats.resolved})
        </button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">Nenhuma mensagem encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Message Cards */}
          <div className="space-y-4">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition ${
                  selectedMessage?.id === msg.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{msg.userName}</h3>
                    <p className="text-sm text-gray-600">{msg.userEmail}</p>
                    {msg.userClass && (
                      <p className="text-xs text-gray-500">{msg.userClass}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    msg.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {msg.status === 'resolved' ? '✓ Resolvido' : '⏳ Aberto'}
                  </span>
                </div>

                {/* Message Preview */}
                <p className="text-gray-700 mb-3 line-clamp-2">{msg.message}</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(msg.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.status === 'open' && (
                    <span className="text-purple-600 font-medium">Clique para responder →</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail */}
          <div className="sticky top-6">
            {selectedMessage ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{selectedMessage.userName}</h3>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-1 hover:bg-white/20 rounded transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-purple-100">{selectedMessage.userEmail}</p>
                  {selectedMessage.userClass && (
                    <p className="text-sm text-purple-100">{selectedMessage.userClass}</p>
                  )}
                </div>

                {/* Message Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Enviado em {new Date(selectedMessage.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(selectedMessage.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Existing Response */}
                  {selectedMessage.response && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-green-700 mb-2">Sua Resposta:</p>
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.response}</p>
                        <p className="text-xs text-green-600 mt-2">
                          Respondido em {new Date(selectedMessage.respondedAt!).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(selectedMessage.respondedAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Response Form */}
                  {selectedMessage.status === 'open' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sua Resposta
                      </label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={6}
                        placeholder="Digite sua resposta ao aluno..."
                      />
                      <button
                        onClick={handleRespond}
                        disabled={!response.trim() || responding}
                        className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {responding ? 'Enviando...' : 'Enviar Resposta e Marcar como Resolvido'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">Selecione uma mensagem para visualizar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
