import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './routes/PrivateRoute'
import Layout from './components/layout/Layout'

import Login from './pages/Login'
import SemPermissao from './pages/SemPermissao'

// Páginas ainda não criadas — placeholders por enquanto
const Cardapio  = () => <div className="p-8 text-white">Cardápio — em breve</div>
const Comanda   = () => <div className="p-8 text-white">Comanda — em breve</div>
const Cozinha   = () => <div className="p-8 text-white">Cozinha — em breve</div>
const Caixa     = () => <div className="p-8 text-white">Caixa — em breve</div>

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />

      {/* Rotas protegidas — cada uma com Layout + role específica */}
      <Route path="/cardapio" element={
        <PrivateRoute roles={['Admin']}>
          <Layout><Cardapio /></Layout>
        </PrivateRoute>
      } />

      <Route path="/comanda" element={
        <PrivateRoute roles={['Admin', 'Garcom']}>
          <Layout><Comanda /></Layout>
        </PrivateRoute>
      } />

      <Route path="/cozinha" element={
        <PrivateRoute roles={['Admin', 'Cozinha']}>
          <Layout><Cozinha /></Layout>
        </PrivateRoute>
      } />

      <Route path="/caixa" element={
        <PrivateRoute roles={['Admin', 'Caixa']}>
          <Layout><Caixa /></Layout>
        </PrivateRoute>
      } />

      {/* Rota raiz → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rota não encontrada → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
