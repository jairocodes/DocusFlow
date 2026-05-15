# DocusFlow — Contexto completo del frontend para integración con backend

> Este documento describe exhaustivamente la interfaz actual de DocusFlow para que un agente de IA pueda entender su estructura, entidades, acciones y puntos de integración con un backend en planificación.

---

## 1. Descripción general

**DocusFlow** es un sistema de gestión documental digital. La interfaz actual es un prototipo estático (HTML + CSS + JS vanilla, sin framework ni bundler). Toda la data es mock/hardcoded. El objetivo es conectar esta interfaz a un backend real que provea persistencia, autenticación, OCR, búsqueda, y manejo de archivos.

**Idioma de la interfaz:** Español  
**Fuentes:** DM Sans (UI), DM Mono (valores numéricos y badges de tipo de archivo)  
**Paleta base:** Fondo crudo (#f5f4f0), superficie blanca, acento azul (#1a4fd6)

---

## 2. Archivos del proyecto

| Archivo | Rol |
|---|---|
| `index.html` | Estructura completa de la UI: sidebar, topbar, dashboard, modales |
| `styles.css` | Estilos completos con variables CSS, sin framework |
| `app.js` | Lógica de interacción: navegación activa, modales, toast, Escape key |

---

## 3. Layout general

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px fija)  │  MAIN (flex: 1)                │
│                        │  ┌─────────────────────────┐  │
│  Logo                  │  │ TOPBAR                  │  │
│  Nav principal         │  │ título · búsqueda · acc │  │
│  Nav carpetas          │  ├─────────────────────────┤  │
│  Nav administración    │  │ CONTENT (scroll)        │  │
│                        │  │  breadcrumb             │  │
│  ─────────────────     │  │  stats grid (4 cards)   │  │
│  Usuario activo        │  │  carpetas (grid)        │  │
│                        │  │  documentos recientes   │  │
└─────────────────────────────────────────────────────────┘

Overlays (z-index superior):
  Modal Escáner  (z: 100)
  Visor PDF      (z: 200)
  Toast          (z: 300)
```

---

## 4. Sidebar

### 4.1 Logo
- Texto: **"DocusFlow"** (la parte "Flow" en color acento)
- Ícono SVG de documento con pliegue en esquina superior derecha

### 4.2 Navegación — sección "Principal"

| Ítem | Ícono | Acción actual | Acción backend esperada |
|---|---|---|---|
| Mis documentos | Home | `setActive()` — marca activo | Cargar documentos del usuario autenticado |
| Escanear documento | Scanner grid | `openScanner()` — abre modal | Iniciar flujo de escaneo/upload |
| Búsqueda avanzada | Lupa | `setActive()` | Abrir vista de búsqueda full-text con filtros |
| Compartidos conmigo | Bandeja | `setActive()` + badge "3" | Listar documentos compartidos con el usuario; badge = conteo pendiente |
| Recientes | Clipboard | `setActive()` | Listar documentos ordenados por último acceso |

### 4.3 Navegación — sección "Mis carpetas"

Cada ítem tiene un punto de color identificador. Son carpetas del usuario actual.

| Carpeta | Color hex | Archivos (mock) |
|---|---|---|
| Contratos | `#d4962a` (ámbar) | 42 |
| Facturas 2026 | `#1a7a4a` (verde) | 87 |
| Recursos Humanos | `#1a4fd6` (azul) | 31 |
| Legal | `#8b3fce` (morado) | 19 |
| Proveedores | `#b02020` (rojo) | 55 |

> **Backend:** Las carpetas son entidades propias del usuario. Se necesita CRUD de carpetas con nombre, color y pertenencia a usuario.

### 4.4 Navegación — sección "Administración"

| Ítem | Ícono | Acción esperada |
|---|---|---|
| Usuarios y roles | Persona | Panel de gestión de usuarios y permisos |
| Configuración | Engranaje | Configuración de la cuenta/organización |

### 4.5 Usuario activo (pie del sidebar)

```
Avatar: iniciales "EG" (Emanuel Garrido) sobre fondo accent-light
Nombre: Emanuel Garrido
Rol/área: Analista · RRHH
Botón de menú (tres puntos): menú contextual de perfil/logout
```

> **Backend:** El usuario debe provenir de la sesión autenticada. Los campos son: nombre completo, rol, área/departamento. Las iniciales se generan del nombre.

---

## 5. Topbar (barra superior del área principal)

### 5.1 Título de página
Texto: `"Mis documentos"` — debe cambiar dinámicamente según la sección activa.

### 5.2 Buscador
- Input de texto, placeholder: `"Buscar por nombre, texto extraído o etiqueta..."`
- Búsqueda esperada: **full-text** sobre nombre, contenido OCR extraído y etiquetas
- Acción actual: solo UI, sin funcionalidad

> **Backend:** Endpoint de búsqueda que reciba query string y devuelva documentos filtrados. Debe buscar en nombre, texto OCR y tags.

### 5.3 Acciones topbar

| Botón | Estilo | Acción actual | Acción backend |
|---|---|---|---|
| Escanear | `btn-scan` (negro) | `openScanner()` | Igual — abre modal de escaneo |
| Subir archivo | `btn-primary` (azul) | `showToast('Función de carga disponible')` | Abrir file picker → upload al backend → guardar metadatos |

---

## 6. Área de contenido principal

### 6.1 Breadcrumb
```
🏠 Inicio > Mis documentos
```
Indica la ruta de navegación actual. Debe actualizarse al navegar entre carpetas.

---

### 6.2 Dashboard de estadísticas (Stats grid)

4 tarjetas en grid de 4 columnas:

| Stat | Valor mock | Subtexto mock | Dato backend necesario |
|---|---|---|---|
| Total documentos | 248 | +12 este mes | `COUNT` de documentos del usuario |
| Escaneados (abril) | 34 | +8 vs. mes anterior | Documentos con origen `escaneado` en el mes actual |
| Compartidos | 12 | 3 pendientes de revisión | Documentos compartidos por el usuario; pendientes = sin confirmación |
| Espacio usado | 1.8 GB | de 10 GB disponibles | Suma de tamaños de archivos vs. cuota del usuario/org |

---

### 6.3 Sección de carpetas

**Vista cuadrícula** (toggle entre grid y lista — solo UI, sin lógica implementada).

Cada `folder-card` contiene:
- Ícono SVG de carpeta con dos colores (tono claro arriba, tono oscuro abajo)
- Nombre de la carpeta
- Contador de archivos (`X archivos`)
- Click: actualmente llama `showToast('Abriendo carpeta X...')`

> **Backend:** Al hacer click en una carpeta, debe cargarse la lista de documentos filtrada por `folder_id`. El contador proviene del backend.

---

### 6.4 Lista de documentos recientes

Cada fila (`doc-row`) tiene:

| Campo | Descripción |
|---|---|
| Ícono de tipo | Badge coloreado: PDF (rojo), IMG (verde), DOC (azul), XLS (ámbar) |
| Nombre | Nombre del archivo con truncado por overflow |
| Metadata | Origen (Escaneado / Subido) · Fecha · Estado OCR (extraído / Sin OCR) |
| Etiqueta | Pill de color: Contrato (azul), Factura (verde), Legal (azul), RR.HH. (gris), Finanzas (ámbar) |
| Tamaño | En MB, fuente monospace |
| Acciones | Ver · Descargar · Compartir (visibles solo en hover) |

**Documentos mock actuales:**

| Nombre | Tipo | Tag | Tamaño | Origen | Fecha |
|---|---|---|---|---|---|
| Contrato_servicio_TechCorp_2025.pdf | PDF | Contrato | 1.2 MB | Escaneado | 28 abr 2026 |
| Factura_001_abril_2026.pdf | PDF | Factura | 0.8 MB | Escaneado | 25 abr 2026 |
| Foto_documento_cedula_empleado_033.jpg | IMG | RR.HH. | 3.4 MB | Escaneado | 22 abr 2026 |
| Acta_reunion_directiva_marzo_2026.pdf | DOC | Legal | 0.5 MB | Subido | 18 abr 2026 |
| Presupuesto_Q2_2026.xlsx | XLS | Finanzas | 2.1 MB | Subido | 10 abr 2026 |

**Acciones por fila:**

| Acción | Comportamiento actual | Backend esperado |
|---|---|---|
| Ver (ojo) | `openPDF(nombre)` — abre visor | `GET /documents/:id/preview` |
| Descargar | `showToast('Descargando...')` | `GET /documents/:id/download` → stream del archivo |
| Compartir | `showToast('Enlace copiado...')` | `POST /documents/:id/share` → retorna URL firmada o token |

---

## 7. Modal: Escanear documento

**Disparadores:** botón "Escanear" en topbar, ítem "Escanear documento" en sidebar.  
**Cierre:** botón Cancelar, click en overlay, tecla Escape.

### Estructura del modal

```
Título: "Escanear documento"
Subtítulo: instrucción de uso del escáner + OCR automático

Área de drop/click (scanner-area):
  - Click → showToast('Iniciando escáner...')
  - Drag & drop visual (sin lógica implementada)
  - Texto: "Haz clic para iniciar el escáner" / "O arrastra un archivo aquí"

Formulario:
  - Nombre del documento [text input]
  - Carpeta destino [select]:
      Opciones: Mis documentos, Contratos, Facturas 2026,
                Recursos Humanos, Legal, Proveedores
  - Etiqueta [select]:
      Opciones: Sin etiqueta, Contrato, Factura, Legal, RR.HH., Finanzas

Acciones:
  - Cancelar → closeScanner()
  - Escanear ahora → closeScanner() + showToast('Documento escaneado y guardado')
```

> **Backend esperado:**
> 1. Conectar escáner físico O recibir archivo arrastrado
> 2. `POST /documents/scan` con archivo binario + metadatos (nombre, folder_id, tag)
> 3. El backend ejecuta OCR y devuelve el texto extraído
> 4. Se guarda el documento con el texto indexado para búsqueda

---

## 8. Modal: Visor de PDF

**Disparador:** click en cualquier fila de documento o en botón "Ver".  
**Cierre:** botón X, click en overlay, tecla Escape.

### Estructura del visor

```
Topbar del visor:
  - Badge de tipo (PDF)
  - Nombre del archivo (dinámico: se pasa por parámetro a openPDF())
  - Toolbar:
      ← Página anterior
      1 / 4  (paginación hardcoded)
      → Página siguiente
      Descargar → showToast
      Imprimir → showToast
      X Cerrar → closePDF()

Área de contenido (fondo gris #4a4a4a):
  - Simula una hoja de papel blanco
  - Contenido mock de un contrato con líneas de placeholder
  - Cabecera: "DocScan Corp." con fecha y referencia
  - Título: "Contrato de Prestación de Servicios"
  - Cláusulas con líneas de texto simuladas
  - Espacio de firmas al pie
```

> **Backend esperado:**
> - Renderizar el PDF real del documento seleccionado
> - Usar `<iframe>` o librería como PDF.js apuntando a `GET /documents/:id/preview`
> - Paginación real según páginas del documento

---

## 9. Sistema de notificaciones (Toast)

Componente global en esquina inferior derecha. Aparece con clase `.show` y desaparece a los 2.8 segundos.

```javascript
showToast(msg: string) // muestra toast con ícono de check verde + mensaje
```

Mensajes actuales en uso:
- `'Función de carga disponible'`
- `'Iniciando escáner...'`
- `'Documento escaneado y guardado'`
- `'Descargando documento...'`
- `'Enlace copiado al portapapeles'`
- `'Enviando a impresora...'`
- `'Abriendo carpeta X...'`

> **Backend:** reemplazar con respuestas reales de éxito/error de las APIs. Considerar también toasts de error (actualmente no existe variante de error).

---

## 10. Entidades de datos inferidas

### 10.1 Usuario (`User`)
```
id
nombre_completo       // "Emanuel Garrido"
iniciales             // "EG" — generado del nombre
rol                   // "Analista"
area / departamento   // "RRHH"
email
cuota_almacenamiento  // en bytes (máx 10 GB en el mock)
espacio_usado         // en bytes
```

### 10.2 Carpeta (`Folder`)
```
id
nombre                // "Contratos", "Facturas 2026", etc.
color_hex             // "#d4962a"
usuario_id            // dueño
total_archivos        // conteo calculado
fecha_creacion
```

### 10.3 Documento (`Document`)
```
id
nombre                // nombre del archivo con extensión
tipo                  // "pdf" | "img" | "doc" | "xls" | otros
origen                // "escaneado" | "subido"
estado_ocr            // "extraido" | "sin_ocr" | "procesando"
texto_ocr             // contenido extraído por OCR (para búsqueda full-text)
etiqueta / tag        // "Contrato" | "Factura" | "Legal" | "RR.HH." | "Finanzas" | null
tamanio_bytes
carpeta_id
usuario_id
fecha_subida / fecha_escaneo
url_almacenamiento    // ruta del archivo en el storage
```

### 10.4 Documento compartido (`SharedDocument`)
```
id
documento_id
compartido_por_usuario_id
compartido_con_usuario_id  // o email externo
estado                     // "pendiente" | "aceptado" | "rechazado"
token_acceso               // para links públicos/firmados
fecha_compartido
fecha_expiracion           // opcional
```

---

## 11. Etiquetas (Tags) disponibles

| Etiqueta | Color en UI | CSS class |
|---|---|---|
| Contrato | Azul accent | `doc-tag blue` |
| Factura | Verde | `doc-tag green` |
| Legal | Azul accent | `doc-tag blue` |
| RR.HH. | Gris | `doc-tag gray` |
| Finanzas | Ámbar | `doc-tag amber` |
| Sin etiqueta | — | — |

> Las etiquetas son actualmente un set cerrado. El backend puede implementarlas como enum o como tabla propia para permitir etiquetas personalizadas.

---

## 12. Tipos de archivo soportados (iconos en UI)

| Extensión/tipo | Badge | Color fondo | Color texto | CSS class |
|---|---|---|---|---|
| PDF | `PDF` | `--danger-light` (#fbe8e8) | `--danger` (#b02020) | `.file-icon.pdf` |
| Imagen (JPG, PNG, etc.) | `IMG` | `--success-light` (#e6f4ec) | `--success` (#1a7a4a) | `.file-icon.img` |
| Documento (DOC, DOCX) | `DOC` | `--accent-light` (#e8edfb) | `--accent` (#1a4fd6) | `.file-icon.doc` |
| Hoja de cálculo (XLS, XLSX) | `XLS` | `--folder-light` (#fdf3e0) | `--folder` (#d4962a) | `.file-icon.xls` |

---

## 13. Variables CSS del design system

```css
--bg: #f5f4f0             /* fondo general */
--surface: #ffffff         /* tarjetas y contenedores */
--surface2: #f0efe9        /* fondos secundarios, hover */
--border: rgba(0,0,0,0.08)
--border2: rgba(0,0,0,0.14)
--text: #1a1917            /* texto principal */
--text2: #6b6960           /* texto secundario */
--text3: #a8a69e           /* texto deshabilitado/meta */
--accent: #1a4fd6          /* azul principal (botones, activos) */
--accent-light: #e8edfb
--accent-dark: #1240b0
--success: #1a7a4a
--success-light: #e6f4ec
--warning: #a05a10
--warning-light: #fdf0e0
--danger: #b02020
--danger-light: #fbe8e8
--folder: #d4962a
--folder-light: #fdf3e0
--radius: 10px
--radius-lg: 14px
```

---

## 14. Funciones JavaScript existentes

```javascript
setActive(el)       // activa un nav-item en el sidebar
openScanner()       // muestra modal de escaneo
closeScanner()      // oculta modal de escaneo
openPDF(name)       // muestra visor PDF con el nombre indicado
closePDF()          // cierra visor PDF
showToast(msg)      // muestra notificación temporal (2.8s)

// Evento global:
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeScanner(); closePDF(); }
})
```

---

## 15. Funcionalidades pendientes de implementar (stubs en la UI)

| Funcionalidad | Estado actual | Lo que necesita |
|---|---|---|
| Subir archivo | Toast placeholder | File input + `POST /documents/upload` |
| Búsqueda | Input sin handler | Event listener + `GET /documents/search?q=` |
| Toggle vista grid/lista | Botones sin lógica | Cambiar renderizado de `.doc-list` a grid |
| Paginación en visor PDF | "1 / 4" hardcoded | PDF.js u otro renderer real |
| Carpeta — abrir | Toast | Filtrar documentos por `folder_id` |
| Compartidos conmigo | Badge hardcoded "3" | `GET /documents/shared-with-me` |
| Recientes | Nav sin acción | `GET /documents?sort=last_accessed` |
| Búsqueda avanzada | Nav sin acción | Vista dedicada con filtros (tipo, fecha, carpeta, tag) |
| Usuarios y roles | Nav sin acción | Panel de administración de usuarios |
| Configuración | Nav sin acción | Configuración de cuenta/org |
| Menú usuario (tres puntos) | Botón sin acción | Dropdown: perfil, cambiar contraseña, logout |
| Botón "Ver todos" (docs recientes) | Sin acción | Cargar lista completa de documentos |
| Drag & drop en scanner | Solo visual | Handler de `dragover`/`drop` + upload |

---

## 16. Flujos de usuario principales

### Flujo A — Subir/Escanear un documento
1. Click en "Escanear" (topbar o sidebar)
2. Modal se abre
3. Usuario conecta escáner o arrastra archivo
4. Completa nombre, carpeta destino y etiqueta
5. Click "Escanear ahora"
6. **Backend:** recibe archivo → ejecuta OCR → guarda documento → retorna metadatos
7. Toast de confirmación → documento aparece en la lista

### Flujo B — Buscar un documento
1. Usuario escribe en el buscador del topbar
2. **Backend:** búsqueda full-text en nombre + texto OCR + etiquetas
3. Resultados reemplazan la lista de documentos
4. Usuario hace click en un resultado → Visor PDF

### Flujo C — Compartir un documento
1. Hover sobre fila de documento → botón "Compartir"
2. **Backend:** `POST /documents/:id/share` → genera link/token
3. Toast "Enlace copiado al portapapeles" (actualmente hardcoded, debe ser real)

### Flujo D — Navegar carpetas
1. Click en carpeta (grid de carpetas o sidebar)
2. **Backend:** `GET /folders/:id/documents`
3. La lista de documentos se actualiza filtrada
4. El breadcrumb cambia a `Inicio > [Carpeta]`

---

## 17. Consideraciones para la integración backend

- **Autenticación:** La UI no tiene login implementado. El backend necesita auth (JWT recomendado). El sidebar muestra el usuario activo — debe provenir del token/sesión.
- **CORS:** El frontend actualmente se sirve como estático. Al consumir APIs deberá tener el origen correcto configurado en el backend.
- **OCR:** La interfaz menciona explícitamente "OCR extraído" como estado de documento. El backend debe integrar un servicio OCR (Tesseract, Google Vision, AWS Textract, etc.).
- **Almacenamiento de archivos:** El backend necesita un storage (S3, MinIO, disco local) para guardar los archivos binarios.
- **Cuota de almacenamiento:** El stat "1.8 GB de 10 GB" implica que hay cuotas por usuario o por organización.
- **Roles y permisos:** La sección "Usuarios y roles" sugiere un sistema multi-usuario con control de acceso. Considerar roles: Admin, Analista, Viewer.
- **Internacionalización:** Toda la UI está en español. El backend debe devolver fechas y mensajes considerando esto.
