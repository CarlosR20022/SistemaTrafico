<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

try {
    $db   = Database::connect();
    $rows = $db->query('
        SELECT id, hora, dia, clima, distancia_km,
               nivel_trafico, tiempo_minutos, creado_en
        FROM historial
        ORDER BY creado_en DESC
        LIMIT 50
    ')->fetchAll();

    Response::json(['ok' => true, 'total' => count($rows), 'data' => $rows]);
} catch (Exception $e) {
    Response::error('No se pudo conectar a la base de datos: ' . $e->getMessage(), 500);
}
