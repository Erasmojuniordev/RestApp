import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Utensils, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

const REDIRECT_POR_ROLE = {
  Admin: '/cardapio',
  Garcom: '/comanda',
  Cozinha: '/cozinha',
  Caixa: '/caixa',
}

const GRID_WORDS = ['COMANDA','COZINHA','PEDIDO','CAIXA','MESA','PREPARO','ENTREGA','PRATO','GARÇOM','FLUXO']

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [focado, setFocado] = useState(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

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
      navigate(REDIRECT_POR_ROLE[data.roles[0]] ?? '/comanda', { replace: true })
    } catch (err) {
      setErro(err.response?.data?.erro ?? 'Credenciais inválidas. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex overflow-hidden">

      {/* ── Painel esquerdo ── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-14">

        {/* Fundo com palavras em grade */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />
          {Array.from({ length: 80 }).map((_, i) => (
            <span key={i}
              className="absolute text-[10px] font-black tracking-[0.2em] text-zinc-800 whitespace-nowrap"
              style={{
                left: `${(i % 10) * 11 - 2}%`,
                top: `${Math.floor(i / 10) * 12 + 2}%`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}>
              {GRID_WORDS[i % GRID_WORDS.length]}
            </span>
          ))}
          {/* Linha diagonal de destaque */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(245,158,11,0.04) 50%, transparent 60%)' }} />
        </div>

        {/* Logo */}
        <div className={`relative flex items-center gap-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <Utensils size={20} className="text-zinc-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-black tracking-tight text-lg leading-none">KITCHEN OS</p>
            <p className="text-amber-500/60 text-[10px] tracking-[0.3em] uppercase font-bold">Sistema de Fluxo</p>
          </div>
        </div>

        {/* Headline */}
        <div className={`relative transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-amber-500 text-[10px] font-black tracking-[0.4em] uppercase mb-5">
            Controle completo
          </p>
          <h1 className="text-white font-black leading-[0.9] mb-8"
              style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)' }}>
            DO PEDIDO<br />
            <span className="text-amber-500">AO PAGA</span><br />
            MENTO
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
            Gerencie comandas, acompanhe a cozinha e processe pagamentos —
            tudo sincronizado em tempo real para toda a equipe.
          </p>
        </div>

        {/* Stats */}
        <div className={`relative flex gap-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { num: '4', label: 'Perfis de acesso' },
            { num: 'RT', label: 'Tempo real via WebSocket' },
            { num: '∞', label: 'Comandas simultâneas' },
          ].map(s => (
            <div key={s.num}>
              <p className="text-amber-400 font-black text-2xl leading-none mb-1">{s.num}</p>
              <p className="text-zinc-600 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-zinc-950">
        <div className={`w-full max-w-[380px] transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Utensils size={16} className="text-zinc-950" strokeWidth={2.5} />
            </div>
            <p className="text-white font-black">KITCHEN OS</p>
          </div>

          <div className="mb-8">
            <h2 className="text-white font-black text-3xl leading-tight mb-2">
              Bem-vindo<span className="text-amber-500">.</span>
            </h2>
            <p className="text-zinc-500 text-sm">Acesse com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-200 pointer-events-none z-10
                ${focado === 'email' || form.email
                  ? 'top-[9px] text-[10px] font-black tracking-[0.15em] uppercase text-amber-500'
                  : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500'}`}>
                Email
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                onFocus={() => setFocado('email')} onBlur={() => setFocado(null)} required
                className={`w-full bg-zinc-900 border-2 rounded-2xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200
                  ${focado === 'email'
                    ? 'border-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.08)]'
                    : 'border-zinc-800 hover:border-zinc-700'}`} />
            </div>

            {/* Senha */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-200 pointer-events-none z-10
                ${focado === 'senha' || form.senha
                  ? 'top-[9px] text-[10px] font-black tracking-[0.15em] uppercase text-amber-500'
                  : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500'}`}>
                Senha
              </label>
              <input type={mostrarSenha ? 'text' : 'password'} name="senha" value={form.senha} onChange={handleChange}
                onFocus={() => setFocado('senha')} onBlur={() => setFocado(null)} required
                className={`w-full bg-zinc-900 border-2 rounded-2xl px-4 pt-7 pb-3 pr-12 text-white text-sm outline-none transition-all duration-200
                  ${focado === 'senha'
                    ? 'border-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.08)]'
                    : 'border-zinc-800 hover:border-zinc-700'}`} />
              <button type="button" onClick={() => setMostrarSenha(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer z-10">
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm leading-snug">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <button type="submit" disabled={carregando}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                         text-zinc-950 font-black rounded-2xl py-4 text-sm tracking-wide
                         transition-all duration-200 cursor-pointer
                         hover:shadow-[0_8px_40px_rgba(245,158,11,0.35)]
                         active:scale-[0.98] flex items-center justify-center gap-2.5 mt-2">
              {carregando
                ? <Loader2 size={17} className="animate-spin" />
                : <><span>ENTRAR NO SISTEMA</span><ArrowRight size={16} strokeWidth={3} /></>}
            </button>
          </form>

          <p className="text-zinc-700 text-xs text-center mt-8">
            Kitchen OS · Sistema de Fluxo de Restaurante
          </p>
        </div>
      </div>
    </div>
  )
}
