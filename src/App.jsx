import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './routes/PrivateRoute'
import Layout from './components/layout/Layout'

import Login        from './pages/Login'
import SemPermissao from './pages/SemPermissao'
import Cardapio     from './pages/Cardapio'
import Comanda      from './pages/Comanda'
import Cozinha      from './pages/Cozinha'
import Caixa        from './pages/Caixa'
import Usuarios     from './pages/Usuarios'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"         element={<Login />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />

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

      <Route path="/usuarios" element={
        <PrivateRoute roles={['Admin']}>
          <Layout><Usuarios /></Layout>
        </PrivateRoute>
      } />

      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
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