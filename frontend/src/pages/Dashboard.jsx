import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import StatsGrid from '../components/ui/StatsGrid'
import FolderGrid from '../components/ui/FolderGrid'
import DocumentList from '../components/ui/DocumentList'
import UploadModal from '../components/ui/UploadModal'
import { getDashboardStats } from '../api/stats'
import { listDocuments, deleteDocument } from '../api/documents'
import { listFolders } from '../api/folders'
import { listTags } from '../api/tags'
import useToastStore from '../store/useToastStore'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [docs, setDocs] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [total, setTotal] = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)
  const showToast = useToastStore((s) => s.show)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    try {
      const [statsData, docsData, foldersData, tagsData] = await Promise.all([
        getDashboardStats(),
        listDocuments({ page: 1, limit: 20 }),
        listFolders(),
        listTags(),
      ])
      setStats(statsData)
      setDocs(docsData.data)
      setTotal(docsData.total)
      setFolders(foldersData)
      setTags(tagsData)
    } catch {
      showToast('Error al cargar los datos', 'error')
    }
  }, [])

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
      <Topbar title="Mis documentos" onUpload={() => setUploadOpen(true)} />

      <div className="content">
        <div className="breadcrumb">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" /></svg>
          Inicio
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
          <span className="bc-current">Mis documentos</span>
        </div>

        <StatsGrid stats={stats} />

        {folders.length > 0 && (
          <>
            <div className="section-header">
              <span className="section-title-text">Carpetas</span>
            </div>
            <FolderGrid folders={folders} />
          </>
        )}

        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title-text">Documentos recientes ({total})</span>
          {total > 20 && (
            <button className="btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}
              onClick={() => navigate('/search')}>Ver todos</button>
          )}
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
        folders={folders}
        tags={tags}
        onUploaded={() => { setUploadOpen(false); load() }}
      />
    </>
  )
}
