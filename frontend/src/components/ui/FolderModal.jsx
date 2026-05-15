import { useState } from 'react'
import { createFolder } from '../../api/folders'
import useToastStore from '../../store/useToastStore'

const COLORS = [
  { hex: '#1a4fd6', label: 'Azul' },
  { hex: '#1a7a4a', label: 'Verde' },
  { hex: '#a05a10', label: 'Ámbar' },
  { hex: '#0f6e56', label: 'Teal' },
  { hex: '#b02020', label: 'Rojo' },
  { hex: '#6b6960', label: 'Gris' },
  { hex: '#d4962a', label: 'Naranja' },
]

export default function FolderModal({ open, onClose, onCreated }) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#1a4fd6')
  const [loading, setLoading] = useState(false)
  const showToast = useToastStore((s) => s.show)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    try {
      await createFolder(nombre.trim(), color)
      showToast('Carpeta creada')
      setNombre('')
      setColor('#1a4fd6')
      onCreated?.()
      onClose()
    } catch {
      showToast('Error al crear la carpeta', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNombre('')
    setColor('#1a4fd6')
    onClose()
  }

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal" style={{ width: 380 }}>
        <div className="modal-title">Nueva carpeta</div>
        <p className="modal-sub">Organiza tus documentos en carpetas por proyecto o tipo.</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la carpeta</label>
            <input
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Expedientes 2026"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.hex)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c.hex,
                    border: color === c.hex ? '3px solid var(--text)' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={handleClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !nombre.trim()}>
              {loading ? 'Creando...' : 'Crear carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
