import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Search, ChefHat,
  ToggleLeft, ToggleRight, X, Check, AlertTriangle, Loader2
} from 'lucide-react'
import { itemService } from '../../services/itemService'

const CATEGORIAS = ['Todos', 'Entradas', 'Pratos Principais', 'Sobremesas', 'Bebidas', 'Outros']
const ITEM_VAZIO = { nome: '', descricao: '', preco: '', categoria: '', imagemUrl: '' }

/* ── Modal wrapper ── */
function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800/80 rounded-3xl w-full max-w-md shadow-[0_25px_80px_rgba(0,0,0,0.7)] animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-white font-black text-base tracking-tight">{titulo}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ── Input flutuante ── */
function FloatInput({ label, name, value, onChange, type = 'text', step, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || !!value

  return (
    <div>
      <div className="relative">
        <label className={`absolute left-4 pointer-events-none transition-all duration-200 z-10
          ${active ? 'top-[9px] text-[10px] font-black tracking-[0.15em] uppercase' : 'top-1/2 -translate-y-1/2 text-sm'}
          ${error ? 'text-red-400' : active ? 'text-amber-500' : 'text-zinc-500'}`}>
          {label}
        </label>
        <input type={type} name={name} value={value ?? ''} onChange={onChange} step={step}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`w-full bg-zinc-800 border-2 rounded-2xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200
            ${error ? 'border-red-500/70' : focused ? 'border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]' : 'border-zinc-700 hover:border-zinc-600'}`} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  )
}

/* ── Formulário de item ── */
function FormItem({ inicial, onSalvar, onCancelar, carregando }) {
  const [form, setForm] = useState(inicial)
  const [erros, setErros] = useState({})

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErros(p => ({ ...p, [e.target.name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.nome?.trim()) e.nome = 'Nome é obrigatório'
    if (!form.preco || Number(form.preco) <= 0) e.preco = 'Preço deve ser maior que zero'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErros(errs); return }
    onSalvar({
      ...form,
      preco: Number(form.preco),
      imagemUrl: form.imagemUrl || null,
      descricao: form.descricao || null,
      categoria: form.categoria || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatInput label="Nome do item" name="nome" value={form.nome} onChange={handleChange} error={erros.nome} />

      <div>
        <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-zinc-500 mb-2">Descrição</label>
        <textarea name="descricao" value={form.descricao ?? ''} onChange={handleChange} rows={2}
          placeholder="Descreva o item (opcional)"
          className="w-full bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600 focus:border-amber-500 rounded-2xl px-4 py-3 text-white text-sm placeholder-zinc-600 outline-none transition-all resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FloatInput label="Preço R$" name="preco" type="number" step="0.01" value={form.preco} onChange={handleChange} error={erros.preco} />
        <div>
          <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-zinc-500 mb-2">Categoria</label>
          <select name="categoria" value={form.categoria ?? ''} onChange={handleChange}
            className="w-full bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600 focus:border-amber-500 rounded-2xl px-3 py-[14px] text-white text-sm outline-none transition-all cursor-pointer">
            <option value="">Sem categoria</option>
            {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <FloatInput label="URL da imagem (opcional)" name="imagemUrl" value={form.imagemUrl} onChange={handleChange} />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={carregando}
          className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-sm font-black rounded-2xl py-3.5
                     transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] active:scale-[0.98]">
          {carregando ? <Loader2 size={15} className="animate-spin" /> : <><Check size={14} /> Salvar</>}
        </button>
      </div>
    </form>
  )
}

/* ── Card de item ── */
function CardItem({ item, onEditar, onDeletar, onToggle, index }) {
  return (
    <div className={`group bg-zinc-900 border rounded-3xl overflow-hidden transition-all duration-300
                     hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-0.5
                     ${item.disponivel ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/40 opacity-50'}`}
         style={{ animationDelay: `${index * 40}ms` }}>

      {/* Topo colorido por categoria */}
      <div className={`h-1 w-full ${item.disponivel ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-zinc-800'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-sm truncate mb-1.5">{item.nome}</h3>
            {item.categoria && (
              <span className="inline-block text-[10px] font-black tracking-[0.15em] uppercase
                               text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                {item.categoria}
              </span>
            )}
          </div>
          <button onClick={() => onToggle(item)} title={item.disponivel ? 'Desativar' : 'Ativar'}
            className="shrink-0 transition-transform hover:scale-110 cursor-pointer mt-0.5">
            {item.disponivel
              ? <ToggleRight size={24} className="text-green-400" />
              : <ToggleLeft size={24} className="text-zinc-600" />}
          </button>
        </div>

        {item.descricao && (
          <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4">{item.descricao}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-amber-400 font-black text-2xl">
            R${Number(item.preco).toFixed(2).replace('.', ',')}
          </span>
          <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full
            ${item.disponivel ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 bg-zinc-800'}`}>
            {item.disponivel ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div className="flex gap-2 pt-3 border-t border-zinc-800">
          <button onClick={() => onEditar(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
                       text-zinc-500 hover:text-amber-400 hover:bg-amber-500/8 transition-all cursor-pointer">
            <Pencil size={12} /> Editar
          </button>
          <div className="w-px bg-zinc-800" />
          <button onClick={() => onDeletar(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
                       text-zinc-500 hover:text-red-400 hover:bg-red-500/8 transition-all cursor-pointer">
            <Trash2 size={12} /> Remover
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function Cardapio() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [catAtiva, setCatAtiva] = useState('Todos')
  const [modal, setModal] = useState(null)
  const [itemSel, setItemSel] = useState(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try { setCarregando(true); setItens(await itemService.listar()) }
    catch { setErro('Erro ao carregar o cardápio.') }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const fechar = () => { setModal(null); setItemSel(null); setErro('') }

  const handleCriar = async (form) => {
    try { setSalvando(true); await itemService.criar(form); await carregar(); fechar() }
    catch (err) { setErro(err.response?.data?.erro ?? 'Erro ao criar item.') }
    finally { setSalvando(false) }
  }

  const handleEditar = async (form) => {
    try { setSalvando(true); await itemService.atualizar(itemSel.id, form); await carregar(); fechar() }
    catch (err) { setErro(err.response?.data?.erro ?? 'Erro ao atualizar item.') }
    finally { setSalvando(false) }
  }

  const handleDeletar = async () => {
    try { setSalvando(true); await itemService.deletar(itemSel.id); await carregar(); fechar() }
    catch (err) { setErro(err.response?.data?.erro ?? 'Não é possível remover este item.') }
    finally { setSalvando(false) }
  }

  const handleToggle = async (item) => {
    try { await itemService.alterarDisponibilidade(item.id, !item.disponivel); await carregar() }
    catch { setErro('Erro ao alterar disponibilidade.') }
  }

  const filtrados = itens.filter(i => {
    const matchBusca = i.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCat = catAtiva === 'Todos' || i.categoria === catAtiva
    return matchBusca && matchCat
  })

  const ativos = itens.filter(i => i.disponivel).length

  return (
    <div className="p-8 min-h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ChefHat size={18} className="text-amber-400" />
            </div>
            <h1 className="text-white font-black text-2xl">Cardápio</h1>
          </div>
          <p className="text-zinc-600 text-sm ml-[52px]">
            <span className="text-zinc-400 font-bold">{itens.length}</span> itens ·{' '}
            <span className="text-green-400 font-bold">{ativos}</span> ativos ·{' '}
            <span className="text-zinc-600 font-bold">{itens.length - ativos}</span> inativos
          </p>
        </div>
        <button onClick={() => setModal('criar')}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm
                     px-5 py-3 rounded-2xl transition-all cursor-pointer
                     hover:shadow-[0_6px_30px_rgba(245,158,11,0.45)] active:scale-[0.97]">
          <Plus size={16} strokeWidth={3} /> Novo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input type="text" placeholder="Buscar item..." value={busca} onChange={e => setBusca(e.target.value)}
            className="bg-zinc-900 border-2 border-zinc-800 focus:border-amber-500 text-white placeholder-zinc-600
                       text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none transition-all w-56" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={() => setCatAtiva(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer
                ${catAtiva === cat
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_4px_15px_rgba(245,158,11,0.35)]'
                  : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Erro global */}
      {erro && !modal && (
        <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3 mb-6">
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{erro}</p>
          <button onClick={() => setErro('')} className="ml-auto text-red-400/50 hover:text-red-400 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Grid */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl h-52 animate-pulse"
                 style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
            <ChefHat size={24} className="text-zinc-700" />
          </div>
          <p className="text-zinc-400 font-black text-base">Nenhum item encontrado</p>
          <p className="text-zinc-700 text-sm mt-1">
            {busca ? 'Tente uma busca diferente' : 'Crie o primeiro item do cardápio'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((item, i) => (
            <CardItem key={item.id} item={item} index={i}
              onEditar={i => { setItemSel(i); setModal('editar') }}
              onDeletar={i => { setItemSel(i); setModal('deletar') }}
              onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* Modais */}
      {modal === 'criar' && (
        <Modal titulo="Novo Item" onClose={fechar}>
          {erro && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-2.5 mb-4"><AlertTriangle size={13} className="text-red-400 shrink-0" /><p className="text-red-400 text-xs">{erro}</p></div>}
          <FormItem inicial={ITEM_VAZIO} onSalvar={handleCriar} onCancelar={fechar} carregando={salvando} />
        </Modal>
      )}

      {modal === 'editar' && itemSel && (
        <Modal titulo="Editar Item" onClose={fechar}>
          {erro && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-2.5 mb-4"><AlertTriangle size={13} className="text-red-400 shrink-0" /><p className="text-red-400 text-xs">{erro}</p></div>}
          <FormItem inicial={itemSel} onSalvar={handleEditar} onCancelar={fechar} carregando={salvando} />
        </Modal>
      )}

      {modal === 'deletar' && itemSel && (
        <Modal titulo="Remover Item" onClose={fechar}>
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <p className="text-white font-black text-lg mb-2">Remover "{itemSel.nome}"?</p>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              Itens em comandas ativas não podem ser removidos.
            </p>
            {erro && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-2xl px-3 py-2.5 mb-4"><AlertTriangle size={13} className="text-red-400 shrink-0" /><p className="text-red-400 text-xs">{erro}</p></div>}
            <div className="flex gap-3">
              <button onClick={fechar} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-2xl py-3.5 transition-colors cursor-pointer">Cancelar</button>
              <button onClick={handleDeletar} disabled={salvando}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-black rounded-2xl py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2">
                {salvando ? <Loader2 size={14} className="animate-spin" /> : 'Remover'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
