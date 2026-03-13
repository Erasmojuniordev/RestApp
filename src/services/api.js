import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Interceptor de requisição — injeta o token em toda chamada automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de resposta — redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Timeout ou API fora do ar
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(
        new Error('Não foi possível conectar ao servidor. Verifique sua conexão.')
      )
    }

    return Promise.reject(error)
  }
)
export default api
