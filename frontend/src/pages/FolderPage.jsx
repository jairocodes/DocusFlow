import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import DocumentList from '../components/ui/DocumentList'
import UploadModal from '../components/ui/UploadModal'
import { getFolderDocuments } from '../api/folders'
import { deleteDocument } from '../api/documents'
import useToastStore from '../store/useToastStore'

export default function FolderPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const folder = state?.folder

  const [docs, setDocs] = useState([])
  const [total, setTotal] = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getFolderDocuments(id)
      setDocs(data.data)
      setTotal(data.total)
    } catch {
      showToast('Error al cargar la carpeta', 'error')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleDelete = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.nombre}"?`)) return
    try {
      await deleteDocument(doc.id)
      showToast('Documento eliminado')
      load()
    } catch {
      showToast('Error al eliminar el documento', 'error')
    }
  }

  return (
    <>
      <Topbar
        title={folder?.nombre || 'Carpeta'}
        onUpload={() => setUploadOpen(true)}
      />
      <div className="content">
        <div className="breadcrumb">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" /></svg>
          <Link to="/" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Inicio</Link>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
          <span className="bc-current">{folder?.nombre || 'Carpeta'}</span>
        </div>

        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title-text">Documentos ({total})</span>
        </div>

        <DocumentList
          documents={docs}
          onPreview={(doc) => navigate(`/preview/${doc.id}`, { state: { doc } })}
          onDelete={handleDelete}
          onRefresh={load}
        />
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => { setUploadOpen(false); load() }}
      />
    </>
  )
}
