import { useState } from 'react'
import useToastStore from '../../store/useToastStore'

const TAG_CLASS = {
  '#1a4fd6': 'blue',
  '#1a7a4a': 'green',
  '#a05a10': 'amber',
  '#6b6960': 'gray',
  '#b02020': 'red',
  '#0f6e56': 'teal',
}

function FileIcon({ tipo }) {
  return <div className={`file-icon ${tipo}`}>{tipo.toUpperCase()}</div>
}

function OcrBadge({ estado }) {
  const labels = {
    pendiente: 'Pendiente',
    procesando: 'Procesando',
    extraido: 'OCR extraído',
    sin_ocr: 'Sin OCR',
    error: 'Error OCR',
  }
  return <span className={`ocr-badge ${estado}`}>{labels[estado] || estado}</span>
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DocumentList({ documents = [], onPreview, onDelete, onRefresh }) {
  const showToast = useToastStore((s) => s.show)

  if (documents.length === 0) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: 13, padding: '16px 0' }}>
        No hay documentos para mostrar.
      </div>
    )
  }

  const handleDownload = (doc) => {
    showToast('Descargando documento...')
    const a = document.createElement('a')
    a.href = `/api/v1/documents/${doc.id}/download`
    a.download = doc.nombre
    a.click()
  }

  const handleShare = (doc) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/v1/documents/${doc.id}/preview`)
    showToast('Enlace copiado al portapapeles')
  }

  return (
    <div className="doc-list">
      {documents.map((doc) => (
        <div key={doc.id} className="doc-row" onClick={() => onPreview?.(doc)}>
          <FileIcon tipo={doc.tipo} />
          <div className="doc-info">
            <div className="doc-name">{doc.nombre}</div>
            <div className="doc-meta">
              Subido · {formatDate(doc.fecha_subida)} · <OcrBadge estado={doc.estado_ocr} />
            </div>
          </div>

          <span className="doc-size">{formatBytes(doc.tamanio_bytes)}</span>

          <div className="doc-actions">
            <button className="icon-btn" title="Ver" onClick={(e) => { e.stopPropagation(); onPreview?.(doc) }}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" /></svg>
            </button>
            <button className="icon-btn" title="Descargar" onClick={(e) => { e.stopPropagation(); handleDownload(doc) }}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" /></svg>
            </button>
            <button className="icon-btn" title="Compartir" onClick={(e) => { e.stopPropagation(); handleShare(doc) }}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
            </button>
            {onDelete && (
              <button className="icon-btn" title="Eliminar" style={{ color: 'var(--danger)' }}
                onClick={(e) => { e.stopPropagation(); onDelete?.(doc) }}>
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
