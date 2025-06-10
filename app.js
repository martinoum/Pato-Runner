//Variables globales
let time = new Date();
let deltaTime = 0;

//Estado del juego
let gameStarted = false;
let paused = false;
let gameOver = false;

//Velocidades y fisica
let sueloY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;
let gameVel = 1;
let velEscenario = 1280 / 3;
let score = 0;

//Estado del jugador
let patoPosX = 50;
let patoPosY = sueloY;
let saltando = false;
let agachado = false;

//Obstaculos y elementos
let tiempoHastaObstaculo = 2;
let tiempoHastaObstaculosMin = 0.7;
let tiempoHastaObstaculosMax = 1.8;
let obstaculos = [];

//Posiciones de fondos
let sueloX = 0;
let arbolesX = 0;
let nubesX = 0;

//Elementos DOM
let contenedor;
let pato;
let textoScore;
let suelo;
let gameOverPantalla;
let cielo1, cielo2;

//efectos y sonidos mas adelante

// Inicializar el juego cuando el DOM este listo
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  Init();
} else {
  document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
  time = new Date();
  Start();
  Loop();
}

function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();

  if (gameStarted && !paused && !gameOver) {
    Update();
  }

  requestAnimationFrame(Loop);
}

function Start() {
  gameOverPantalla = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector(".contenedor");
  textoScore = document.querySelector(".score");
  pato = document.querySelector(".pato");
  cielo1 = document.querySelector(".cielo-1"); // <-- AÑADIR ESTA LÍNEA
  cielo2 = document.querySelector(".cielo-2"); // <-- AÑADIR ESTA LÍNEA
  document
    .querySelector(".boton-inicio")
    .addEventListener("click", IniciarJuego);
  document
    .querySelector(".boton-reinicio")
    .addEventListener("click", ReiniciarJuego);

  document.addEventListener("keydown", HandleKeyDown);
  document.addEventListener("keyup", HandleKeyUp);
}

function IniciarJuego() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  gameVel = 1;

  document.querySelector(".pantalla-inicio").style.display = "none";
  document.querySelector(".game-over").style.display = "none";

  textoScore.innerText = "0";

  LimpiarElementosJuego();
  // MODIFICADO: Llamamos a la función para que el cielo se reinicie a su color inicial.
  CambiarColorCielo();

  pato.className = "pato pato-corriendo";
  MostrarMensaje("¡VAMOS!", "#4CAF50");
}

function ReiniciarJuego() {
  IniciarJuego();
}

function LimpiarElementosJuego() {
  obstaculos.forEach((obstaculo) => {
    if (obstaculo.parentElement) {
      obstaculo.parentElement.removeChild(obstaculo);
    }
  });
  obstaculos = [];
}

function Update() {
  MoverSuelo();
  MoverPato();
  DecidirCrearObstaculos();
  MoverObstaculos();
  DetectarColision();
}

function HandleKeyDown(ev) {
  if (ev.key === " " || ev.key === "ArrowUp" || ev.key.toLowerCase() === "w") {
    Saltar();
  } else if (ev.key === "ArrowDown" || ev.key.toLowerCase() === "s") {
    Agachar();
  } else if (ev.key.toLowerCase() === "p") {
    TogglePausa();
  }
}

function HandleKeyUp(ev) {
  if (ev.key === "ArrowDown" || ev.key.toLowerCase() === "s") {
    Levantarse();
  }
}

function TogglePausa() {
  if (gameStarted && !gameOver) {
    paused = !paused;
    MostrarMensaje(
      paused ? "PAUSA" : "¡SIGUE!",
      paused ? "#FFC107" : "#4CAF50"
    );
  }
}

function Saltar() {
  if (gameStarted && !gameOver && !paused) {
    // MODIFICADO: Usamos <= para permitir el salto incluso si hay imprecisiones decimales.
    if (patoPosY <= sueloY) {
      saltando = true;
      velY = impulso;
      pato.classList.remove("pato-corriendo", "pato-agachado");
      pato.classList.add("pato-saltando");
    }
  }
}

function Agachar() {
  if (gameStarted && !gameOver && !paused) {
    if (!agachado && patoPosY <= sueloY) {
      agachado = true;
      pato.classList.remove("pato-corriendo", "pato-saltando");
      pato.classList.add("pato-agachado");
    }
  }
}

function Levantarse() {
  if (agachado) {
    agachado = false;
    pato.classList.remove("pato-agachado");
    pato.classList.add("pato-corriendo");
  }
}

function MoverSuelo() {
  sueloX += CalcularDesplazamiento();
  suelo.style.backgroundPositionX = -sueloX + "px";

  nubesX += CalcularDesplazamiento() * 0.1;
  document.querySelector(".nubes").style.backgroundPositionX = -nubesX + "px";

  arbolesX += CalcularDesplazamiento() * 0.5;
  document.querySelector(".arboles").style.backgroundPositionX =
    -arbolesX + "px";
}

function MoverPato() {
  patoPosY += velY * deltaTime;

  // Aplicar gravedad
  if (patoPosY > sueloY) {
    // <-- LÍNEA CORREGIDA
    velY -= gravedad * deltaTime;
  } else {
    TocarSuelo();
  }

  pato.style.bottom = patoPosY + "px";
}

function TocarSuelo() {
  patoPosY = sueloY;
  velY = 0;

  if (saltando) {
    pato.classList.remove("pato-saltando");
    if (!agachado) {
      pato.classList.add("pato-corriendo");
    }
    saltando = false;
  }
}

function CalcularDesplazamiento() {
  return velEscenario * deltaTime * gameVel;
}

function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if (tiempoHastaObstaculo <= 0) {
    CrearObstaculo();
  }
}

function CrearObstaculo() {
  const tipoObstaculo = Math.random() > 0.3 ? "perro" : "pajaro";
  let obstaculo = document.createElement("div");

  if (tipoObstaculo === "perro") {
    obstaculo.className = "obstaculo perro";
    obstaculo.posY = sueloY;
  } else {
    obstaculo.className = "obstaculo pajaro";
    obstaculo.posY = sueloY + 45 + Math.random() * 10;
  }

  contenedor.appendChild(obstaculo);
  obstaculo.posX = contenedor.clientWidth;
  obstaculo.style.left = contenedor.clientWidth + "px";
  obstaculo.style.bottom = obstaculo.posY + "px";

  obstaculos.push(obstaculo);

  tiempoHastaObstaculo =
    tiempoHastaObstaculosMin +
    (Math.random() * (tiempoHastaObstaculosMax - tiempoHastaObstaculosMin)) /
      gameVel;
}

function MoverObstaculos() {
  for (let i = obstaculos.length - 1; i >= 0; i--) {
    const obstaculo = obstaculos[i];
    obstaculo.posX -= CalcularDesplazamiento();

    if (obstaculo.posX < -obstaculo.clientWidth) {
      obstaculo.parentNode.removeChild(obstaculo);
      obstaculos.splice(i, 1);
      GanarPuntos();
    } else {
      obstaculo.style.left = obstaculo.posX + "px";
    }
  }
}

function DetectarColision() {
  for (let i = 0; i < obstaculos.length; i++) {
    const obstaculo = obstaculos[i];
    if (obstaculo.posX + obstaculo.clientWidth < patoPosX) {
      continue;
    }

    if (IsCollision(pato, obstaculo, 10, 10, 10, 10)) {
      GameOver();
      break;
    }
  }
}

function IsCollision(
  a,
  b,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft
) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();

  return !(
    aRect.top + aRect.height - paddingBottom < bRect.top ||
    aRect.top + paddingTop > bRect.top + bRect.height ||
    aRect.left + aRect.width - paddingRight < bRect.left ||
    aRect.left + paddingLeft > bRect.left + bRect.width
  );
}

function GameOver() {
  gameOver = true;
  gameStarted = false;

  pato.classList.remove("pato-corriendo", "pato-saltando", "pato-agachado");
  pato.classList.add("pato-muerto");

  document.querySelector(".game-over").style.display = "flex";
  document.querySelector(".puntuacion-final span").innerText = score;
}

function GanarPuntos() {
  score++;
  textoScore.innerText = score;

  if (score % 10 === 0) {
    AumentarDificultad();
  }
}

// MODIFICADO: La función ahora es más simple.
function AumentarDificultad() {
  gameVel *= 1.1;
  CambiarColorCielo();
  // ELIMINADO: Ya no se muestra el mensaje de "NIVEL X".
}

// MODIFICADO: La función ya no depende de 'nivelActual'. Ahora se basa en la puntuación.
function CambiarColorCielo() {
  const colores = [
    "linear-gradient(to bottom, #72c4f8, #b9e3ff)", // Día
    "linear-gradient(to bottom, #ff9a56, #ffbc7d)", // Atardecer
    "linear-gradient(to bottom, #2c3e50, #34495e)", // Noche
    "linear-gradient(to bottom, #8e44ad, #9b59b6)", // Morado
    "linear-gradient(to bottom, #e74c3c, #f39c12)", // Rojo/naranja
  ];

  // Calculamos el índice del color basado en la puntuación
  const dificultadStep = Math.floor(score / 10);
  const nuevoColor = colores[dificultadStep % colores.length];

  // 1. Ponemos el nuevo color en la capa de arriba (que aún es transparente)
  cielo2.style.background = nuevoColor;

  // 2. Hacemos que la capa de arriba aparezca suavemente
  cielo2.style.opacity = 1;

  // 3. Después de que la transición termine (2 segundos), reseteamos
  setTimeout(() => {
    // El nuevo color pasa a ser el color de base en la capa de abajo
    cielo1.style.background = nuevoColor;
    // Y la capa de arriba vuelve a ser transparente, lista para la próxima vez
    cielo2.style.opacity = 0;
  }, 2000); // 2000ms = 2s, debe coincidir con la transición en CSS
}
function MostrarMensaje(texto, color) {
  const mensaje = document.createElement("div");
  mensaje.className = "mensaje";
  mensaje.innerText = texto;
  mensaje.style.color = color;

  contenedor.appendChild(mensaje);

  setTimeout(() => {
    if (mensaje.parentNode) {
      mensaje.parentNode.removeChild(mensaje);
    }
  }, 2000);
}
