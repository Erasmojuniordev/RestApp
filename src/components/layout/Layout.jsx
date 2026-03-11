import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ChefHat, ClipboardList, CreditCard, Utensils, LogOut, User } from 'lucide-react'

const NAV_POR_ROLE = {
  Admin:   [{ label: 'Cardápio',       path: '/cardapio', icon: ChefHat }],
  Garcom:  [{ label: 'Comandas',       path: '/comanda',  icon: ClipboardList }],
  Cozinha: [{ label: 'Painel Cozinha', path: '/cozinha',  icon: ChefHat }],
  Caixa:   [{ label: 'Caixa',          path: '/caixa',    icon: CreditCard }],
}

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const role = usuario?.roles?.[0]
  const navItems = NAV_POR_ROLE[role] ?? []

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              <Utensils size={16} className="text-zinc-950" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm leading-none tracking-tight">KITCHEN OS</p>
              <p className="text-amber-500/60 text-[10px] tracking-[0.2em] uppercase font-bold mt-0.5">{role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                   ${isActive
                     ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_2px_10px_rgba(245,158,11,0.08)]'
                     : 'text-zinc-500 hover:text-white hover:bg-zinc-800 border border-transparent'}`
                }>
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Perfil */}
        <div className="p-3 border-t border-zinc-800 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <User size={14} className="text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-black truncate leading-none mb-0.5">{usuario?.nomeCompleto}</p>
              <p className="text-zinc-600 text-[10px] truncate">{usuario?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/8 transition-all cursor-pointer border border-transparent hover:border-red-500/15">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>

    </div>
  )
}
