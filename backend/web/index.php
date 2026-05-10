<?php require_once __DIR__ . '/../config.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tráfico · <?= ESCUELA_NOMBRE ?></title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>

  <header class="header">
    <div class="header-inner">
      <div class="logo">🎓</div>
      <div class="header-text">
        <h1><?= ESCUELA_NOMBRE ?></h1>
        <p class="subtitulo">Predictor de tráfico en tiempo real</p>
      </div>
      <nav class="nav">
        <a href="index.php"    class="nav-link active">Inicio</a>
        <a href="historial.php" class="nav-link">Historial</a>
      </nav>
    </div>
  </header>

  <main class="container">

    <!-- Loading -->
    <section class="card" id="card-loading">
      <div class="spinner"></div>
      <p class="muted" id="txt-ubicacion">Obteniendo tu ubicación...</p>
    </section>

    <!-- Error ubicación -->
    <section class="card oculto" id="card-error">
      <div class="card-icon">📍</div>
      <h2>Ubicación requerida</h2>
      <p class="muted">Necesitamos tu ubicación para calcular el tráfico.</p>
      <button class="btn btn-primary" onclick="pedirUbicacion()">Intentar de nuevo</button>
    </section>

    <!-- Resultado -->
    <section class="card oculto" id="card-resultado">

      <!-- Ciudad + clima -->
      <div class="ciudad-row">
        <span class="ciudad-icon">📍</span>
        <span id="txt-ciudad" class="ciudad-nombre">--</span>
      </div>

      <div class="clima-header">
        <img id="clima-icono" src="" alt="clima" onerror="this.style.display='none'">
        <div class="clima-info">
          <span id="clima-desc" class="clima-desc">--</span>
          <div class="clima-extras">
            <span id="clima-temp">--</span>
            <span id="clima-humedad" class="clima-extra"></span>
            <span id="clima-viento"  class="clima-extra"></span>
          </div>
        </div>
      </div>

      <!-- Badge tráfico -->
      <div id="trafico-badge" class="trafico-badge">
        <span id="trafico-nivel"></span>
      </div>
      <p class="trafico-label">Nivel de tráfico</p>

      <!-- Stats 2x2 -->
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-valor" id="stat-tiempo">--</span>
          <span class="stat-label">tiempo estimado</span>
        </div>
        <div class="stat stat-destacado">
          <span class="stat-valor grande" id="stat-llegada">--:--</span>
          <span class="stat-sub" id="stat-llegada-fecha"></span>
          <span class="stat-label">hora de llegada</span>
        </div>
        <div class="stat">
          <span class="stat-valor" id="stat-distancia">--</span>
          <span class="stat-label">km por carretera</span>
        </div>
        <div class="stat">
          <span class="stat-valor" id="stat-hora">--:--</span>
          <span class="stat-label">hora actual</span>
        </div>
      </div>

      <div class="refresh-row">
        <button class="btn btn-outline" onclick="pedirUbicacion()">🔄 Actualizar</button>
        <span id="txt-refresh" class="refresh-txt"></span>
      </div>
    </section>

    <!-- Chat -->
    <section class="card oculto" id="card-chat">
      <h2>💬 Asistente de tráfico</h2>
      <div id="chat-mensajes" class="chat-mensajes">
        <div class="msg bot">¡Hola! Soy tu asistente del ITTux. ¿En qué te puedo ayudar?</div>
      </div>
      <div class="chat-sugerencias">
        <button class="chip" onclick="preguntar('¿Cuál es el nivel de tráfico?')">🚦 Nivel de tráfico</button>
        <button class="chip" onclick="preguntar('¿Cuándo debería salir?')">🕐 ¿Cuándo salir?</button>
        <button class="chip" onclick="preguntar('¿Cómo está el clima?')">🌤 Clima</button>
        <button class="chip" onclick="preguntar('¿Cuánto tiempo tarda el viaje?')">⏱ Tiempo de viaje</button>
      </div>
      <div class="chat-input-row">
        <input type="text" id="chat-input" class="chat-input"
               placeholder="Escribe tu pregunta..."
               onkeydown="if(event.key==='Enter') enviarChat()">
        <button class="btn btn-primary" onclick="enviarChat()">Enviar</button>
      </div>
    </section>

  </main>

  <footer class="footer">
    <p><?= ESCUELA_NOMBRE ?> · Sistema de predicción de tráfico</p>
  </footer>

  <script>
    const API = '<?= (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]" ?>';
  </script>
  <script src="assets/app.js"></script>
</body>
</html>
