import { useState, useEffect, useCallback, useRef } from 'react'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { comandaService } from '../../services/comandaService'
import { Clock, CheckCircle2, Flame, Wifi, WifiOff, ChefHat, RefreshCw, Filter } from 'lucide-react'

const STATUS = {
  Pendente:  { label: 'Pendente',   cor: 'amber',  icone: Clock,         acao: 'Iniciar Preparo', novoStatus: 3 },
  EmPreparo: { label: 'Em Preparo', cor: 'orange', icone: Flame,         acao: 'Marcar Pronto',   novoStatus: 4 },
  Pronto:    { label: 'Pronto',     cor: 'green',  icone: CheckCircle2,  acao: null,              novoStatus: null },
}

const COR = {
  amber:  { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',  barra: 'bg-amber-500',  btn: 'border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]' },
  orange: { badge: 'text-orange-400 bg-orange-500/10 border-orange-500/30', barra: 'bg-orange-500', btn: 'border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-zinc-950 hover:shadow-[0_4px_20px_rgba(249,115,22,0.4)]' },
  green:  { badge: 'text-green-400 bg-green-500/10 border-green-500/30',   barra: 'bg-green-500',  btn: '' },
}

const FILTROS = ['Todos', 'Pendente', 'EmPreparo', 'Pronto']

function TempoDecorrido({ criadoEm }) {
  const [min, setMin] = useState(0)
  useEffect(() => {
    const calc = () => setMin(Math.floor((Date.now() - new Date(criadoEm)) / 60000))
    calc()
    const t = setInterval(calc, 30000)
    return () => clearInterval(t)
  }, [criadoEm])

  const cor = min < 10 ? 'text-zinc-500' : min < 20 ? 'text-amber-400' : 'text-red-400'
  const bg  = min < 10 ? 'bg-zinc-800' : min < 20 ? 'bg-amber-500/10' : 'bg-red-500/10'
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cor} ${bg}`}>
      <Clock size={10} /> {min}min
    </span>
  )
}

function CardComanda({ comanda, onAvancar, avancando, isNova }) {
  const cfg = STATUS[comanda.status]
  const cor = cfg ? COR[cfg.cor] : null
  const Icon = cfg?.icone

  return (
    <div className={`relative bg-zinc-900 rounded-3xl overflow-hidden border transition-all duration-300
                     hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-0.5
                     ${isNova ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]' :
                       comanda.status === 'Pronto' ? 'border-green-500/30' :
                       comanda.status === 'EmPreparo' ? 'border-orange-500/20' : 'border-zinc-800'}`}>

      <div className={`h-1 w-full ${cor?.barra ?? 'bg-zinc-800'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-white font-black text-2xl leading-none">Mesa {comanda.numeroDaMesa}</span>
              {isNova && (
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-full animate-pulse">
                  NOVO
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {cfg && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2.5 py-1 rounded-full ${cor.badge}`}>
                  <Icon size={11} /> {cfg.label}
                </span>
              )}
              <TempoDecorrido criadoEm={comanda.criadoEm} />
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="space-y-0 mb-5 max-h-52 overflow-y-auto rounded-2xl bg-zinc-800/40 border border-zinc-800 divide-y divide-zinc-800">
          {comanda.itens?.map(item => (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/20
                               text-amber-400 text-xs font-black flex items-center justify-center">
                {item.quantidade}x
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-bold truncate">{item.nomeItem}</p>
                {item.observacao && (
                  <p className="text-zinc-500 text-xs mt-0.5 truncate">— {item.observacao}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botão de ação */}
        {cfg?.acao && (
          <button onClick={() => onAvancar(comanda.id, cfg.novoStatus)} disabled={avancando === comanda.id}
            className={`w-full py-3 rounded-2xl text-sm font-black transition-all cursor-pointer
                        flex items-center justify-center gap-2 bg-transparent border-2 active:scale-[0.98]
                        disabled:opacity-50 ${cor?.btn}`}>
            {avancando === comanda.id
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <><cfg.icone size={15} /> {cfg.acao}</>}
          </button>
        )}

        {comanda.status === 'Pronto' && (
          <div className="w-full py-3 rounded-2xl text-sm font-black bg-green-500/10 border-2 border-green-500/30 text-green-400 flex items-center justify-center gap-2">
            <CheckCircle2 size={15} /> Aguardando retirada pelo garçom
          </div>
        )}
      </div>
    </div>
  )
}

export default function Cozinha() {
  const [comandas, setComandas]   = useState([])
  const [carregando, setCarregando] = useState(true)
  const [avancando, setAvancando] = useState(null)
  const [filtro, setFiltro]       = useState('Todos')
  const [conexao, setConexao]     = useState('conectando')
  const [novas, setNovas]         = useState([])
  const hubRef = useRef(null)

  const carregar = useCallback(async () => {
    const [p, e, r] = await Promise.all([
      comandaService.listar('Pendente'),
      comandaService.listar('EmPreparo'),
      comandaService.listar('Pronto'),
    ])
    setComandas([...p, ...e, ...r])
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const hub = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/hubs/cozinha?access_token=${token}`)
      .withAutomaticReconnect()
      .build()

    hub.on('NovoPedido', (data) => {
      setNovas(prev => [...prev, data.comandaId])
      setTimeout(() => setNovas(prev => prev.filter(id => id !== data.comandaId)), 8000)
      carregar()
    })
    hub.on('StatusAtualizado', carregar)
    hub.onreconnecting(() => setConexao('reconectando'))
    hub.onreconnected(() => setConexao('conectado'))
    hub.onclose(() => setConexao('desconectado'))
    hub.start().then(() => setConexao('conectado')).catch(() => setConexao('desconectado'))
    hubRef.current = hub
    return () => hub.stop()
  }, [carregar])

  const handleAvancar = async (id, novoStatus) => {
    try { setAvancando(id); await comandaService.atualizarStatus(id, novoStatus); await carregar() }
    catch (err) { console.error(err) }
    finally { setAvancando(null) }
  }

  const filtradas = filtro === 'Todos' ? comandas : comandas.filter(c => c.status === filtro)
  const cont = {
    Pendente:  comandas.filter(c => c.status === 'Pendente').length,
    EmPreparo: comandas.filter(c => c.status === 'EmPreparo').length,
    Pronto:    comandas.filter(c => c.status === 'Pronto').length,
  }

  return (
    <div className="p-6 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <ChefHat size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">Painel da Cozinha</h1>
            <p className="text-zinc-600 text-xs">
              <span className="text-zinc-400 font-bold">{comandas.length}</span> comanda{comandas.length !== 1 ? 's' : ''} ativa{comandas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all
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

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTROS.map(f => {
          const count = f === 'Todos' ? comandas.length : (cont[f] ?? 0)
          const label = f === 'EmPreparo' ? 'Em Preparo' : f
          return (
            <button key={f} onClick={() => setFiltro(f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer
                ${filtro === f
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_4px_15px_rgba(245,158,11,0.35)]'
                  : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
              <Filter size={11} />
              {label}
              <span className={`min-w-[20px] h-5 rounded-full text-center leading-5 text-[10px] font-black px-1
                ${filtro === f ? 'bg-zinc-950/30 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grade de comandas */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl h-72 animate-pulse"
                 style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
            <ChefHat size={24} className="text-zinc-700" />
          </div>
          <p className="text-zinc-400 font-black">Sem comandas ativas</p>
          <p className="text-zinc-700 text-sm mt-1">Aguardando novos pedidos da equipe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(comanda => (
            <CardComanda key={comanda.id} comanda={comanda}
              onAvancar={handleAvancar} avancando={avancando}
              isNova={novas.includes(comanda.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
