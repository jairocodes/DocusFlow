import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import Sidebar from './components/layout/Sidebar'
import Toast from './components/ui/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PreviewPage from './pages/PreviewPage'

function ProtectedLayout({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="app">
      <Sidebar />
      <main className="main">{children}</main>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/preview/:id" element={<ProtectedLayout><PreviewPage /></ProtectedLayout>} />

        {/* Rutas placeholder — se completarán en features posteriores */}
        <Route path="/search" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Búsqueda avanzada — próximamente</p></div></ProtectedLayout>} />
        <Route path="/shared" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Compartidos conmigo — próximamente</p></div></ProtectedLayout>} />
        <Route path="/recent" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Recientes — próximamente</p></div></ProtectedLayout>} />
        <Route path="/expedientes" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Expedientes aduaneros — próximamente</p></div></ProtectedLayout>} />
        <Route path="/folder/:id" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Carpeta — próximamente</p></div></ProtectedLayout>} />
        <Route path="/admin/users" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Administración — próximamente</p></div></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><div className="content"><p style={{color:'var(--text3)'}}>Perfil — próximamente</p></div></ProtectedLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
