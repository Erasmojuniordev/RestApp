import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authservice.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializa direto do localStorage — persiste entre reloads
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  const login = useCallback(async (email, senha) => {
    const data = await authService.login(email, senha)

    // Salva token e dados do usuário no localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify({
      email: data.email,
      nomeCompleto: data.nomeCompleto,
      roles: data.roles,
    }))

    setUsuario({
      email: data.email,
      nomeCompleto: data.nomeCompleto,
      roles: data.roles,
    })

    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }, [])

  // Helper para verificar role — usado nos PrivateRoutes
  const temRole = useCallback((role) => {
    return usuario?.roles?.includes(role) ?? false
  }, [usuario])

  return (
    <AuthContext.Provider value={{ usuario, login, logout, temRole }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado — evita importar useContext + AuthContext em todo lugar
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
