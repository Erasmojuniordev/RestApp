import api from './api'

export const comandaService = {
  listar: async (status = null) => {
    const params = status ? { status } : {}
    const { data } = await api.get('/api/comandas', { params })
    return data
  },

  obterPorId: async (id) => {
    const { data } = await api.get(`/api/comandas/${id}`)
    return data
  },

  abrir: async (numeroDaMesa, observacao = null) => {
    const { data } = await api.post('/api/comandas', { numeroDaMesa, observacao })
    return data
  },

  adicionarItem: async (comandaId, itemId, quantidade, observacao = null) => {
    const { data } = await api.post(`/api/comandas/${comandaId}/itens`, {
      itemId,
      quantidade,
      observacao,
    })
    return data
  },

  removerItem: async (comandaId, itemComandaId) => {
    await api.delete(`/api/comandas/${comandaId}/itens/${itemComandaId}`)
  },

  atualizarStatus: async (comandaId, novoStatus) => {
    const { data } = await api.patch(`/api/comandas/${comandaId}/status`, { novoStatus })
    return data
  },
}
