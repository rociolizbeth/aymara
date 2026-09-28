// Almacenamiento del progreso, compartido por todas las páginas.
// Sin backend: todo vive en localStorage, en el propio navegador de cada persona.

const CLAVE_PROGRESO = "aymarYatiqanaProgreso";
const NIVELES_IDS = [1, 2, 3];

function progresoNivelVacio() {
  return { vistos: [], quizCorrectos: 0, quizTotal: 0 };
}

function progresoVacio() {
  const p = {};
  NIVELES_IDS.forEach((nivel) => (p[nivel] = progresoNivelVacio()));
  return p;
}

function cargarProgreso() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
    if (guardado) {
      // por si en el futuro se agregan niveles nuevos que aún no existían al guardar
      NIVELES_IDS.forEach((nivel) => {
        if (!guardado[nivel]) guardado[nivel] = progresoNivelVacio();
      });
      return guardado;
    }
  } catch (e) {
    /* localStorage no disponible o dato corrupto: empezamos de cero */
  }
  return progresoVacio();
}

function guardarProgreso(progreso) {
  try {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
  } catch (e) {
    /* si el navegador bloquea localStorage, seguimos sin guardar */
  }
}

// Porcentaje combinado de avance de un nivel (mitad tarjetas vistas, mitad aciertos del quiz)
function porcentajeNivel(progreso, nivel, totalNumeros) {
  const p = progreso[nivel];
  const pctTarjetas = totalNumeros > 0 ? p.vistos.length / totalNumeros : 0;
  const pctQuiz = p.quizTotal > 0 ? p.quizCorrectos / p.quizTotal : 0;
  return Math.round(((pctTarjetas + pctQuiz) / 2) * 100);
}

// Borra TODO el progreso (todos los niveles). Pide confirmación antes de borrar.
// callbackAlConfirmar se ejecuta si la persona confirma (útil para refrescar la pantalla).
function reiniciarProgresoConConfirmacion(callbackAlConfirmar) {
  const confirmado = window.confirm(
    "¿Seguro que quieres reiniciar todo tu progreso? Se borrarán las tarjetas vistas y los resultados del quiz de todos los niveles. Esta acción no se puede deshacer."
  );
  if (!confirmado) return false;
  try {
    localStorage.removeItem(CLAVE_PROGRESO);
  } catch (e) {
    /* nada que hacer si el navegador bloquea localStorage */
  }
  if (typeof callbackAlConfirmar === "function") callbackAlConfirmar();
  return true;
}
