import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, ClipboardList, Trash2, ChevronRight,
  X, Minus, AlertTriangle, Loader2, ArrowLeft, ShoppingCart, CheckCircle2
} from 'lucide-react'
import { comandaService } from '../../services/comandaService'
import { itemService } from '../../services/itemService'

const STATUS_ESTILO = {
  Aberta:    { label: 'Aberta',             cor: 'text-zinc-400 border-zinc-700' },
  Pendente:  { label: 'Aguardando cozinha', cor: 'text-yellow-400 border-yellow-500/30' },
  EmPreparo: { label: 'Em preparo',         cor: 'text-blue-400 border-blue-500/30' },
  Pronto:    { label: 'Pronto',             cor: 'text-green-400 border-green-500/30' },
  Fechada:   { label: 'Fechada',            cor: 'text-orange-400 border-orange-500/30' },
  Paga:      { label: 'Paga',               cor: 'text-zinc-600 border-zinc-800' },
  Cancelada: { label: 'Cancelada',          cor: 'text-red-400 border-red-500/20' },
}

const STATUS_ACOES = {
  Aberta:    { label: 'Fechar Conta',            status: 'Fechada', cor: 'text-orange-400 border-orange-500/30 hover:bg-orange-500/10' },
  Pendente:  { label: 'Aguardando cozinha...',   status: null,      cor: 'text-zinc-500 border-zinc-700' },
  EmPreparo: { label: 'Em preparo...',            status: null,      cor: 'text-blue-400 border-blue-500/30' },
  Pronto:    { label: 'Confirmar Entrega',        status: 'Aberta',  cor: 'text-green-400 border-green-500/30 hover:bg-green-500/10' },
  Fechada:   { label: 'Aguardando pagamento...', status: null,      cor: 'text-zinc-500 border-zinc-700' },
  Paga:      { label: 'Paga',                    status: null,      cor: 'text-zinc-600 border-zinc-800' },
  Cancelada: { label: 'Cancelada',               status: null,      cor: 'text-red-400/50 border-red-500/20' },
}

function Badge({ status }) {
  const e = STATUS_ESTILO[status] ?? STATUS_ESTILO.Aberta
  return (
    <span className={`inline-flex items-center text-[11px] font-black tracking-wide border px-2.5 py-1 rounded-full ${e.cor}`}>
      {e.label}
    </span>
  )
}

function Modal({ titulo, onClose, children, largura = 'max-w-md' }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full ${largura} shadow-[0_25px_80px_rgba(0,0,0,0.7)]`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-white font-black text-base">{titulo}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ── Lista de Comandas ── */
function ListaComandas({ onNova, onAbrir }) {
  const [comandas, setComandas]     = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca]           = useState('')

  const carregar = useCallback(async () => {
    try {
      setCarregando(true)
      const listas = await Promise.all([
        comandaService.listar('Aberta'),
        comandaService.listar('Pendente'),
        comandaService.listar('EmPreparo'),
        comandaService.listar('Pronto'),
        comandaService.listar('Fechada'),
      ])
      setComandas(listas.flat())
    } catch (err) { console.error(err) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtradas = busca
    ? comandas.filter(c => String(c.numeroDaMesa).includes(busca))
    : comandas

  const abertas = comandas.filter(c => c.status === 'Aberta').length
  const prontas = comandas.filter(c => c.status === 'Pronto').length

  return (
    <div className="p-8 min-h-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-400" />
            </div>
            <h1 className="text-white font-black text-2xl">Comandas</h1>
          </div>
          <div className="ml-[52px] flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-bold">{comandas.length} ativas</span>
            {prontas > 0 && (
              <span className="text-green-400 font-black bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                {prontas} pronta{prontas !== 1 ? 's' : ''} para entrega
              </span>
            )}
            {abertas > 0 && (
              <span className="text-zinc-500">{abertas} aguardando pedido</span>
            )}
          </div>
        </div>
        <button onClick={onNova}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm px-5 py-3 rounded-2xl transition-all cursor-pointer hover:shadow-[0_6px_30px_rgba(245,158,11,0.45)] active:scale-[0.97]">
          <Plus size={16} strokeWidth={3} /> Nova Comanda
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input type="text" placeholder="Buscar por mesa..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-amber-500 text-white placeholder-zinc-600 text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none transition-all" />
      </div>

      {carregando ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[72px] bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
            <ClipboardList size={24} className="text-zinc-700" />
          </div>
          <p className="text-zinc-400 font-black">Nenhuma comanda ativa</p>
          <p className="text-zinc-700 text-sm mt-1">Abra uma nova comanda para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(comanda => {
            const estilo = STATUS_ESTILO[comanda.status] ?? STATUS_ESTILO.Aberta
            return (
              <button key={comanda.id} onClick={() => onAbrir(comanda.id)}
                className={`w-full flex items-center justify-between px-4 py-4 bg-zinc-900 border-2 rounded-2xl transition-all cursor-pointer group text-left
                  ${comanda.status === 'Pronto'
                    ? 'border-green-500/30 hover:border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.05)]'
                    : 'border-zinc-800 hover:border-zinc-700 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-black text-base transition-all
                    ${comanda.status === 'Pronto'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-zinc-800 border-zinc-700 text-white group-hover:border-zinc-600'}`}>
                    {comanda.numeroDaMesa}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Mesa {comanda.numeroDaMesa}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">
                      {comanda.totalItens ?? 0} ite{(comanda.totalItens ?? 0) !== 1 ? 'ns' : 'm'} · R$ {Number(comanda.precoTotal ?? 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={comanda.status} />
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Detalhe da Comanda ── */
function DetalheComanda({ comandaId, onVoltar }) {
  const [comanda, setComanda]         = useState(null)
  const [itens, setItens]             = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [modal, setModal]             = useState(null)
  const [busca, setBusca]             = useState('')
  const [carrinho, setCarrinho]       = useState([])
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState('')
  const [confirmacao, setConfirmacao] = useState(null)

  const carregar = useCallback(async () => {
    try {
      setCarregando(true)
      const [cmd, its] = await Promise.all([
        comandaService.obterPorId(comandaId),
        itemService.listar(true),
      ])
      setComanda(cmd)
      setItens(its)
    } catch (err) { console.error(err) }
    finally { setCarregando(false) }
  }, [comandaId])

  useEffect(() => { carregar() }, [carregar])

  const itensFiltrados = busca
    ? itens.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()))
    : itens

  const addCarrinho = (item) => setCarrinho(p => {
    const ex = p.find(c => c.id === item.id)
    return ex
      ? p.map(c => c.id === item.id ? { ...c, qtd: c.qtd + 1 } : c)
      : [...p, { ...item, qtd: 1, obs: '' }]
  })

  const subCarrinho = (itemId) => setCarrinho(p => {
    const ex = p.find(c => c.id === itemId)
    return ex?.qtd === 1
      ? p.filter(c => c.id !== itemId)
      : p.map(c => c.id === itemId ? { ...c, qtd: c.qtd - 1 } : c)
  })

  const confirmarPedido = async () => {
    try {
      setSalvando(true); setErro('')
      for (const item of carrinho)
        await comandaService.adicionarItem(comandaId, item.id, item.qtd, item.obs || null)
      setCarrinho([]); setModal(null); await carregar()
    } catch (err) { setErro(err.response?.data?.erro ?? 'Erro ao adicionar itens.') }
    finally { setSalvando(false) }
  }

  const removerItem = async (itemComandaId) => {
    try {
      setSalvando(true); setErro('')
      await comandaService.removerItem(comandaId, itemComandaId)
      await carregar()
    } catch (err) { setErro(err.response?.data?.erro ?? 'Erro ao remover item.') }
    finally { setSalvando(false) }
  }

  const handleAcao = async (novoStatus) => {
    try {
      setSalvando(true); setErro('')
      await comandaService.atualizarStatus(comandaId, novoStatus)
      if (novoStatus === 'Cancelada') onVoltar()
      else { await carregar(); setConfirmacao(null) }
    } catch (err) { setErro(err.response?.data?.erro ?? 'Erro ao atualizar status.') }
    finally { setSalvando(false) }
  }

  if (carregando || !comanda) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <Loader2 size={24} className="text-amber-400 animate-spin" />
      </div>
    )
  }

  const podeAdicionar = !['Paga', 'Cancelada', 'Fechada'].includes(comanda.status)
  const podeCancelar  = ['Aberta', 'Pendente'].includes(comanda.status)
  const acaoStatus    = STATUS_ACOES[comanda.status]
  const totalCarrinho = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0)

  return (
    <div className="p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVoltar}
          className="p-2.5 rounded-2xl bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-white font-black text-2xl shrink-0">Mesa {comanda.numeroDaMesa}</h1>
          <Badge status={comanda.status} />
        </div>
        {podeAdicionar && (
          <button onClick={() => { setModal('adicionar'); setBusca(''); setCarrinho([]) }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm px-4 py-2.5 rounded-2xl transition-all cursor-pointer hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-[0.97]">
            <Plus size={15} strokeWidth={3} /> Adicionar
          </button>
        )}
      </div>

      {/* Alerta pronto */}
      {comanda.status === 'Pronto' && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3 mb-5">
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          <p className="text-green-400 text-sm font-bold">Pedido pronto na cozinha! Faça a entrega ao cliente.</p>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3 mb-5">
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{erro}</p>
          <button onClick={() => setErro('')} className="ml-auto text-red-400/50 hover:text-red-400 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Itens */}
      <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl mb-5 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <p className="text-white font-black text-sm">Itens do pedido</p>
          <p className="text-zinc-600 text-xs">
            {comanda.itens?.length ?? 0} ite{(comanda.itens?.length ?? 0) !== 1 ? 'ns' : 'm'}
          </p>
        </div>

        {!comanda.itens?.length ? (
          <div className="py-14 text-center">
            <ShoppingCart size={20} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">Nenhum item adicionado ainda</p>
          </div>
        ) : (
          <div>
            {comanda.itens.map(item => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                    {item.quantidade}x
                  </span>
                  <div>
                    <p className="text-white text-sm font-bold">{item.nomeItem}</p>
                    {item.observacao && <p className="text-zinc-600 text-xs mt-0.5">— {item.observacao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white text-sm font-black">
                    R$ {Number(item.precoTotal).toFixed(2).replace('.', ',')}
                  </p>
                  {podeAdicionar && (
                    <button onClick={() => removerItem(item.id)} disabled={salvando}
                      className="w-7 h-7 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="px-6 py-4 bg-zinc-800/40 flex items-center justify-between">
              <p className="text-zinc-400 font-black text-sm">Total da mesa</p>
              <p className="text-amber-400 font-black text-2xl">
                R$ {Number(comanda.precoTotal).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        {acaoStatus?.status && (
          <button onClick={() => handleAcao(acaoStatus.status)} disabled={salvando}
            className={`flex-1 border-2 font-black text-sm rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${acaoStatus.cor}`}>
            {salvando
              ? <Loader2 size={15} className="animate-spin" />
              : <><CheckCircle2 size={15} /> {acaoStatus.label}</>}
          </button>
        )}
        {podeCancelar && (
          <button onClick={() => setConfirmacao('cancelar')}
            className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 border-2 border-zinc-800 hover:border-red-500/30 hover:text-red-400 text-zinc-500 font-bold text-sm rounded-2xl transition-all cursor-pointer">
            <Trash2 size={14} /> Cancelar Comanda
          </button>
        )}
      </div>

      {/* Modal adicionar itens */}
      {modal === 'adicionar' && (
        <Modal titulo="Adicionar Itens" onClose={() => setModal(null)} largura="max-w-lg">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input type="text" placeholder="Buscar item do cardápio..." value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full bg-zinc-800 border-2 border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-600 text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none transition-all" />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 mb-5">
            {itensFiltrados.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">Nenhum item disponível</p>
            ) : itensFiltrados.map(item => {
              const noCarrinho = carrinho.find(c => c.id === item.id)
              return (
                <div key={item.id} className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-zinc-800 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-white text-sm font-bold truncate">{item.nome}</p>
                    <p className="text-amber-400 text-xs font-black">
                      R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {noCarrinho ? (
                      <>
                        <button onClick={() => subCarrinho(item.id)}
                          className="w-8 h-8 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center cursor-pointer transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="text-white font-black text-sm w-6 text-center tabular-nums">{noCarrinho.qtd}</span>
                        <button onClick={() => addCarrinho(item)}
                          className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center cursor-pointer transition-colors">
                          <Plus size={13} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => addCarrinho(item)}
                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-400 flex items-center justify-center cursor-pointer transition-all">
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {carrinho.length > 0 && (
            <div className="border-t-2 border-zinc-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <ShoppingCart size={14} />
                  <span className="font-bold">
                    {carrinho.reduce((s, i) => s + i.qtd, 0)} ite{carrinho.reduce((s, i) => s + i.qtd, 0) !== 1 ? 'ns' : 'm'}
                  </span>
                </div>
                <span className="text-amber-400 font-black">R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
              </div>
              {erro && (
                <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-2">
                  <AlertTriangle size={12} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-xs">{erro}</p>
                </div>
              )}
              <button onClick={confirmarPedido} disabled={salvando}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-sm rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
                {salvando ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Confirmar Pedido</>}
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* Modal confirmação cancelar */}
      {confirmacao === 'cancelar' && (
        <Modal titulo="Cancelar Comanda" onClose={() => setConfirmacao(null)}>
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <p className="text-white font-black text-lg mb-2">Cancelar Mesa {comanda.numeroDaMesa}?</p>
            <p className="text-zinc-500 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmacao(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">
                Manter
              </button>
              <button onClick={() => handleAcao('Cancelada')} disabled={salvando}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-black rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2">
                {salvando ? <Loader2 size={14} className="animate-spin" /> : 'Cancelar Comanda'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Modal Nova Comanda ── */
function ModalNovaComanda({ onCriar, onFechar }) {
  const [mesa, setMesa]       = useState('')
  const [obs, setObs]         = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)
  const [focado, setFocado]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mesa || Number(mesa) < 1 || Number(mesa) > 100) {
      setErro('Número de mesa inválido (1–100).')
      return
    }
    try {
      setLoading(true); setErro('')
      await onCriar(Number(mesa), obs || null)
    } catch (err) {
      setErro(err.response?.data?.erro ?? 'Erro ao abrir comanda.')
      setLoading(false)
    }
  }

  return (
    <Modal titulo="Nova Comanda" onClose={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className={`absolute left-4 pointer-events-none transition-all duration-200 z-10
            ${focado === 'mesa' || mesa
              ? 'top-[9px] text-[10px] font-black tracking-[0.15em] uppercase text-amber-500'
              : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500'}`}>
            Número da Mesa
          </label>
          <input type="number" value={mesa} min="1" max="100" required
            onChange={e => { setMesa(e.target.value); setErro('') }}
            onFocus={() => setFocado('mesa')} onBlur={() => setFocado(null)}
            className={`w-full bg-zinc-800 border-2 rounded-2xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all
              ${focado === 'mesa'
                ? 'border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
                : 'border-zinc-700 hover:border-zinc-600'}`} />
        </div>

        <div>
          <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-zinc-500 mb-2">
            Observação
          </label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
            placeholder="Informações especiais (opcional)"
            className="w-full bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600 focus:border-amber-500 rounded-2xl px-4 py-3 text-white text-sm placeholder-zinc-600 outline-none transition-all resize-none" />
        </div>

        {erro && (
          <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-3">
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{erro}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onFechar}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-sm rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Abrir Comanda</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Página raiz ── */
export default function Comanda() {
  const [view, setView]             = useState('lista')
  const [comandaId, setComandasId]  = useState(null)
  const [modalNova, setModalNova]   = useState(false)

  const handleCriar = async (mesa, obs) => {
    const nova = await comandaService.abrir(mesa, obs)
    setModalNova(false)
    setComandasId(nova.id)
    setView('detalhe')
  }

  if (view === 'detalhe' && comandaId) {
    return (
      <DetalheComanda
        comandaId={comandaId}
        onVoltar={() => { setView('lista'); setComandasId(null) }}
      />
    )
  }

  return (
    <>
      <ListaComandas
        onNova={() => setModalNova(true)}
        onAbrir={id => { setComandasId(id); setView('detalhe') }}
      />
      {modalNova && <ModalNovaComanda onCriar={handleCriar} onFechar={() => setModalNova(false)} />}
    </>
  )
}