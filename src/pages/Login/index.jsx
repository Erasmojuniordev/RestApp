import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const REDIRECT_POR_ROLE = {
  Admin: '/cardapio',
  Garcom: '/comanda',
  Cozinha: '/cozinha',
  Caixa: '/caixa',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErro('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const data = await login(form.email, form.senha)

      // Redireciona para a tela correta baseado na primeira role do usuário
      const role = data.roles[0]
      const destino = REDIRECT_POR_ROLE[role] ?? '/comanda'
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err.response?.data?.erro ?? 'Erro ao fazer login. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Restaurante
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Sistema de fluxo de pedidos
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                           transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                           transition-colors"
              />
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50
                         text-zinc-950 font-semibold rounded-lg py-2.5 text-sm
                         transition-colors cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
