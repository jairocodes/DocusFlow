import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import DocumentList from '../components/ui/DocumentList'
import { searchDocuments, deleteDocument } from '../api/documents'
import { listFolders } from '../api/folders'
import { listTags } from '../api/tags'
import useToastStore from '../store/useToastStore'

const LIMIT = 20

const TIPO_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'imagen', label: 'Imagen (JPG, PNG)' },
  { value: 'word', label: 'Word (DOC, DOCX)' },
  { value: 'excel', label: 'Excel (XLS, XLSX)' },
]

const OCR_OPTIONS = [
  { value: '', label: 'Cualquier estado OCR' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesando', label: 'Procesando' },
  { value: 'completado', label: 'Completado' },
  { value: 'error', label: 'Error OCR' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)

  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [docs, setDocs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    tipo: searchParams.get('tipo') || '',
    tag_id: searchParams.get('tag_id') || '',
    folder_id: searchParams.get('folder_id') || '',
    fecha_desde: searchParams.get('fecha_desde') || '',
    fecha_hasta: searchParams.get('fecha_hasta') || '',
    estado_ocr: searchParams.get('estado_ocr') || '',
  })

  const inputRef = useRef(null)

  useEffect(() => {
    Promise.all([listFolders(), listTags()])
      .then(([f, t]) => { setFolders(f); setTags(t) })
      .catch(() => {})
  }, [])

  const doSearch = useCallback(async (activeFilters, currentPage) => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: LIMIT }
      Object.entries(activeFilters).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await searchDocuments(params)
      setDocs(res.data)
      setTotal(res.total)
    } catch {
      showToast('Error al buscar documentos', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    doSearch(filters, page)
  }, [filters, page, doSearch])

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setPage(1)
    const params = {}
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = inputRef.current?.value ?? ''
    handleFilterChange('q', q)
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.nombre}"?`)) return
    try {
      await deleteDocument(doc.id)
      showToast('Documento eliminado')
      doSearch(filters, page)
    } catch {
      showToast('Error al eliminar el documento', 'error')
    }
  }

  const clearFilters = () => {
    const empty = { q: '', tipo: '', tag_id: '', folder_id: '', fecha_desde: '', fecha_hasta: '', estado_ocr: '' }
    setFilters(empty)
    setPage(1)
    setSearchParams({})
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <>
      <Topbar title="Búsqueda avanzada" />

      <div className="content">
        <div className="breadcrumb">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" /></svg>
          <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/')}>Inicio</span>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
          <span className="bc-current">Búsqueda</span>
        </div>

        {/* Search bar */}
        <form className="search-bar-full" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nombre o contenido OCR..."
              defaultValue={filters.q}
              className="search-input-full"
            />
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
          {hasActiveFilters && (
            <button type="button" className="btn" onClick={clearFilters}>Limpiar</button>
          )}
        </form>

        {/* Filters row */}
        <div className="filters-row">
          <select className="filter-select" value={filters.tipo} onChange={(e) => handleFilterChange('tipo', e.target.value)}>
            {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="filter-select" value={filters.tag_id} onChange={(e) => handleFilterChange('tag_id', e.target.value)}>
            <option value="">Todas las etiquetas</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>

          <select className="filter-select" value={filters.folder_id} onChange={(e) => handleFilterChange('folder_id', e.target.value)}>
            <option value="">Todas las carpetas</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </select>

          <div className="filter-date-wrap">
            <label className="filter-label">Desde</label>
            <input type="date" className="filter-date" value={filters.fecha_desde} onChange={(e) => handleFilterChange('fecha_desde', e.target.value)} />
          </div>

          <div className="filter-date-wrap">
            <label className="filter-label">Hasta</label>
            <input type="date" className="filter-date" value={filters.fecha_hasta} onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)} />
          </div>

          <select className="filter-select" value={filters.estado_ocr} onChange={(e) => handleFilterChange('estado_ocr', e.target.value)}>
            {OCR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Results header */}
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title-text">
            {loading ? 'Buscando...' : `${total} resultado${total !== 1 ? 's' : ''}`}
          </span>
          {totalPages > 1 && (
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Página {page} de {totalPages}
            </span>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="search-empty">
            <div className="search-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p>Buscando documentos...</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p>No se encontraron documentos</p>
            {hasActiveFilters && <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Prueba ajustando los filtros</p>}
          </div>
        ) : (
          <DocumentList
            documents={docs}
            onPreview={(doc) => navigate(`/preview/${doc.id}`, { state: { doc } })}
            onDelete={handleDelete}
            onRefresh={() => doSearch(filters, page)}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ← Anterior
            </button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    className={`pagination-page${page === p ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                )
              })}
            </div>
            <button className="btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
