import { useState, useRef } from 'react'
import { uploadDocument } from '../../api/documents'
import useToastStore from '../../store/useToastStore'

const ALLOWED = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx']

export default function UploadModal({ open, onClose, folders = [], tags = [], onUploaded }) {
  const [file, setFile] = useState(null)
  const [nombre, setNombre] = useState('')
  const [carpetaId, setCarpetaId] = useState('')
  const [tagId, setTagId] = useState('')
  const [esAduanero, setEsAduanero] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()
  const showToast = useToastStore((s) => s.show)

  const pickFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!ALLOWED.includes(ext)) {
      showToast(`Tipo de archivo no permitido: .${ext}`, 'error')
      return
    }
    setFile(f)
    if (!nombre) setNombre(f.name.replace(/\.[^.]+$/, ''))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return showToast('Selecciona un archivo primero', 'error')
    setLoading(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('nombre', nombre)
      fd.append('carpeta_id', carpetaId)
      fd.append('tag_id', tagId)
      fd.append('es_aduanero', esAduanero)
      await uploadDocument(fd, setProgress)
      showToast('Documento guardado correctamente')
      onUploaded?.()
      handleClose()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error al subir el archivo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setNombre('')
    setCarpetaId('')
    setTagId('')
    setEsAduanero(false)
    setProgress(0)
    onClose()
  }

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <div className="modal-title">Subir archivo</div>
        <p className="modal-sub">Sube un PDF, imagen o documento. El sistema extraerá el texto automáticamente (OCR).</p>

        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input ref={inputRef} type="file" style={{ display: 'none' }}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])} />
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M28 8H12a4 4 0 00-4 4v28a4 4 0 004 4h24a4 4 0 004-4V20L28 8z" />
            <polyline points="28 8 28 20 40 20" />
          </svg>
          {file
            ? <p style={{ fontWeight: 500, color: 'var(--text)' }}>{file.name}</p>
            : <p>Arrastra un archivo aquí o haz clic para seleccionar</p>}
          <span>PDF, JPG, PNG, DOC, DOCX, XLS, XLSX — máx. 50 MB</span>
        </div>

        {loading && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, background: 'var(--border2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, display: 'block' }}>{progress}% subido</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del documento</label>
            <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Contrato_proveedor_2026" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Carpeta destino</label>
              <select className="form-select" value={carpetaId} onChange={(e) => setCarpetaId(e.target.value)}>
                <option value="">Sin carpeta</option>
                {folders.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Etiqueta</label>
              <select className="form-select" value={tagId} onChange={(e) => setTagId(e.target.value)}>
                <option value="">Sin etiqueta</option>
                {tags.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">¿Es un documento aduanero?</div>
              <div className="toggle-desc">Activa la extracción especializada y vinculación a expediente</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={esAduanero} onChange={(e) => setEsAduanero(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={handleClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
