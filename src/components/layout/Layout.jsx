import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_POR_ROLE = {
  Admin:   [{ label: 'Cardápio', path: '/cardapio', icon: '🍴' }],
  Garcom:  [{ label: 'Comanda',  path: '/comanda',  icon: '📋' }],
  Cozinha: [{ label: 'Cozinha',  path: '/cozinha',  icon: '👨‍🍳' }],
  Caixa:   [{ label: 'Caixa',   path: '/caixa',    icon: '💳' }],
}

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const role = usuario?.roles?.[0]
  const navItems = NAV_POR_ROLE[role] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Restaurante</p>
              <p className="text-zinc-500 text-xs">{role}</p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuário + Logout */}
        <div className="p-3 border-t border-zinc-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-sm font-medium truncate">
              {usuario?.nomeCompleto}
            </p>
            <p className="text-zinc-500 text-xs truncate">{usuario?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       text-zinc-400 hover:text-red-400 hover:bg-red-500/10
                       transition-colors cursor-pointer"
          >
            <span>🚪</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}
