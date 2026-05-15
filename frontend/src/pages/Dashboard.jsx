import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import useToastStore from '../store/useToastStore'

const MOCK_STATS = {
  total_docs: 0,
  subidos_mes: 0,
  compartidos: 0,
  espacio_usado: 0,
  espacio_total: 10737418240,
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function Dashboard() {
  const showToast = useToastStore((s) => s.show)
  const [search, setSearch] = useState('')

  return (
    <>
      <Topbar
        title="Mis documentos"
        onSearch={setSearch}
        onUpload={() => showToast('Módulo de carga llegará en la siguiente feature', 'success')}
      />

      <div className="content">
        <div className="breadcrumb">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" /></svg>
          Inicio
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
          <span className="bc-current">Mis documentos</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
              Total documentos
            </div>
            <div className="stat-value">{MOCK_STATS.total_docs}</div>
            <div className="stat-sub">+0 este mes</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" /></svg>
              Subidos este mes
            </div>
            <div className="stat-value">{MOCK_STATS.subidos_mes}</div>
            <div className="stat-sub">—</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /></svg>
              Compartidos
            </div>
            <div className="stat-value">{MOCK_STATS.compartidos}</div>
            <div className="stat-sub">0 pendientes</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>
              Espacio usado
            </div>
            <div className="stat-value">{formatBytes(MOCK_STATS.espacio_usado)}</div>
            <div className="stat-sub">de {formatBytes(MOCK_STATS.espacio_total)} disponibles</div>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title-text">Carpetas</span>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 28 }}>
          Las carpetas aparecerán aquí una vez que crees documentos.
        </div>

        <div className="section-header">
          <span className="section-title-text">Documentos recientes</span>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>
          Aún no hay documentos. Usa "Subir archivo" para comenzar.
        </div>
      </div>
    </>
  )
}
