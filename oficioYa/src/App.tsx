import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Search from './pages/Search'
import ProfessionalDetail from './pages/ProfessionalDetail'
import RequestService from './pages/RequestService'
import TicketFlow from './pages/TicketFlow'
import TicketConfirm from './pages/TicketConfirm'
import MisSolicitudes from './pages/MisSolicitudes'
import SolicitudDetail from './pages/SolicitudDetail'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import ProRegistration from './pages/pro/ProRegistration'
import ProProfile from './pages/pro/ProProfile'
import ProRequests from './pages/pro/ProRequests'
import ProWorkHistory from './pages/pro/ProWorkHistory'
import Urgencias from './pages/Urgencias'
import Favoritos from './pages/Favoritos'
import ClientProfile from './pages/ClientProfile'
import NotFound from './pages/NotFound'

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: 'client' | 'professional'
}) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar/:categoria" element={<Search />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/urgencias" element={<Urgencias />} />
        <Route path="/profesional/:id" element={<ProfessionalDetail />} />
        <Route path="/solicitar/:id" element={<RequestService />} />
        <Route path="/ticket" element={<TicketFlow />} />
        <Route path="/ticket/confirmar" element={<TicketConfirm />} />
        <Route
          path="/mis-solicitudes"
          element={
            <ProtectedRoute requiredRole="client">
              <MisSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route path="/solicitud/:id" element={<ProtectedRoute requiredRole="client"><SolicitudDetail /></ProtectedRoute>} />
        <Route
          path="/solicitud/:id/chat"
          element={
            <ProtectedRoute requiredRole="client">
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<ClientProfile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/pro/registro" element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />
        <Route
          path="/pro/perfil"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/solicitudes"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/trabajos"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProWorkHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
