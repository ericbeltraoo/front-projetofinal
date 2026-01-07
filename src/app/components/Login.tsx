import { useState } from 'react';
import type { User } from '../App';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: User) => void;
}

interface LoginResponse {
  success: boolean;
  message: string;
  // Ajustado para 'user' conforme o log do seu console
  user: User | null; 
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = 'http://localhost:8080/api/auth/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(API_URL, {
        email: email,
        password: password
      });

      console.log("Resposta do Back-end:", response.data);

      // Desestruturando conforme o padrão que veio no seu console
      const { success, message, user } = response.data;

      if (success && user) {
        setSuccessMsg(message); // Exibe "Login realizado com sucesso"
        
        // Aguarda 1 segundo para o usuário ler a mensagem de sucesso e redireciona
        setTimeout(() => {
          onLogin(user); 
        }, 1000);
        
      } else {
        setError(message || 'Credenciais inválidas');
      }
    } catch (err: any) {
      console.error("Erro na requisição:", err);
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cantina Sesi</h1>
            <p className="text-gray-600 mt-2">Sistema de Pedidos Online</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="seu.email@sesi.edu.br"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                ✅ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-bold flex justify-center items-center ${
                loading ? 'opacity-70' : ''
              }`}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}