import { useState } from 'react';
import type { User } from '../App';
import axios from 'axios';

interface RegisterProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
}

export function Register({ onRegister, onBackToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    class: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('Nome completo é obrigatório'), false;
    if (!formData.registration.trim()) return setError('Matrícula é obrigatória'), false;
    if (!formData.class) return setError('Selecione uma turma'), false;
    if (!formData.email.trim() || !formData.email.includes('@')) return setError('Email inválido'), false;
    if (formData.phone.replace(/\D/g, '').length < 10) return setError('Telefone inválido'), false;
    if (formData.password.length < 6) return setError('Senha deve ter pelo menos 6 caracteres'), false;
    if (formData.password !== formData.confirmPassword) return setError('As senhas não coincidem'), false;
    return true;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // ENVIANDO PARA O BACKEND JAVA
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        className: formData.class, 
        phone: formData.phone.replace(/\D/g, ''),
        // AJUSTE AQUI: Removido o comentário para enviar a matrícula
        registration: formData.registration 
      });

      if (response.data.success) {
        // Sucesso: O usuário agora existe no MySQL com a matrícula
        onRegister(response.data.user);
      } else {
        setError(response.data.message || 'Erro ao cadastrar');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-purple-100">Sistema de Pedidos - Cantina SESI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Seu nome" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                <input type="text" name="registration" value={formData.registration} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma *</label>
                <select name="class" value={formData.class} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="">Selecione</option>
                  <option value="1º Ano A">1º Ano A</option>
                  <option value="2º Ano A">2º Ano A</option>
                  <option value="3º Ano A">3º Ano A</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="exemplo@sesi.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="(00) 00000-0000" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50">
              {loading ? 'Processando...' : 'Finalizar Cadastro'}
            </button>

            <button type="button" onClick={onBackToLogin} className="w-full text-gray-500 text-sm hover:underline">
              Voltar para o Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}