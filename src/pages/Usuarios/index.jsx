import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, X, Check, AlertTriangle, Loader2, Shield } from 'lucide-react'
import { authService } from '../../services/authservice'

const ROLES = ['Admin', 'Garcom', 'Cozinha', 'Caixa']

const ROLE_ESTILO = {
  Admin:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Garcom:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Cozinha: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Caixa:   'text-green-400 bg-green-500/10 border-green-500/30',
}

const USUARIO_VAZIO = { nomeCompleto: '', email: '', senha: '', role: '' }

function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-white font-black text-base">{titulo}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function FloatInput({ label, name, value, onChange, type = 'text', error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || !!value
  return (
    <div>
      <div className="relative">
        <label className={`absolute left-4 pointer-events-none transition-all duration-200 z-10
          ${active ? 'top-[9px] text-[10px] font-black tracking-[0.15em] uppercase' : 'top-1/2 -translate-y-1/2 text-sm'}
          ${error ? 'text-red-400' : active ? 'text-amber-500' : 'text-zinc-500'}`}>
          {label}
        </label>
        <input type={type} name={name} value={value ?? ''} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`w-full bg-zinc-800 border-2 rounded-2xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200
            ${error ? 'border-red-500/70' : focused ? 'border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]' : 'border-zinc-700 hover:border-zinc-600'}`} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  )
}

function FormUsuario({ onSalvar, onCancelar, carregando }) {
  const [form, setForm] = useState(USUARIO_VAZIO)
  const [erros, setErros] = useState({})

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErros(p => ({ ...p, [e.target.name]: '' }))
  }

  const validar = () => {
  const e = {}
  if (!form.nomeCompleto?.trim()) e.nomeCompleto = 'Nome obrigatório'
  if (!form.email?.trim()) e.email = 'Email obrigatório'
  if (!form.senha || form.senha.length < 8)
    e.senha = 'Mínimo 8 caracteres'
  else if (!/[A-Z]/.test(form.senha))
    e.senha = 'Precisa de ao menos uma letra maiúscula'
  else if (!/[0-9]/.test(form.senha))
    e.senha = 'Precisa de ao menos um número'
  else if (!/[^A-Za-z0-9]/.test(form.senha))
    e.senha = 'Precisa de ao menos um caractere especial'
  if (!form.role) e.role = 'Selecione um nível de acesso'
  return e
}

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErros(errs); return }
    onSalvar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatInput label="Nome completo" name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange} error={erros.nomeCompleto} />
      <FloatInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={erros.email} />
      <FloatInput label="Senha" name="senha" type="password" value={form.senha} onChange={handleChange} error={erros.senha} />
        <p className="text-zinc-600 text-xs ml-1 -mt-2">
          Mínimo 8 caracteres, letra maiúscula, número e caractere especial.
        </p>

      <div>
        <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-zinc-500 mb-3">
          Nível de acesso
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map(role => {
            const ativo = form.role === role
            return (
              <button key={role} type="button"
                onClick={() => { setForm(p => ({ ...p, role })); setErros(p => ({ ...p, role: '' })) }}
                className={`flex items-center gap-2 p-3.5 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer
                  ${ativo
                    ? `${ROLE_ESTILO[role]} border-current`
                    : 'border-zinc-800 bg-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                <Shield size={14} />
                {role}
              </button>
            )
          })}
        </div>
        {erros.role && <p className="text-red-400 text-xs mt-1.5 ml-1">{erros.role}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={carregando}
          className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-sm font-black rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] active:scale-[0.98]">
          {carregando ? <Loader2 size={15} className="animate-spin" /> : <><Check size={14} /> Criar Usuário</>}
        </button>
      </div>
    </form>
  )
}

export default function Usuarios() {
  const [modal, setModal]         = useState(false)
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')
  const [sucesso, setSucesso]     = useState('')

  // A API não tem endpoint de listagem de usuários exposto,
  // então mantemos apenas criação por enquanto
  const handleCriar = async (form) => {
    try {
      setSalvando(true)
      setErro('')
      await authService.criarUsuario(form)
      setSucesso(`Usuário "${form.nomeCompleto}" criado com sucesso.`)
      setModal(false)
      setTimeout(() => setSucesso(''), 4000)
    } catch (err) {
      setErro(err.response?.data?.erro ?? err.response?.data?.title ?? 'Erro ao criar usuário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-8 min-h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Users size={18} className="text-violet-400" />
            </div>
            <h1 className="text-white font-black text-2xl">Usuários</h1>
          </div>
          <p className="text-zinc-600 text-sm ml-[52px]">Gerencie os acessos da equipe</p>
        </div>
        <button onClick={() => { setModal(true); setErro('') }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm px-5 py-3 rounded-2xl transition-all cursor-pointer hover:shadow-[0_6px_30px_rgba(245,158,11,0.45)] active:scale-[0.97]">
          <Plus size={16} strokeWidth={3} /> Novo Usuário
        </button>
      </div>

      {/* Feedback de sucesso */}
      {sucesso && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-6">
          <Check size={15} className="text-green-400 shrink-0" />
          <p className="text-green-400 text-sm">{sucesso}</p>
        </div>
      )}

      {/* Níveis de acesso — informativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            role: 'Admin',
            desc: 'Acesso total ao sistema.',
            acessos: ['Cardápio', 'Comandas', 'Cozinha', 'Caixa', 'Usuários'],
          },
          {
            role: 'Garcom',
            desc: 'Gestão de comandas e mesas.',
            acessos: ['Abrir comandas', 'Adicionar itens', 'Confirmar entregas'],
          },
          {
            role: 'Cozinha',
            desc: 'Painel de preparo em tempo real.',
            acessos: ['Ver pedidos', 'Iniciar preparo', 'Marcar pronto'],
          },
          {
            role: 'Caixa',
            desc: 'Fechamento e pagamentos.',
            acessos: ['Ver entregas', 'Registrar pagamento', 'Relatório diário'],
          },
        ].map(item => (
          <div key={item.role}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-black border px-2.5 py-1 rounded-full ${ROLE_ESTILO[item.role]}`}>
                <Shield size={11} /> {item.role}
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">{item.desc}</p>
            <ul className="space-y-1.5">
              {item.acessos.map(a => (
                <li key={a} className="flex items-center gap-2 text-xs text-zinc-600">
                  <div className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal titulo="Novo Usuário" onClose={() => setModal(false)}>
          {erro && (
            <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-3 mb-4">
              <AlertTriangle size={13} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{erro}</p>
            </div>
          )}
          <FormUsuario onSalvar={handleCriar} onCancelar={() => setModal(false)} carregando={salvando} />
        </Modal>
      )}
    </div>
  )
}