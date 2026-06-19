import { lazy, Suspense, type ReactNode, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ClientLayout } from './layouts/ClientLayout'
import { ProLayout } from './layouts/ProLayout'
import { PageSkeleton } from './components/layout/PageSkeleton'

// ── Páginas compartidas (estáticas — pequeñas, las usan ambos roles)
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// ── Páginas lazy — se dividen en chunks por rol
const Home               = lazy(() => import('./pages/Home'))
const Search             = lazy(() => import('./pages/Search'))
const ProfessionalDetail = lazy(() => import('./pages/ProfessionalDetail'))
const RequestService     = lazy(() => import('./pages/RequestService'))
const TicketFlow         = lazy(() => import('./pages/TicketFlow'))
const TicketConfirm      = lazy(() => import('./pages/TicketConfirm'))
const Urgencias          = lazy(() => import('./pages/Urgencias'))
const Favoritos          = lazy(() => import('./pages/Favoritos'))

// ── Cliente
const MisSolicitudes = lazy(() => import('./pages/MisSolicitudes'))
const SolicitudDetail = lazy(() => import('./pages/SolicitudDetail'))
const Chat           = lazy(() => import('./pages/Chat'))
const ClientProfile  = lazy(() => import('./pages/ClientProfile'))
const Mensajes       = lazy(() => import('./pages/Mensajes'))

// ── Profesional
const ProDashboard    = lazy(() => import('./pages/pro/ProDashboard'))
const ProRequests     = lazy(() => import('./pages/pro/ProRequests'))
const ProProfile      = lazy(() => import('./pages/pro/ProProfile'))
const ProProfileEdit  = lazy(() => import('./pages/pro/ProProfileEdit'))
const ProWorkHistory  = lazy(() => import('./pages/pro/ProWorkHistory'))
const ProRegistration = lazy(() => import('./pages/pro/ProRegistration'))

// ── Admin
const AdminVerificaciones = lazy(() => import('./pages/admin/AdminVerificaciones'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

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
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* ── Rutas compartidas sin layout */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/profesional/:id" element={<ProfessionalDetail />} />
          <Route path="/urgencias"       element={<Urgencias />} />
          <Route path="/ticket"          element={<TicketFlow />} />
          <Route path="/ticket/confirmar" element={<TicketConfirm />} />
          <Route path="/solicitar/:id"   element={<RequestService />} />
          <Route path="/admin/verificaciones" element={<ProtectedRoute><AdminVerificaciones /></ProtectedRoute>} />
          <Route path="/pro/registro" element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />
          <Route path="/solicitud/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          {/* ── Rutas profesional */}
          <Route
            path="/pro/*"
            element={
              <ProtectedRoute requiredRole="professional">
                <ProLayout>
                  <Routes>
                    <Route path="dashboard"   element={<ProDashboard />} />
                    <Route path="solicitudes" element={<ProRequests />} />
                    <Route path="perfil"        element={<ProProfile />} />
                    <Route path="perfil/editar" element={<ProProfileEdit />} />
                    <Route path="trabajos"     element={<ProWorkHistory />} />
                    <Route path="*"           element={<Navigate to="/pro/dashboard" replace />} />
                  </Routes>
                </ProLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Rutas cliente */}
          <Route
            path="/*"
            element={
              isPro
                ? <Navigate to="/pro/dashboard" replace />
                : (
                  <ClientLayout>
                    <Routes>
                      <Route path="/"                   element={isPro ? <Navigate to="/pro/dashboard" replace /> : <Home />} />
                      <Route path="/buscar"             element={<Search />} />
                      <Route path="/buscar/:categoria"  element={<Search />} />
                      <Route path="/favoritos"          element={<Favoritos />} />
                      <Route path="/mensajes"           element={<ProtectedRoute requiredRole="client"><Mensajes /></ProtectedRoute>} />
                      <Route path="/mis-solicitudes"    element={<ProtectedRoute requiredRole="client"><MisSolicitudes /></ProtectedRoute>} />
                      <Route path="/solicitud/:id"      element={<ProtectedRoute requiredRole="client"><SolicitudDetail /></ProtectedRoute>} />
                      {/* /solicitud/:id/chat está en rutas compartidas arriba */}
                      <Route path="/perfil"             element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                      <Route path="*"                   element={<NotFound />} />
                    </Routes>
                  </ClientLayout>
                )
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
