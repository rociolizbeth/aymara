// Lógica de la clase de números: tarjetas, quiz (con inicio y fin) y progreso.
// El progreso (localStorage) se maneja en assets/progreso.js, cargado antes que este archivo.

const PREGUNTAS_POR_QUIZ = 8;

let nivelActual = 1;
let vistaActual = "tarjetas";
let indiceTarjeta = 0;
let tarjetaVolteada = false;

// Una sesión de quiz por nivel, solo en memoria (se reinicia si recargas la página
// o si tocas "Reiniciar progreso", que además borra las estadísticas guardadas).
let sesionesQuiz = {};

let progreso = cargarProgreso();

// ---------- Progreso por tarjeta / respuesta ----------

function marcarTarjetaVista(nivel, numero) {
  const p = progreso[nivel];
  if (!p.vistos.includes(numero)) {
    p.vistos.push(numero);
    guardarProgreso(progreso);
  }
}

function registrarRespuestaQuiz(nivel, correcta) {
  const p = progreso[nivel];
  p.quizTotal += 1;
  if (correcta) p.quizCorrectos += 1;
  guardarProgreso(progreso);
}

// ---------- Navegación entre niveles y vistas ----------

function elegirNivel(nivel) {
  nivelActual = nivel;
  indiceTarjeta = 0;
  tarjetaVolteada = false;
  renderTodo();
}

function elegirVista(vista) {
  vistaActual = vista;
  renderTodo();
}

function renderTodo() {
  renderSelectorNiveles();
  renderBarraProgreso();
  renderPestanas();
  if (vistaActual === "tarjetas") {
    renderTarjetas();
  } else {
    renderQuizVista();
  }
}

function renderPestanas() {
  const activaClases = ["bg-white", "shadow", "text-amber-800"];
  const inactivaClases = ["text-stone-500"];
  const tabTarjetas = document.getElementById("tab-tarjetas");
  const tabQuiz = document.getElementById("tab-quiz");

  tabTarjetas.classList.remove(...activaClases, ...inactivaClases);
  tabQuiz.classList.remove(...activaClases, ...inactivaClases);

  tabTarjetas.classList.add(...(vistaActual === "tarjetas" ? activaClases : inactivaClases));
  tabQuiz.classList.add(...(vistaActual === "quiz" ? activaClases : inactivaClases));
}

// ---------- Selector de nivel (nodos con anillo de progreso) ----------

function renderSelectorNiveles() {
  const cont = document.getElementById("selector-niveles");
  cont.innerHTML = "";
  Object.keys(NIVELES).forEach((key) => {
    const nivel = Number(key);
    const activo = nivel === nivelActual;
    const total = NIVELES[nivel].numeros.length;
    const pct = porcentajeNivel(progreso, nivel, total);

    const btn = document.createElement("button");
    btn.className = "flex flex-col items-center gap-1.5 shrink-0";
    btn.innerHTML = `
      <span class="anillo-progreso w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 transition active:scale-95 ${
        activo ? "ring-2 ring-amber-600 ring-offset-2" : ""
      }" style="--pct:${pct};--color:${activo ? "#b45309" : "#d6d3d1"}">
        <span class="w-full h-full rounded-full bg-white flex items-center justify-center text-base font-extrabold ${
          activo ? "text-amber-800" : "text-stone-400"
        }">${nivel}</span>
      </span>
      <span class="text-[11px] sm:text-xs font-semibold ${activo ? "text-amber-800" : "text-stone-400"}">${NIVELES[nivel].nombre}</span>
    `;
    btn.addEventListener("click", () => elegirNivel(nivel));
    cont.appendChild(btn);
  });
  document.getElementById("titulo-nivel").textContent = NIVELES[nivelActual].titulo;
}

// ---------- Barra de progreso del nivel actual ----------

function renderBarraProgreso() {
  const p = progreso[nivelActual];
  const total = NIVELES[nivelActual].numeros.length;
  const vistoPct = Math.round((p.vistos.length / total) * 100);
  const aciertoPct = p.quizTotal > 0 ? Math.round((p.quizCorrectos / p.quizTotal) * 100) : 0;

  document.getElementById("progreso-tarjetas-barra").style.width = vistoPct + "%";
  document.getElementById("progreso-tarjetas-texto").textContent =
    `${p.vistos.length} de ${total} tarjetas vistas`;

  document.getElementById("progreso-quiz-barra").style.width = aciertoPct + "%";
  document.getElementById("progreso-quiz-texto").textContent =
    p.quizTotal > 0
      ? `${p.quizCorrectos} de ${p.quizTotal} respuestas correctas (${aciertoPct}%)`
      : "Todavía no intentaste el quiz de este nivel";
}

// ---------- Tarjetas (flashcards) ----------

function renderTarjetas() {
  const numeros = NIVELES[nivelActual].numeros;
  const item = numeros[indiceTarjeta];
  renderBarraProgreso();
  renderSelectorNiveles();

  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <div class="flex flex-col items-center gap-6 fade-in">
      <div id="tarjeta" class="flip-card w-52 h-52 sm:w-64 sm:h-64 cursor-pointer select-none active:scale-95 transition-transform">
        <div class="flip-card-inner">
          <div class="flip-card-front bg-white border-2 border-amber-300 rounded-2xl shadow-lg">
            <span class="text-5xl sm:text-6xl font-bold text-amber-800">${item.n}</span>
            <span class="mt-3 text-xs sm:text-sm text-stone-400 flex items-center gap-1">
              <span aria-hidden="true">👆</span> Toca para ver en aymara
            </span>
          </div>
          <div class="flip-card-back bg-amber-700 text-white rounded-2xl shadow-lg">
            <span class="text-2xl sm:text-3xl font-bold">${item.aym}</span>
            <span class="mt-3 text-xs sm:text-sm text-amber-100">${item.n} en aymara</span>
            <button disabled
              class="mt-4 text-xs bg-amber-800/60 px-3 py-1 rounded-full cursor-not-allowed">
              🔊 Audio (próximamente)
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button id="btn-anterior"
          class="px-4 py-2 rounded-full bg-white border border-stone-300 font-semibold active:scale-95 transition disabled:opacity-30">
          ← Anterior
        </button>
        <span class="text-stone-500 text-sm tabular-nums">${indiceTarjeta + 1} / ${numeros.length}</span>
        <button id="btn-siguiente"
          class="px-4 py-2 rounded-full bg-white border border-stone-300 font-semibold active:scale-95 transition disabled:opacity-30">
          Siguiente →
        </button>
      </div>
    </div>
  `;

  const tarjeta = document.getElementById("tarjeta");
  tarjeta.classList.toggle("flipped", tarjetaVolteada);
  tarjeta.addEventListener("click", () => {
    tarjetaVolteada = !tarjetaVolteada;
    tarjeta.classList.toggle("flipped", tarjetaVolteada);
    if (tarjetaVolteada) {
      // Se cuenta como "vista" recién cuando la persona la voltea y ve la traducción.
      marcarTarjetaVista(nivelActual, item.n);
      renderBarraProgreso();
      renderSelectorNiveles();
    }
  });

  const btnAnterior = document.getElementById("btn-anterior");
  const btnSiguiente = document.getElementById("btn-siguiente");
  btnAnterior.disabled = indiceTarjeta === 0;
  btnSiguiente.disabled = indiceTarjeta === numeros.length - 1;

  btnAnterior.addEventListener("click", () => {
    if (indiceTarjeta > 0) {
      indiceTarjeta -= 1;
      tarjetaVolteada = false;
      renderTarjetas();
    }
  });
  btnSiguiente.addEventListener("click", () => {
    if (indiceTarjeta < numeros.length - 1) {
      indiceTarjeta += 1;
      tarjetaVolteada = false;
      renderTarjetas();
    }
  });
}

// ---------- Quiz: sesión de largo fijo, con pantalla de resultados al final ----------

function generarPreguntasSesion(nivel) {
  const numeros = NIVELES[nivel].numeros;
  const cantidad = Math.min(PREGUNTAS_POR_QUIZ, numeros.length);
  const barajados = [...numeros].sort(() => Math.random() - 0.5).slice(0, cantidad);

  return barajados.map((correcta) => {
    const distractores = numeros
      .filter((it) => it.n !== correcta.n)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opciones = [correcta, ...distractores].sort(() => Math.random() - 0.5);
    return { correcta, opciones, respondida: false, elegida: null };
  });
}

function obtenerSesionQuiz(nivel) {
  if (!sesionesQuiz[nivel]) {
    sesionesQuiz[nivel] = {
      preguntas: generarPreguntasSesion(nivel),
      indice: 0,
      aciertos: 0,
      terminada: false,
    };
  }
  return sesionesQuiz[nivel];
}

function reiniciarSesionQuiz(nivel) {
  sesionesQuiz[nivel] = {
    preguntas: generarPreguntasSesion(nivel),
    indice: 0,
    aciertos: 0,
    terminada: false,
  };
  renderQuizVista();
}

function renderQuizVista() {
  const sesion = obtenerSesionQuiz(nivelActual);
  if (sesion.terminada) {
    renderResultadosQuiz(sesion);
  } else {
    renderPreguntaQuiz(sesion);
  }
}

function renderPreguntaQuiz(sesion) {
  const pregunta = sesion.preguntas[sesion.indice];
  const total = sesion.preguntas.length;

  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <div class="max-w-md mx-auto fade-in">
      <div class="flex items-center justify-between text-xs text-stone-400 mb-2">
        <span>Pregunta ${sesion.indice + 1} de ${total}</span>
        <span>✅ ${sesion.aciertos} correcta${sesion.aciertos === 1 ? "" : "s"}</span>
      </div>
      <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-6">
        <div class="h-full bg-amber-500 transition-all duration-300" style="width:${Math.round(
          (sesion.indice / total) * 100
        )}%"></div>
      </div>

      <p class="text-center text-lg font-semibold text-stone-700 mb-6">
        ¿Cómo se dice <span class="text-amber-800">${pregunta.correcta.n}</span> en aymara?
      </p>
      <div id="opciones" class="grid grid-cols-1 gap-3"></div>
      <div id="retro" class="mt-4 text-center font-semibold min-h-[1.5rem]"></div>
      <div class="text-center mt-4">
        <button id="btn-siguiente-pregunta"
          class="px-5 py-2 rounded-full bg-amber-700 text-white font-semibold active:scale-95 transition hidden">
          ${sesion.indice + 1 < total ? "Siguiente pregunta →" : "Ver resultados →"}
        </button>
      </div>
    </div>
  `;

  const contOpciones = document.getElementById("opciones");
  pregunta.opciones.forEach((op) => {
    const btn = document.createElement("button");
    btn.textContent = op.aym;
    btn.className =
      "w-full text-left px-4 py-3 rounded-xl border-2 font-semibold transition active:scale-[0.98] border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300";
    btn.disabled = pregunta.respondida;
    btn.addEventListener("click", () => responderPreguntaQuiz(op));
    contOpciones.appendChild(btn);
  });

  const btnSiguiente = document.getElementById("btn-siguiente-pregunta");
  btnSiguiente.addEventListener("click", avanzarQuiz);

  if (pregunta.respondida) mostrarRetroalimentacion(pregunta);
}

function responderPreguntaQuiz(opcionElegida) {
  const sesion = sesionesQuiz[nivelActual];
  const pregunta = sesion.preguntas[sesion.indice];
  if (pregunta.respondida) return;

  const esCorrecta = opcionElegida.n === pregunta.correcta.n;
  pregunta.respondida = true;
  pregunta.elegida = opcionElegida;
  if (esCorrecta) sesion.aciertos += 1;

  registrarRespuestaQuiz(nivelActual, esCorrecta); // estadística histórica (localStorage)
  renderBarraProgreso();
  renderPreguntaQuiz(sesion);
}

function mostrarRetroalimentacion(pregunta) {
  const esCorrecta = pregunta.elegida.n === pregunta.correcta.n;
  const retro = document.getElementById("retro");
  retro.textContent = esCorrecta
    ? "¡Correcto! 🎉"
    : `Incorrecto. ${pregunta.correcta.n} es "${pregunta.correcta.aym}".`;
  retro.className =
    "mt-4 text-center font-semibold min-h-[1.5rem] pop-in " + (esCorrecta ? "text-green-700" : "text-red-700");

  document.querySelectorAll("#opciones button").forEach((btn) => {
    if (btn.textContent === pregunta.correcta.aym) {
      btn.classList.add("border-green-600", "bg-green-50");
    } else if (btn.textContent === pregunta.elegida.aym && !esCorrecta) {
      btn.classList.add("border-red-600", "bg-red-50");
    }
  });

  document.getElementById("btn-siguiente-pregunta").classList.remove("hidden");
}

function avanzarQuiz() {
  const sesion = sesionesQuiz[nivelActual];
  if (sesion.indice + 1 < sesion.preguntas.length) {
    sesion.indice += 1;
    renderPreguntaQuiz(sesion);
  } else {
    sesion.terminada = true;
    renderQuizVista();
  }
}

function renderResultadosQuiz(sesion) {
  const total = sesion.preguntas.length;
  const pct = total > 0 ? Math.round((sesion.aciertos / total) * 100) : 0;

  let mensaje, emoji;
  if (pct >= 80) {
    mensaje = "¡Excelente! Dominas este nivel.";
    emoji = "🏆";
  } else if (pct >= 50) {
    mensaje = "¡Bien hecho! Sigue practicando.";
    emoji = "👍";
  } else {
    mensaje = "Vale la pena repasar las tarjetas de nuevo.";
    emoji = "💪";
  }

  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <div class="max-w-sm mx-auto text-center fade-in py-2">
      <div class="text-5xl mb-3" aria-hidden="true">${emoji}</div>
      <h3 class="text-xl font-extrabold text-stone-800">¡Quiz terminado!</h3>
      <p class="text-stone-500 mt-1">${mensaje}</p>

      <div class="mt-5 bg-amber-50 border border-amber-200 rounded-2xl py-4">
        <p class="text-3xl font-extrabold text-amber-700">${sesion.aciertos} / ${total}</p>
        <p class="text-xs text-stone-500 mt-1">${pct}% de aciertos</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mt-6">
        <button id="btn-reintentar-quiz"
          class="flex-1 px-4 py-3 rounded-full bg-amber-700 text-white font-semibold active:scale-95 transition">
          🔁 Reintentar
        </button>
        <button id="btn-ver-tarjetas"
          class="flex-1 px-4 py-3 rounded-full bg-white border border-stone-300 font-semibold active:scale-95 transition">
          🗂️ Repasar tarjetas
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn-reintentar-quiz").addEventListener("click", () => reiniciarSesionQuiz(nivelActual));
  document.getElementById("btn-ver-tarjetas").addEventListener("click", () => elegirVista("tarjetas"));
}

// ---------- Inicio ----------

document.getElementById("tab-tarjetas").addEventListener("click", () => elegirVista("tarjetas"));
document.getElementById("tab-quiz").addEventListener("click", () => elegirVista("quiz"));

renderTodo();
