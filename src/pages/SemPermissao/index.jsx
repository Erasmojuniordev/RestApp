import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SemPermissao() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-white mb-2">Sem permissão</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Você não tem acesso a esta página.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
