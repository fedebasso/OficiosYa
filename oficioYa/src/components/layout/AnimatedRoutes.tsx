import { lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { FEATURES } from '../../lib/featureFlags'
import { ClientLayout } from '../../layouts/ClientLayout'
import { ProLayout } from '../../layouts/ProLayout'
import { useAuthStore } from '../../store/authStore'
import { PageSkeleton } from '../layout/PageSkeleton'

import Login from '../../pages/Login'
import Register from '../../pages/Register'
import NotFound from '../../pages/NotFound'

const Home               = lazy(() => import('../../pages/Home'))
const Search             = lazy(() => import('../../pages/Search'))
const ProfessionalDetail = lazy(() => import('../../pages/ProfessionalDetail'))
const RequestService     = lazy(() => import('../../pages/RequestService'))
const TicketFlow         = lazy(() => import('../../pages/TicketFlow'))
const TicketConfirm      = lazy(() => import('../../pages/TicketConfirm'))
const Urgencias          = lazy(() => import('../../pages/Urgencias'))
const Favoritos          = lazy(() => import('../../pages/Favoritos'))
const MisSolicitudes     = lazy(() => import('../../pages/MisSolicitudes'))
const SolicitudDetail    = lazy(() => import('../../pages/SolicitudDetail'))
const Chat               = lazy(() => import('../../pages/Chat'))
const ClientProfile      = lazy(() => import('../../pages/ClientProfile'))
const Mensajes           = lazy(() => import('../../pages/Mensajes'))
const BuscarOtroProfesional = lazy(() => import('../../pages/BuscarOtroProfesional'))
const OfficialServicesPage  = lazy(() => import('../../pages/OfficialServicesPage'))
const OfficialServiceDetail = lazy(() => import('../../pages/OfficialServiceDetail'))
const ProDashboard    = lazy(() => import('../../pages/pro/ProDashboard'))
const ProRequests     = lazy(() => import('../../pages/pro/ProRequests'))
const ProProfile      = lazy(() => import('../../pages/pro/ProProfile'))
const ProProfileEdit  = lazy(() => import('../../pages/pro/ProProfileEdit'))
const ProOnboarding   = lazy(() => import('../../pages/pro/ProOnboarding'))
const ProWorkHistory  = lazy(() => import('../../pages/pro/ProWorkHistory'))
const ProGanancias    = lazy(() => import('../../pages/pro/ProGanancias'))
const ProRegistration = lazy(() => import('../../pages/pro/ProRegistration'))
const ProAvailability = lazy(() => import('../../pages/pro/ProAvailability'))
const AdminVerificaciones = lazy(() => import('../../pages/admin/AdminVerificaciones'))

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

// Rutas orientadas a cliente: un profesional logueado va a su dashboard,
// consistente con la redirección que ya hace ClientLayout.
function ClientRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'professional') return <Navigate to="/pro/dashboard" replace />
  return <>{children}</>
}

export function AnimatedRoutes() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes location={location}>
              <Route path="/login"    element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/profesional/:id" element={<ClientRoute><ProfessionalDetail /></ClientRoute>} />
              <Route path="/urgencias"       element={<ClientRoute><Urgencias /></ClientRoute>} />
              <Route path="/ticket"          element={<ClientRoute><TicketFlow /></ClientRoute>} />
              <Route path="/ticket/confirmar" element={<ClientRoute><TicketConfirm /></ClientRoute>} />
              <Route path="/buscar-profesional/:requestId" element={<ProtectedRoute><BuscarOtroProfesional /></ProtectedRoute>} />
              <Route path="/solicitar/:id"   element={<ClientRoute><RequestService /></ClientRoute>} />
              <Route path="/admin/verificaciones" element={<ProtectedRoute><AdminVerificaciones /></ProtectedRoute>} />
              <Route path="/pro/registro"   element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />
              <Route path="/pro/onboarding" element={<ProtectedRoute><ProOnboarding /></ProtectedRoute>} />
              <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/solicitud/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/mensajes"           element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />
              {FEATURES.SERVICIOS_OFICIALES && <Route path="/servicios-oficiales"     element={<ClientRoute><OfficialServicesPage /></ClientRoute>} />}
              {FEATURES.SERVICIOS_OFICIALES && <Route path="/servicios-oficiales/:id" element={<ClientRoute><OfficialServiceDetail /></ClientRoute>} />}

              <Route
                path="/pro/*"
                element={
                  <ProtectedRoute requiredRole="professional">
                    <ProLayout>
                      <Routes>
                        <Route path="dashboard"      element={<ProDashboard />} />
                        <Route path="solicitudes"    element={<ProRequests />} />
                        <Route path="perfil"         element={<ProProfile />} />
                        <Route path="perfil/editar"  element={<ProProfileEdit />} />
                        <Route path="trabajos"       element={<ProWorkHistory />} />
                        <Route path="ganancias"      element={<ProGanancias />} />
                        <Route path="disponibilidad" element={<ProAvailability />} />
                        <Route path="*"              element={<Navigate to="/pro/dashboard" replace />} />
                      </Routes>
                    </ProLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/*"
                element={
                  isPro
                    ? <Navigate to="/pro/dashboard" replace />
                    : (
                      <ClientLayout>
                        <Routes>
                          <Route path="/"                  element={<Home />} />
                          <Route path="/buscar"            element={<Search />} />
                          <Route path="/buscar/:categoria" element={<Search />} />
                          <Route path="/favoritos"         element={<Favoritos />} />
                          <Route path="/mis-solicitudes"   element={<ProtectedRoute requiredRole="client"><MisSolicitudes /></ProtectedRoute>} />
                          <Route path="/solicitud/:id"     element={<ProtectedRoute requiredRole="client"><SolicitudDetail /></ProtectedRoute>} />
                          <Route path="/perfil"            element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                          <Route path="*"                  element={<NotFound />} />
                        </Routes>
                      </ClientLayout>
                    )
                }
              />
      </Routes>
    </Suspense>
  )
}
