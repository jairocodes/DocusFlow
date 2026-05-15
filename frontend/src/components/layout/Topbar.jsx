export default function Topbar({ title, onSearch, onUpload }) {
  return (
    <div className="topbar">
      <span className="page-title">{title}</span>

      <div className="search-wrap">
        <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre, texto extraído o etiqueta..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button className="btn btn-primary" onClick={onUpload}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
          </svg>
          Subir archivo
        </button>
      </div>
    </div>
  )
}
