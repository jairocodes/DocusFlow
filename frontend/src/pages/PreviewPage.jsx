import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import client from '../api/client'
import useToastStore from '../store/useToastStore'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PreviewPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const doc = state?.doc

  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  const isPdf = doc?.tipo === 'pdf' || doc?.extension === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png'].includes(doc?.extension)

  useEffect(() => {
    let url = null
    client.get(`/documents/${id}/preview`, { responseType: 'blob' })
      .then((res) => {
        url = URL.createObjectURL(res.data)
        setBlobUrl(url)
      })
      .catch(() => showToast('Error al cargar el archivo', 'error'))
      .finally(() => setLoading(false))

    return () => { if (url) URL.revokeObjectURL(url) }
  }, [id])

  const handleDownload = () => {
    client.get(`/documents/${id}/download`, { responseType: 'blob' })
      .then((res) => {
        const url = URL.createObjectURL(res.data)
        const a = document.createElement('a')
        a.href = url
        a.download = doc?.nombre || 'documento'
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => showToast('Error al descargar', 'error'))
  }

  const handlePrint = () => {
    if (!blobUrl) return
    const win = window.open(blobUrl, '_blank')
    win?.print()
  }

  return (
    <div className="pdf-viewer open" style={{ position: 'fixed' }}>
      <div className="pdf-shell">
        <div className="pdf-topbar">
          <div className={`file-icon ${doc?.tipo || 'pdf'}`} style={{ width: 26, height: 30, fontSize: 8 }}>
            {(doc?.extension || 'pdf').toUpperCase()}
          </div>
          <span className="pdf-title">{doc?.nombre || 'Vista previa'}</span>
          <div className="pdf-toolbar">
            {isPdf && numPages && (
              <>
                <button className="icon-btn" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1}>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
                </button>
                <span>{pageNumber} / {numPages}</span>
                <button className="icon-btn" onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                </button>
              </>
            )}
            <button className="icon-btn" title="Descargar" onClick={handleDownload}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" /></svg>
            </button>
            {isPdf && (
              <button className="icon-btn" title="Imprimir" onClick={handlePrint}>
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h6a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 011-1h4a1 1 0 011 1v3H6v-3zm7-6a1 1 0 100 2 1 1 0 000-2z" /></svg>
              </button>
            )}
            <button className="icon-btn" title="Cerrar" onClick={() => navigate(-1)} style={{ marginLeft: 4 }}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
            </button>
          </div>
        </div>

        <div className="pdf-content">
          {loading && (
            <span style={{ color: '#ccc' }}>Cargando archivo...</span>
          )}

          {!loading && blobUrl && isPdf && (
            <Document
              file={blobUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => showToast('Error al renderizar el PDF', 'error')}
              loading={<span style={{ color: '#ccc' }}>Procesando PDF...</span>}
            >
              <Page
                pageNumber={pageNumber}
                width={Math.min(window.innerWidth * 0.7, 680)}
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>
          )}

          {!loading && blobUrl && isImage && (
            <img
              src={blobUrl}
              alt={doc?.nombre}
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 4 }}
            />
          )}

          {!loading && !blobUrl && (
            <div style={{ color: '#ccc', textAlign: 'center' }}>
              <p style={{ marginBottom: 12 }}>No se pudo cargar la vista previa.</p>
              <button className="btn btn-primary" onClick={handleDownload}>Descargar archivo</button>
            </div>
          )}

          {!loading && blobUrl && !isPdf && !isImage && (
            <div style={{ color: '#ccc', textAlign: 'center' }}>
              <p style={{ marginBottom: 12 }}>Vista previa no disponible para este tipo de archivo.</p>
              <button className="btn btn-primary" onClick={handleDownload}>Descargar archivo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
