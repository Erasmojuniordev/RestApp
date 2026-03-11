import { useState, useEffect, useCallback, useRef } from 'react'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { comandaService } from '../../services/comandaService'
import {
  CreditCard, Clock, CheckCircle2, Banknote, TrendingUp,
  Wifi, WifiOff, RefreshCw, X, AlertTriangle, Loader2, Receipt
} from 'lucide-react'

const METODOS_PAGAMENTO = [
  { id: 'dinheiro',   label: 'Dinheiro',    icon: Banknote },
  { id: 'credito',    label: 'Crédito',     icon: CreditCard },
  { id: 'debito',     label: 'Débito',      icon: CreditCard },
  { id: 'pix',        label: 'Pix',         icon: TrendingUp },
]

function Badge({ status }) {
  const map = {
    Entregue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Paga:     'text-green-400 bg-green-500/10 border-green-500/30',
  }
  return (
    <span className={`inline-flex items-center text-[11px] font-black tracking-wide border px-2.5 py-1 rounded-full ${map[status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
      {status}
    </span>
  )
}

function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
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

function CardComandaEntregue({ comanda, onRegistrarPagamento }) {
  return (
    <div className="group bg-zinc-900 border-2 border-blue-500/20 hover:border-blue-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)] hover:-translate-y-0.5">
      <div className="h-1 bg-blue-500/40" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-black text-2xl leading-none">Mesa {comanda.numeroDaMesa}</span>
              <Badge status={comanda.status} />
            </div>
            <p className="text-zinc-600 text-xs">{comanda.itens?.length ?? 0} ite{(comanda.itens?.length ?? 0) !== 1 ? 'ns' : 'm'}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-black text-2xl leading-none">
              R${Number(comanda.precoTotal).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Preview dos itens */}
        <div className="bg-zinc-800/50 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 mb-5 overflow-hidden">
          {comanda.itens?.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/70 text-xs font-black">{item.quantidade}x</span>
                <span className="text-zinc-300 text-xs font-medium truncate">{item.nomeItem}</span>
              </div>
              <span className="text-zinc-500 text-xs shrink-0">R$ {Number(item.precoTotal).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
          {(comanda.itens?.length ?? 0) > 3 && (
            <div className="px-4 py-2 text-zinc-600 text-xs text-center">
              +{comanda.itens.length - 3} ite{comanda.itens.length - 3 !== 1 ? 'ns' : 'm'}
            </div>
          )}
        </div>

        <button onClick={() => onRegistrarPagamento(comanda)}
          className="w-full bg-blue-500/15 hover:bg-blue-500 border-2 border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white font-black text-sm rounded-2xl py-3 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:scale-[0.98]">
          <CreditCard size={15} /> Registrar Pagamento
        </button>
      </div>
    </div>
  )
}

function CardComandaPaga({ comanda }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl overflow-hidden opacity-70">
      <div className="h-1 bg-green-500/30" />
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-zinc-300 font-black text-sm">Mesa {comanda.numeroDaMesa}</p>
            <p className="text-zinc-600 text-xs">{comanda.itens?.length ?? 0} itens</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-green-400 font-black">R$ {Number(comanda.precoTotal).toFixed(2).replace('.', ',')}</p>
          <Badge status="Paga" />
        </div>
      </div>
    </div>
  )
}

export default function Caixa() {
  const [entregues, setEntregues]   = useState([])
  const [pagas, setPagas]           = useState([])
  const [carregando, setCarregando] = useState(true)
  const [conexao, setConexao]       = useState('conectando')
  const [modal, setModal]           = useState(null)
  const [comandaSel, setComandaSel] = useState(null)
  const [metodoPag, setMetodoPag]   = useState(null)
  const [salvando, setSalvando]     = useState(false)
  const [erro, setErro]             = useState('')
  const [pagasHoje, setPagasHoje]   = useState([])
  const hubRef = useRef(null)

  const carregar = useCallback(async () => {
    try {
      const [e, p] = await Promise.all([
        comandaService.listar('Entregue'),
        comandaService.listar('Paga'),
      ])
      const detalhesE = await Promise.all(e.map(c => comandaService.obterPorId(c.id)))
      const detalhesP = p.slice(0, 10) // últimas 10 pagas
      const detalhesP2 = await Promise.all(detalhesP.map(c => comandaService.obterPorId(c.id)))
      setEntregues(detalhesE)
      setPagas(detalhesP2)
      setPagasHoje(detalhesP2)
    } catch (err) { console.error(err) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const hub = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/hubs/cozinha?access_token=${token}`)
      .withAutomaticReconnect()
      .build()
    hub.on('ComandaProntoParaPagar', carregar)
    hub.on('StatusAtualizado', carregar)
    hub.onreconnecting(() => setConexao('reconectando'))
    hub.onreconnected(() => setConexao('conectado'))
    hub.onclose(() => setConexao('desconectado'))
    hub.start().then(() => setConexao('conectado')).catch(() => setConexao('desconectado'))
    hubRef.current = hub
    return () => hub.stop()
  }, [carregar])

  const abrirPagamento = (comanda) => {
    setComandaSel(comanda)
    setMetodoPag(null)
    setErro('')
    setModal('pagamento')
  }

  const confirmarPagamento = async () => {
    if (!metodoPag) { setErro('Selecione o método de pagamento.'); return }
    try {
      setSalvando(true); setErro('')
      await comandaService.atualizarStatus(comandaSel.id, 6) // Paga
      setModal(null)
      setComandaSel(null)
      await carregar()
    } catch (err) {
      setErro(err.response?.data?.erro ?? 'Erro ao registrar pagamento.')
    } finally { setSalvando(false) }
  }

  const totalHoje = pagasHoje.reduce((s, c) => s + Number(c.precoTotal ?? 0), 0)
  const totalPendente = entregues.reduce((s, c) => s + Number(c.precoTotal ?? 0), 0)

  return (
    <div className="p-8 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CreditCard size={18} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Caixa</h1>
            <p className="text-zinc-600 text-xs">
              <span className="text-zinc-400 font-bold">{entregues.length}</span> aguardando pagamento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border
            ${conexao === 'conectado'    ? 'text-green-400 bg-green-500/10 border-green-500/20' :
              conexao === 'reconectando' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse' :
              'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {conexao === 'conectado' ? <Wifi size={11} /> : <WifiOff size={11} />}
            {conexao === 'conectado' ? 'Ao vivo' : conexao === 'reconectando' ? 'Reconectando...' : 'Desconectado'}
          </div>
          <button onClick={carregar}
            className="p-2.5 rounded-2xl bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white transition-all cursor-pointer">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label:  'Aguardando Pagamento',
            valor:  `R$ ${totalPendente.toFixed(2).replace('.', ',')}`,
            sub:    `${entregues.length} mesa${entregues.length !== 1 ? 's' : ''}`,
            cor:    'border-blue-500/20 bg-blue-500/5',
            corVal: 'text-blue-400',
            icon:   Clock,
            icoCls: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          },
          {
            label:  'Faturado Hoje',
            valor:  `R$ ${totalHoje.toFixed(2).replace('.', ',')}`,
            sub:    `${pagasHoje.length} pagamento${pagasHoje.length !== 1 ? 's' : ''}`,
            cor:    'border-green-500/20 bg-green-500/5',
            corVal: 'text-green-400',
            icon:   TrendingUp,
            icoCls: 'bg-green-500/10 border-green-500/20 text-green-400',
          },
          {
            label:  'Ticket Médio',
            valor:  pagasHoje.length ? `R$ ${(totalHoje / pagasHoje.length).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
            sub:    'base: pagamentos de hoje',
            cor:    'border-amber-500/20 bg-amber-500/5',
            corVal: 'text-amber-400',
            icon:   Receipt,
            icoCls: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`bg-zinc-900 border-2 rounded-3xl p-5 ${card.cor}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-zinc-500 text-xs font-bold">{card.label}</p>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.icoCls}`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className={`font-black text-2xl mb-1 ${card.corVal}`}>{card.valor}</p>
              <p className="text-zinc-700 text-xs">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Pendentes de pagamento */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl h-64 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : entregues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 mb-8 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
          <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <CheckCircle2 size={22} className="text-zinc-700" />
          </div>
          <p className="text-zinc-400 font-black">Sem pendências</p>
          <p className="text-zinc-700 text-sm mt-1">Todas as mesas foram pagas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {entregues.map(comanda => (
            <CardComandaEntregue key={comanda.id} comanda={comanda} onRegistrarPagamento={abrirPagamento} />
          ))}
        </div>
      )}

      {/* Histórico recente */}
      {pagas.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-zinc-500 text-xs font-black tracking-[0.2em] uppercase">Histórico recente</h2>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <div className="space-y-2">
            {pagas.map(c => <CardComandaPaga key={c.id} comanda={c} />)}
          </div>
        </>
      )}

      {/* Modal de pagamento */}
      {modal === 'pagamento' && comandaSel && (
        <Modal titulo="Registrar Pagamento" onClose={() => setModal(null)}>
          {/* Resumo */}
          <div className="bg-zinc-800/60 border border-zinc-800 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-sm font-bold">Mesa {comandaSel.numeroDaMesa}</p>
              <p className="text-amber-400 font-black text-2xl">
                R$ {Number(comandaSel.precoTotal).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="space-y-1">
              {comandaSel.itens?.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-zinc-500">{item.quantidade}x {item.nomeItem}</span>
                  <span className="text-zinc-400 font-bold">R$ {Number(item.precoTotal).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Métodos */}
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-600 mb-3">Método de pagamento</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {METODOS_PAGAMENTO.map(m => {
              const Icon = m.icon
              const ativo = metodoPag === m.id
              return (
                <button key={m.id} onClick={() => { setMetodoPag(m.id); setErro('') }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer
                    ${ativo
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <Icon size={16} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {erro && (
            <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-3 mb-4">
              <AlertTriangle size={13} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{erro}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button onClick={confirmarPagamento} disabled={salvando || !metodoPag}
              className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-white text-sm font-black rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(34,197,94,0.4)] active:scale-[0.98]">
              {salvando ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={15} /> Confirmar Pagamento</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
