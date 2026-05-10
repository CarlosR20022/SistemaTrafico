<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/NeuralNetwork.php';
require_once __DIR__ . '/../core/WeatherService.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

$body    = json_decode(file_get_contents('php://input'), true);
$userLat = (float)($body['lat'] ?? ESCUELA_LAT);
$userLon = (float)($body['lon'] ?? ESCUELA_LON);

// Hora y día vienen del navegador (hora local real del usuario)
$horaDecimal = (float)($body['hora_decimal'] ?? 12.0);  // ej. 14.77 = 14:46
$dia         = (int)($body['dia']            ?? 0);      // 0=lun…6=dom
$horaFormato = $body['hora_formato']         ?? '12:00'; // "14:46"

// Clima real desde OpenWeatherMap
$clima = WeatherService::obtener($userLat, $userLon);

// Distancia
$distancia_recta     = haversine($userLat, $userLon, ESCUELA_LAT, ESCUELA_LON);
$distancia_carretera = round($distancia_recta * 1.25, 1);

// Normalizar entradas para la NN
$inputs = [
    min($horaDecimal / 23, 1.0),
    $dia / 6,
    $clima['clima_valor'],
    min($distancia_recta / DISTANCIA_MAX_KM, 1.0),
];

$nn     = new NeuralNetwork();
$result = $nn->predict($inputs);

// Tiempo realista por distancia + nivel de tráfico
$multiplicadores = ['bajo' => 1.0, 'medio' => 1.2, 'alto' => 1.55];
$mult            = $multiplicadores[$result['etiqueta']] ?? 1.0;
$tiempo_minutos  = (int)round(($distancia_carretera / 80) * 60 * $mult);

// Hora de llegada usando timestamp del cliente
$tsCliente   = (int)($body['timestamp'] ?? time() * 1000);
$llegada     = new DateTime('@' . intdiv($tsCliente, 1000));
$llegada->modify("+{$tiempo_minutos} minutes");

// Detectar zona horaria del cliente
$offsetSeg   = (int)($body['tz_offset'] ?? 0); // offset en segundos enviado por el browser
$tz          = new DateTimeZone(offsetANombre($offsetSeg));
$llegada->setTimezone($tz);

$ahora = new DateTime('@' . intdiv($tsCliente, 1000));
$ahora->setTimezone($tz);

$mismo_dia   = $ahora->format('d/m/Y') === $llegada->format('d/m/Y');
$hora_llegada= $llegada->format('H:i');
$fecha_llegada = $mismo_dia ? 'hoy' : $llegada->format('d/m/Y');

try {
    $db = Database::connect();
    $db->prepare('INSERT INTO historial
        (hora, dia, clima, distancia_km, nivel_trafico, tiempo_minutos, lat, lon)
        VALUES (?,?,?,?,?,?,?,?)')
    ->execute([round($horaDecimal,2), $dia, $clima['clima_valor'],
               $distancia_carretera, $result['etiqueta'], $tiempo_minutos,
               $userLat, $userLon]);
} catch (Exception) {}

Response::json([
    'ok'            => true,
    'escuela'       => ESCUELA_NOMBRE,
    'ciudad_usuario' => $clima['ciudad'] . ', ' . $clima['pais'],
    'nivel_trafico' => $result['etiqueta'],
    'score'         => round($result['nivel_trafico'], 3),
    'tiempo'        => [
        'minutos'       => $tiempo_minutos,
        'descripcion'   => formatearTiempo($tiempo_minutos),
        'hora_llegada'  => $hora_llegada,
        'fecha_llegada' => $fecha_llegada,
    ],
    'clima'         => [
        'descripcion' => $clima['clima_raw'],
        'valor'       => $clima['clima_valor'],
        'temp_c'      => $clima['temp_c'],
        'icono'       => $clima['icono'],
    ],
    'contexto'      => [
        'hora'                   => round($horaDecimal, 2),
        'hora_formato'           => $horaFormato,
        'dia'                    => $dia,
        'distancia_recta_km'     => round($distancia_recta, 1),
        'distancia_carretera_km' => $distancia_carretera,
        'lat_usuario'            => $userLat,
        'lon_usuario'            => $userLon,
        'multiplicador_trafico'  => $mult,
    ],
]);

function formatearTiempo(int $min): string {
    if ($min < 60) return "{$min} min";
    $h = intdiv($min, 60); $m = $min % 60;
    return $m > 0 ? "{$h} h {$m} min" : "{$h} h";
}

function offsetANombre(int $offsetSeg): string {
    // Cancún = -18000 (-5h), CDMX = -21600 (-6h)
    $map = [
        -18000 => 'America/Cancun',
        -21600 => 'America/Mexico_City',
        -25200 => 'America/Denver',
        -28800 => 'America/Los_Angeles',
        0      => 'UTC',
    ];
    return $map[$offsetSeg] ?? 'America/Mexico_City';
}

function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float {
    $r = 6371;
    $dLat = deg2rad($lat2-$lat1); $dLon = deg2rad($lon2-$lon1);
    $a = sin($dLat/2)**2 + cos(deg2rad($lat1))*cos(deg2rad($lat2))*sin($dLon/2)**2;
    return $r * 2 * asin(sqrt($a));
}
