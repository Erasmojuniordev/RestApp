import api from './api'

export const authService = {
  login: async (email, senha) => {
    const { data } = await api.post('/api/auth/login', { email, senha })
    return data
  },

  criarUsuario: async (usuario) => {
    const { data } = await api.post('/api/auth/usuarios', usuario)
    return data
  },
}
