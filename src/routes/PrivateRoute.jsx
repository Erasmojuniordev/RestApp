import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// roles → array de roles permitidas. Ex: ["Admin", "Garcom"]
// Se não passar roles, só verifica se está autenticado
export function PrivateRoute({ children, roles = [] }) {
  const { usuario } = useAuth()

  // Não autenticado → vai para login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Autenticado mas sem a role necessária → vai para a rota da sua role
  if (roles.length > 0 && !roles.some(r => usuario.roles.includes(r))) {
    return <Navigate to="/sem-permissao" replace />
  }

  return children
}
