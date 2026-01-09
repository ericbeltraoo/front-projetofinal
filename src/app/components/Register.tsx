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
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        className: formData.class, 
        phone: formData.phone.replace(/\D/g, ''),
        registration: formData.registration 
      });

      if (response.data.success) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cantina Sesi</h1>
            <p className="text-gray-600 mt-2">Crie sua conta para fazer pedidos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Seu nome" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                <input type="text" name="registration" value={formData.registration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="00000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select name="class" value={formData.class} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                  <option value="">Selecione</option>
                  <option value="1º Ano A">1º Ano A</option>
                  <option value="2º Ano A">2º Ano A</option>
                  <option value="3º Ano A">3º Ano A</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="seu.email@sesi.edu.br" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="(00) 00000-0000" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="••••••" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-bold flex justify-center items-center shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </>
              ) : 'Finalizar Cadastro'}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={onBackToLogin} 
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Já tem uma conta? <span className="font-bold underline underline-offset-4">Faça login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}