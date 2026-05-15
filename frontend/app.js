/* ============================================================
   app.js — Gestor Documental DocScan
   Funciones de interacción de la interfaz
   ============================================================ */

// ── TIMER para el toast ──
let toastTimer;

/* ------------------------------------------------------------
   NAVEGACIÓN SIDEBAR
   ------------------------------------------------------------ */

/**
 * Marca el ítem de navegación clickeado como activo
 * y elimina el estado activo de los demás.
 * @param {HTMLElement} el - El elemento nav-item clickeado
 */
function setActive(el) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  el.classList.add('active');
}

/* ------------------------------------------------------------
   MODAL ESCÁNER
   ------------------------------------------------------------ */

/**
 * Abre el modal de escaneo de documentos.
 */
function openScanner() {
  document.getElementById('scannerModal').classList.add('open');
}

/**
 * Cierra el modal de escaneo de documentos.
 */
function closeScanner() {
  document.getElementById('scannerModal').classList.remove('open');
}

/* ------------------------------------------------------------
   VISOR PDF
   ------------------------------------------------------------ */

/**
 * Abre el visor de PDF con el nombre del archivo indicado.
 * @param {string} name - Nombre del archivo a mostrar en la barra del visor
 */
function openPDF(name) {
  document.getElementById('pdfTitle').textContent = name;
  document.getElementById('pdfViewer').classList.add('open');
}

/**
 * Cierra el visor de PDF.
 */
function closePDF() {
  document.getElementById('pdfViewer').classList.remove('open');
}

/* ------------------------------------------------------------
   TOAST (notificación)
   ------------------------------------------------------------ */

/**
 * Muestra una notificación temporal en la esquina inferior derecha.
 * Se oculta automáticamente después de 2.8 segundos.
 * @param {string} msg - Texto del mensaje a mostrar
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ------------------------------------------------------------
   EVENTOS GLOBALES
   ------------------------------------------------------------ */

/**
 * Cierra modales abiertos al presionar la tecla Escape.
 */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeScanner();
    closePDF();
  }
});