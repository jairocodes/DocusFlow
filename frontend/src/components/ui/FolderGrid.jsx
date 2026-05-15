import { useNavigate } from 'react-router-dom'

function lighten(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const mix = (c) => Math.round(c + (255 - c) * 0.75)
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`
}

export default function FolderGrid({ folders = [] }) {
  const navigate = useNavigate()

  if (folders.length === 0) return null

  return (
    <>
      <div className="folder-grid">
        {folders.map((f) => (
          <div key={f.id} className="folder-card" onClick={() => navigate(`/folder/${f.id}`, { state: { folder: f } })}>
            <svg className="folder-icon-wrap" viewBox="0 0 40 34">
              <path d="M2 8a2 2 0 012-2h9l3 3h18a2 2 0 012 2v17a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" fill={lighten(f.color_hex)} />
              <path d="M2 13h36v14a2 2 0 01-2 2H4a2 2 0 01-2-2V13z" fill={f.color_hex} />
            </svg>
            <div className="folder-name">{f.nombre}</div>
            <div className="folder-count">{f.total_docs} {f.total_docs === 1 ? 'archivo' : 'archivos'}</div>
          </div>
        ))}
      </div>
    </>
  )
}
