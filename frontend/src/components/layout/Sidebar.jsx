import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useToastStore from '../../store/useToastStore'
import { logout } from '../../api/auth'

function NavItem({ to, onClick, children, badge }) {
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        {children}
        {badge != null && <span className="nav-badge">{badge}</span>}
      </NavLink>
    )
  }
  return (
    <div className="nav-item" onClick={onClick}>
      {children}
    </div>
  )
}

export default function Sidebar({ folders = [], onUpload }) {
  const { user, clearAuth } = useAuthStore()
  const showToast = useToastStore((s) => s.show)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user?.nombre_completo
    ? user.nombre_completo.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <svg viewBox="0 0 20 20">
            <path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
            <path d="M12 2v4h4" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <span className="logo-text">Docus<span>Flow</span></span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Principal</div>

        <NavItem to="/">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
          </svg>
          Mis documentos
        </NavItem>

        <NavItem onClick={onUpload}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
          </svg>
          Subir archivo
        </NavItem>

        <NavItem to="/search">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
          </svg>
          Búsqueda avanzada
        </NavItem>

        <NavItem to="/shared">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          </svg>
          Compartidos conmigo
        </NavItem>

        <NavItem to="/recent">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
          </svg>
          Recientes
        </NavItem>

        {folders.length > 0 && (
          <>
            <div className="nav-label">Mis carpetas</div>
            {folders.map((f) => (
              <NavItem key={f.id} to={`/folder/${f.id}`}>
                <span className="nav-folder-dot" style={{ background: f.color_hex }} />
                {f.nombre}
              </NavItem>
            ))}
          </>
        )}

        <div className="nav-label">Módulos</div>

        <NavItem to="/expedientes">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" />
            <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 01-2-2v-2z" />
          </svg>
          Expedientes
        </NavItem>

        {user?.rol === 'admin' && (
          <>
            <div className="nav-label">Administración</div>
            <NavItem to="/admin/users">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Usuarios y roles
            </NavItem>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div>
          <div className="user-name">{user?.nombre_completo}</div>
          <div className="user-role">{user?.rol} · {user?.area || '—'}</div>
        </div>
        <button className="user-menu" onClick={() => setMenuOpen((o) => !o)}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="user-dropdown">
            <div className="user-dropdown-item" onClick={() => { setMenuOpen(false); navigate('/profile') }}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
              Mi perfil
            </div>
            <div className="user-dropdown-item danger" onClick={handleLogout}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" /></svg>
              Cerrar sesión
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
