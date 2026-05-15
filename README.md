# DocusFlow

Sistema de gestión documental digital con módulo aduanero para agencias aduaneras centroamericanas.

## Stack

- **Frontend:** React 18 + Vite 5
- **Backend:** FastAPI (Python 3.11+)
- **Base de datos:** PostgreSQL 15
- **Storage:** MinIO (S3-compatible)
- **OCR:** Tesseract + pdfplumber

## Levantar entorno de desarrollo

```bash
cp backend/.env.example backend/.env
# Editar backend/.env con las variables necesarias

docker compose -f docker-compose.dev.yml up --build
```

Servicios disponibles:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001

## Estructura

```
docusflow/
├── frontend/        # React + Vite
├── backend/         # FastAPI
├── docker-compose.dev.yml
└── docker-compose.yml
```

## Flujo Git (GitFlow)

- `main` — producción
- `develop` — integración
- `feature/*` — funcionalidades nuevas
- `release/*` — preparación de versión
- `hotfix/*` — correcciones urgentes
