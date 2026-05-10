<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/Database.php';

$filas = [];
$error = null;
try {
    $db    = Database::connect();
    $filas = $db->query('
        SELECT id, hora, dia, clima, distancia_km,
               nivel_trafico, tiempo_minutos, lat, lon, creado_en
        FROM historial ORDER BY creado_en DESC LIMIT 100
    ')->fetchAll();
} catch (Exception $e) {
    $error = 'Base de datos no conectada. Conecta MySQL para ver el historial.';
}

$dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
$colores = ['bajo' => '#16a34a', 'medio' => '#d97706', 'alto' => '#dc2626'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Historial · <?= ESCUELA_NOMBRE ?></title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="logo">🎓</div>
      <div class="header-text">
        <h1><?= ESCUELA_NOMBRE ?></h1>
        <p class="subtitulo">Historial de predicciones</p>
      </div>
      <nav class="nav">
        <a href="index.php"     class="nav-link">Inicio</a>
        <a href="historial.php" class="nav-link active">Historial</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="card">
      <h2 style="margin-bottom:16px">📋 Últimas 100 predicciones</h2>

      <?php if ($error): ?>
        <div class="alert-info"><?= $error ?></div>
      <?php elseif (empty($filas)): ?>
        <div class="alert-info">Aún no hay predicciones registradas.</div>
      <?php else: ?>
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Día</th>
                <th>Hora</th>
                <th>Clima</th>
                <th>Distancia</th>
                <th>Tráfico</th>
                <th>Tiempo est.</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($filas as $i => $f): ?>
              <tr>
                <td><?= count($filas) - $i ?></td>
                <td><?= date('d/m/Y', strtotime($f['creado_en'])) ?></td>
                <td><?= $dias[(int)$f['dia']] ?? '--' ?></td>
                <td><?= number_format($f['hora'], 0) ?>:<?= str_pad(round(($f['hora'] - floor($f['hora'])) * 60), 2, '0', STR_PAD_LEFT) ?></td>
                <td><?= $f['clima'] == 0 ? '☀️ Despejado' : ($f['clima'] == 0.5 ? '☁️ Nublado' : '🌧 Lluvia') ?></td>
                <td><?= $f['distancia_km'] ?> km</td>
                <td>
                  <span class="badge" style="background:<?= $colores[$f['nivel_trafico']] ?? '#888' ?>">
                    <?= ucfirst($f['nivel_trafico']) ?>
                  </span>
                </td>
                <td><?php
                  $m = (int)$f['tiempo_minutos'];
                  echo $m < 60 ? "{$m} min" : intdiv($m,60)."h ".($m%60)."min";
                ?></td>
              </tr>
              <?php endforeach ?>
            </tbody>
          </table>
        </div>
      <?php endif ?>
    </section>
  </main>

  <footer class="footer">
    <p><?= ESCUELA_NOMBRE ?> · Sistema de predicción de tráfico</p>
  </footer>
</body>
</html>
