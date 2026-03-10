import api from './api'

export const itemService = {
  listar: async (apenasDisponiveis = null) => {
    const params = apenasDisponiveis !== null ? { apenasDisponiveis } : {}
    const { data } = await api.get('/api/itens', { params })
    return data
  },

  obterPorId: async (id) => {
    const { data } = await api.get(`/api/itens/${id}`)
    return data
  },

  criar: async (item) => {
    const { data } = await api.post('/api/itens', item)
    return data
  },

  atualizar: async (id, item) => {
    const { data } = await api.put(`/api/itens/${id}`, item)
    return data
  },

  alterarDisponibilidade: async (id, disponivel) => {
    await api.patch(`/api/itens/${id}/disponibilidade`, null, {
      params: { disponivel },
    })
  },

  deletar: async (id) => {
    await api.delete(`/api/itens/${id}`)
  },
}
