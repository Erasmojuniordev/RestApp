import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react'

export default function SemPermissao() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldOff size={32} className="text-red-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-zinc-950" />
        </div>

        <p className="text-red-400 text-[10px] font-black tracking-[0.4em] uppercase mb-3">Acesso Negado</p>
        <h1 className="text-white font-black text-3xl mb-3">Sem permissão</h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          Você não tem autorização para acessar esta página.
          Entre em contato com o administrador do sistema.
        </p>

        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl transition-all cursor-pointer">
            <ArrowLeft size={15} /> Voltar
          </button>
          <button onClick={() => { logout(); navigate('/login', { replace: true }) }}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-black rounded-2xl transition-all cursor-pointer hover:shadow-[0_4px_20px_rgba(245,158,11,0.3)]">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>
    </div>
  )
}
