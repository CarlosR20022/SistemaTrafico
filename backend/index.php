<?php
require_once 'config.php';
require_once 'core/Response.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// ── Servir archivos estáticos y páginas web ──────────────
if (php_sapi_name() === 'cli-server') {
    $file = __DIR__ . $uri;
    if (is_file($file)) return false;
}

// ── CORS para la API ─────────────────────────────────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); exit;
}

$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'POST /api/predict' => 'api/predict.php',
    'POST /api/chat'    => 'api/chat.php',
    'GET /api/history'  => 'api/history.php',
];

$key = "$method $uri";

if (isset($routes[$key])) {
    require_once $routes[$key];
} else {
    Response::json(['error' => 'Ruta no encontrada'], 404);
}
