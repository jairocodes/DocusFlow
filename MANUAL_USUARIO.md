# DocusFlow — Manual de Usuario y Guía de Pruebas

## Estado del proyecto

| Fase | Feature | Estado |
|------|---------|--------|
| **Fase 1** | Infraestructura (Docker, BD, MinIO) | ✅ Completo |
| **Fase 1** | Autenticación JWT (login, roles) | ✅ Completo |
| **Fase 1** | Carga de documentos + OCR pipeline | ✅ Completo |
| **Fase 1** | Dashboard + estadísticas | ✅ Completo |
| **Fase 1** | Vista previa y descarga de archivos | ✅ Completo |
| **Fase 2** | CRUD de carpetas | ✅ Completo |
| **Fase 2** | Sistema de etiquetas (tags) | ✅ Completo |
| **Fase 2** | Búsqueda full-text + filtros avanzados | ✅ Completo |
| Pendiente | Compartidos / Recientes / Expedientes | ⏳ Próximamente |
| Pendiente | Panel de administración de usuarios | ⏳ Próximamente |

---

## 1. Requisitos previos

- **Docker Desktop** instalado y corriendo (Windows/Mac/Linux)
- **Git** (ya tienes el repositorio clonado)
- Puerto **5173** (frontend), **8000** (backend), **5432** (PostgreSQL), **9000/9001** (MinIO) libres

---

## 2. Primera puesta en marcha

### Paso 1 — Crear el archivo `.env`

Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
Copy-Item backend\.env.example backend\.env
```

El `.env` generado ya tiene los valores correctos para desarrollo local. No necesitas modificarlo.

### Paso 2 — Levantar los contenedores

```powershell
docker compose -f docker-compose.dev.yml up --build
```

> La primera vez tarda ~3–5 minutos (descarga de imágenes, instalación de dependencias).  
> Espera hasta ver en los logs: `Uvicorn running on http://0.0.0.0:8000`

### Paso 3 — Ejecutar las migraciones de base de datos

En otra terminal (con los contenedores ya corriendo):

```powershell
docker compose -f docker-compose.dev.yml exec backend alembic upgrade head
```

Deberías ver: `Running upgrade -> 0001, Esquema inicial...`

### Paso 4 — Crear el primer usuario administrador

```powershell
docker compose -f docker-compose.dev.yml exec backend python seed_admin.py
```

Salida esperada:
```
Usuario admin creado:
  Email   : admin@docusflow.com
  Password: Admin1234!
```

---

## 3. Acceder a la aplicación

| Servicio | URL | Credenciales |
|----------|-----|-------------|
| **DocusFlow (frontend)** | http://localhost:5173 | admin@docusflow.com / Admin1234! |
| **API Docs (Swagger)** | http://localhost:8000/docs | — |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |

---

## 4. Guía de pruebas con los documentos de `Materiales/`

La carpeta `Materiales/` contiene 17 documentos PDF de aduanas centroamericanas, perfectos para probar todas las funciones del sistema.

### 4.1 Crear carpetas para organizar los documentos

Desde la barra lateral izquierda, haz clic en **"+ Nueva carpeta"** y crea estas carpetas:

| Carpeta | Color sugerido | Documentos que irán aquí |
|---------|---------------|--------------------------|
| Expediente 01647-2026 | Verde (`#1a7a4a`) | MC 01647-2026.pdf, CP 01647-2026.pdf, DUCA F.pdf |
| Expediente 0388 | Azul (`#1a4fd6`) | MC 0388.pdf, CP 0388.pdf, CP.pdf |
| Facturas | Ámbar (`#a05a10`) | FACT.pdf, FACT 5DA9.pdf, FACT 2462.pdf |
| Permisos y Cartas | Teal (`#0f6e56`) | PERMISO.pdf, CARTA GUIA DE TRASLADO..., CARTA PARA REVISION.pdf |
| DUCAs | Rojo (`#b02020`) | D_313202600002780.PDF, D_295202600003246.PDF, 295-2026-00003246.pdf |

### 4.2 Subir documentos

1. En el Dashboard, haz clic en **"Subir archivo"** (botón azul, esquina superior derecha)
2. Arrastra y suelta el archivo o haz clic para seleccionarlo
3. Completa los campos:
   - **Nombre**: El sistema usa el nombre del archivo por defecto, puedes personalizarlo
   - **Carpeta**: Selecciona la carpeta correspondiente (tabla arriba)
   - **Etiqueta**: Selecciona según el tipo de documento
   - **¿Es documento aduanero?**: Actívalo para DUCAs, MC, CP, FACT aduaneras

#### Etiquetas recomendadas por documento

| Documento | Etiqueta recomendada |
|-----------|---------------------|
| DUCA F.pdf | Expediente aduanero |
| D_313202600002780.PDF | Expediente aduanero |
| D_295202600003246.PDF | Expediente aduanero |
| 295-2026-00003246.pdf | Expediente aduanero |
| FACT.pdf | Factura |
| FACT 5DA9.pdf | Factura |
| FACT 2462.pdf | Factura |
| MC.pdf | Contrato |
| MC 01647-2026.pdf | Contrato |
| MC 0388.pdf | Contrato |
| CP.pdf | Contrato |
| CP 01647-2026.pdf | Contrato |
| CP 0388.pdf | Contrato |
| PERMISO.pdf | Legal |
| DEPREX.pdf | Legal |
| CARTA GUIA DE TRASLADO... | Contrato |
| CARTA PARA REVISION.pdf | Legal |

> **OCR automático**: Tras subir cada PDF, el sistema extrae el texto en segundo plano. El estado aparece como badge en cada documento: `PENDIENTE` → `PROCESANDO` → `COMPLETADO`. Recarga la página en unos segundos para ver el cambio.

### 4.3 Navegar por carpetas

- En el Dashboard verás las carpetas creadas como tarjetas de colores
- Haz clic en una carpeta para ver solo sus documentos
- El breadcrumb muestra **Inicio › Nombre de la carpeta**

### 4.4 Vista previa de documentos

1. Haz clic en la fila de cualquier documento del Dashboard
2. El visor PDF cargará el documento directamente en el navegador
3. Usa los botones de la barra superior para:
   - Navegar entre páginas (`← Página X de N →`)
   - Descargar el archivo
   - Imprimir

**Documentos sugeridos para probar la vista previa:**
- `DUCA F.pdf` — Formulario multicolumna, buen test de renderizado
- `FACT 2462.pdf` — PDF más pesado (828 KB), prueba de carga
- `CARTA GUIA DE TRASLADO IMFICA DTE 89.pdf` — PDF complejo (618 KB)

### 4.5 Búsqueda full-text

Ve a **Búsqueda** en la barra lateral o presiona `Enter` en la barra de búsqueda superior.

#### Pruebas de búsqueda sugeridas

| Término a buscar | Qué debería encontrar |
|------------------|-----------------------|
| `DUCA` | DUCAs y expedientes que contengan esa palabra |
| `factura` | Documentos de facturas |
| `2026` | Documentos del año 2026 |
| `IMFICA` | Carta de traslado IMFICA |
| `DEPREX` | Documento DEPREX |

#### Filtros avanzados

- **Tipo de archivo**: Filtra por PDF, Imagen, Word o Excel
- **Etiqueta**: Muestra solo los documentos con esa etiqueta (ej. "Factura")
- **Carpeta**: Limita la búsqueda a una carpeta específica
- **Desde / Hasta**: Rango de fechas de subida
- **Estado OCR**: Filtra por estado del proceso de extracción de texto

**Escenario de prueba combinado:**
1. Etiqueta = "Expediente aduanero"
2. Carpeta = "Expediente 01647-2026"
3. → Debería mostrar solo MC 01647-2026 y CP 01647-2026

---

## 5. Flujo completo de prueba (paso a paso)

```
1. Iniciar sesión con admin@docusflow.com / Admin1234!
2. Crear 3 carpetas: "DUCAs", "Facturas", "Contratos"
3. Subir DUCA F.pdf → carpeta "DUCAs" → etiqueta "Expediente aduanero" → activar toggle aduanero
4. Subir FACT.pdf   → carpeta "Facturas" → etiqueta "Factura"
5. Subir MC.pdf     → carpeta "Contratos" → etiqueta "Contrato"
6. Esperar ~10 segundos y recargar → los badges OCR deben pasar a COMPLETADO
7. Ir a Búsqueda → escribir "DUCA" → debería aparecer el DUCA F.pdf con texto extraído
8. Aplicar filtro "Expediente aduanero" → solo documentos aduaneros
9. Hacer clic en DUCA F.pdf → verificar vista previa en el visor PDF
10. Descargar el archivo desde el visor
```

---

## 6. API interactiva (Swagger)

Accede a http://localhost:8000/docs para explorar todos los endpoints directamente en el navegador.

### Autenticarse en Swagger

1. Haz clic en **Authorize** (botón con candado)
2. Ejecuta primero `POST /api/v1/auth/login` con:
   ```json
   { "email": "admin@docusflow.com", "password": "Admin1234!" }
   ```
3. Copia el `access_token` de la respuesta
4. Pégalo en **Authorize** → campo `bearerAuth`
5. Ahora todos los endpoints estarán autenticados

### Endpoints clave para probar

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/stats/dashboard` | Estadísticas del sistema |
| `POST /api/v1/documents/upload` | Subir un documento |
| `GET /api/v1/documents/search?q=DUCA` | Búsqueda full-text |
| `GET /api/v1/folders` | Listar carpetas |
| `GET /api/v1/tags` | Listar etiquetas del sistema |
| `GET /api/v1/health` | Health check del servidor |

---

## 7. Consola de MinIO

Accede a http://localhost:9001 con `minioadmin / minioadmin` para ver los archivos almacenados físicamente en el bucket `docusflow`.

Cada archivo se guarda en la ruta: `/{usuario_id}/{uuid}.{extension}`

---

## 8. Detener el sistema

```powershell
# Detener sin borrar datos
docker compose -f docker-compose.dev.yml down

# Detener Y borrar todos los datos (BD + archivos)
docker compose -f docker-compose.dev.yml down -v
```

---

## 9. Funciones pendientes (Fase 3)

Estas rutas ya existen en la navegación pero muestran "próximamente":

- **Compartidos conmigo** — Documentos que otros usuarios compartieron contigo
- **Recientes** — Últimos documentos accedidos
- **Expedientes aduaneros** — Vista especializada para módulo aduanero
- **Administración** — Panel CRUD de usuarios (admin)
- **Perfil** — Cambio de contraseña y datos personales
