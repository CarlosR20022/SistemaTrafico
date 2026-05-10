let ultimaPrediccion  = null;
let intervaloRefresh  = null;
let segundosRestantes = 30;
let chatIniciadoUnaVez = false; // variable de módulo, no se resetea con cada fetch

function pedirUbicacion() {
  mostrarCard('card-loading');
  clearInterval(intervaloRefresh);

  if (!navigator.geolocation) {
    mostrarCard('card-error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => predecir(pos.coords.latitude, pos.coords.longitude),
    ()  => mostrarCard('card-error'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function predecir(lat, lon) {
  const ahora       = new Date();
  const hora        = ahora.getHours();
  const min         = ahora.getMinutes();
  const horaDecimal = hora + min / 60;
  const horaFormato = `${String(hora).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  const dia         = (ahora.getDay() + 6) % 7;
  const tzOffset    = ahora.getTimezoneOffset() * -60;

  try {
    const res  = await fetch(`${API}/api/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat, lon,
        hora_decimal: horaDecimal,
        hora_formato: horaFormato,
        dia,
        timestamp: ahora.getTime(),
        tz_offset: tzOffset,
      }),
    });
    const data = await res.json();
    ultimaPrediccion = data;
    mostrarResultado(data);
    iniciarContador(lat, lon);
  } catch (e) {
    mostrarCard('card-error');
  }
}

function mostrarResultado(d) {
  // Mostrar cards sin ocultar el chat si ya estaba visible
  document.getElementById('card-loading')?.classList.add('oculto');
  document.getElementById('card-error')?.classList.add('oculto');
  document.getElementById('card-resultado')?.classList.remove('oculto');
  document.getElementById('card-chat')?.classList.remove('oculto');

  // Ciudad
  const ciudad = d.ciudad_usuario && !d.ciudad_usuario.startsWith(',')
    ? d.ciudad_usuario : 'Tu ubicación';
  document.getElementById('txt-ciudad').textContent = ciudad;

  // Clima
  document.getElementById('clima-icono').src =
    `https://openweathermap.org/img/wn/${d.clima.icono}@2x.png`;
  document.getElementById('clima-desc').textContent =
    d.clima.descripcion !== 'No disponible' ? d.clima.descripcion : 'Clima no disponible';
  document.getElementById('clima-temp').textContent =
    d.clima.temp_c !== null ? `${d.clima.temp_c} °C` : '';
  document.getElementById('clima-humedad').textContent =
    d.clima.humedad !== null ? `💧 ${d.clima.humedad}%` : '';
  document.getElementById('clima-viento').textContent =
    d.clima.viento_kmh !== null ? `💨 ${d.clima.viento_kmh} km/h` : '';

  // Badge tráfico
  const badge = document.getElementById('trafico-badge');
  badge.className = `trafico-badge ${d.nivel_trafico}`;
  document.getElementById('trafico-nivel').textContent = d.nivel_trafico;

  // Stats
  document.getElementById('stat-tiempo').textContent    = d.tiempo.descripcion;
  document.getElementById('stat-llegada').textContent   = d.tiempo.hora_llegada;
  document.getElementById('stat-llegada-fecha').textContent =
    d.tiempo.fecha_llegada !== 'hoy' ? d.tiempo.fecha_llegada : '';
  document.getElementById('stat-distancia').textContent = `${d.contexto.distancia_carretera_km}`;
  document.getElementById('stat-hora').textContent      = d.contexto.hora_formato;

  // El bot solo responde cuando el usuario pregunta.
}

function iniciarContador(lat, lon) {
  segundosRestantes = 30;
  clearInterval(intervaloRefresh);
  actualizarTextoContador();
  intervaloRefresh = setInterval(() => {
    segundosRestantes--;
    actualizarTextoContador();
    if (segundosRestantes <= 0) predecir(lat, lon);
  }, 1000);
}

function actualizarTextoContador() {
  const el = document.getElementById('txt-refresh');
  if (el) el.textContent = `Actualización automática en ${segundosRestantes}s`;
}

// solo oculta las cards de estado
function mostrarCard(id) {
  ['card-loading', 'card-error', 'card-resultado'].forEach(c => {
    document.getElementById(c)?.classList.add('oculto');
  });
  document.getElementById(id)?.classList.remove('oculto');

  // Solo esconde el chat cuando hay un error o está cargando
  if (id !== 'card-resultado') {
    document.getElementById('card-chat')?.classList.add('oculto');
  }
}

function preguntar(texto) {
  document.getElementById('chat-input').value = texto;
  enviarChat();
}

async function enviarChat() {
  const input = document.getElementById('chat-input');
  const texto = input.value.trim();
  if (!texto) return;
  agregarMensaje(texto, 'user');
  input.value = '';

  const ctx = ultimaPrediccion ? {
    nivel_trafico:  ultimaPrediccion.nivel_trafico,
    tiempo_desc:    ultimaPrediccion.tiempo.descripcion,
    hora_llegada:   ultimaPrediccion.tiempo.hora_llegada,
    clima:          ultimaPrediccion.clima.descripcion,
    temp_c:         ultimaPrediccion.clima.temp_c,
    distancia_km:   ultimaPrediccion.contexto.distancia_carretera_km,
  } : null;

  try {
    const res  = await fetch(`${API}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mensaje: texto, contexto: ctx }),
    });
    const data = await res.json();
    agregarMensaje(data.respuesta, 'bot');
  } catch {
    agregarMensaje('Error al conectar con el asistente.', 'bot');
  }
}

function agregarMensaje(texto, tipo) {
  const c   = document.getElementById('chat-mensajes');
  const div = document.createElement('div');
  div.className   = `msg ${tipo}`;
  div.textContent = texto;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

window.addEventListener('load', pedirUbicacion);