function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function StatsGrid({ stats }) {
  if (!stats) return null
  const { total_docs, subidos_mes, compartidos, espacio_usado, espacio_total } = stats

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
          Total documentos
        </div>
        <div className="stat-value">{total_docs}</div>
        <div className="stat-sub">+{subidos_mes} este mes</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" /></svg>
          Subidos este mes
        </div>
        <div className="stat-value">{subidos_mes}</div>
        <div className="stat-sub">&nbsp;</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          Compartidos
        </div>
        <div className="stat-value">{compartidos}</div>
        <div className="stat-sub">{compartidos === 1 ? '1 pendiente' : `${compartidos} recibidos`}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>
          Espacio usado
        </div>
        <div className="stat-value">{formatBytes(espacio_usado)}</div>
        <div className="stat-sub">de {formatBytes(espacio_total)} disponibles</div>
      </div>
    </div>
  )
}
