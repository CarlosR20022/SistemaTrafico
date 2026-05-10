<?php
require_once __DIR__ . '/../core/Response.php';

$body    = json_decode(file_get_contents('php://input'), true);
$mensaje = trim($body['mensaje'] ?? '');
$ctx     = $body['contexto'] ?? null;

if ($mensaje === '') Response::error('mensaje vacío');

Response::json(['ok' => true, 'respuesta' => chatbot($mensaje, $ctx)]);

function chatbot(string $msg, ?array $ctx): string
{
    $msg = mb_strtolower($msg, 'UTF-8');

    // Saludos
    if (preg_match('/^(hola|buenos|buenas|hey|qué tal|que tal|hi)/', $msg)) {
        $extra = $ctx ? " El tráfico actual está en nivel {$ctx['nivel_trafico']}." : '';
        return "¡Hola! Soy tu asistente de tráfico para el ITTux.{$extra} ¿En qué te puedo ayudar?";
    }

    // Tráfico
    if (str_contains($msg, 'tráfico') || str_contains($msg, 'trafico') || str_contains($msg, 'congestion') || str_contains($msg, 'congestión')) {
        if (!$ctx) return "Activa tu ubicación para ver el nivel de tráfico actual.";
        $consejos = [
            'bajo'  => "Es buen momento para salir, el camino estará despejado.",
            'medio' => "Hay tráfico moderado. Sal con 20-30 minutos de anticipación.",
            'alto'  => "Tráfico alto. Te recomiendo esperar o salir por una ruta alterna.",
        ];
        $consejo = $consejos[$ctx['nivel_trafico']] ?? '';
        return "El tráfico está en nivel {$ctx['nivel_trafico']}. {$consejo}";
    }

    // Tiempo / llegada
    if (preg_match('/tiempo|minutos|horas?|llegada|llegar|cuando|cuándo/', $msg)) {
        if (!$ctx) return "Activa tu ubicación para calcular el tiempo de viaje.";
        return "El tiempo estimado de viaje es {$ctx['tiempo_desc']} y llegarías aproximadamente a las {$ctx['hora_llegada']}.";
    }

    // Clima
    if (preg_match('/clima|lluvia|llueve|calor|frío|frio|temperatura|nublado/', $msg)) {
        if (!$ctx || $ctx['clima'] === 'No disponible')
            return "El clima no está disponible en este momento. Verifica tu conexión.";
        return "El clima en tu ubicación es: {$ctx['clima']}. " .
               ($ctx['temp_c'] ? "La temperatura es de {$ctx['temp_c']}°C." : "");
    }

    // Distancia
    if (preg_match('/distancia|kilómetros|km|lejos|cerca/', $msg)) {
        if (!$ctx) return "Activa tu ubicación para calcular la distancia al ITTux.";
        return "La distancia por carretera desde tu ubicación hasta el Instituto Tecnológico de Tuxtepec es de {$ctx['distancia_km']} km.";
    }

    // Ruta
    if (preg_match('/ruta|camino|cómo llego|como llego|cómo voy|por donde/', $msg)) {
        return "Para llegar al ITTux puedes usar Google Maps o Waze. La dirección es: Instituto Tecnológico de Tuxtepec, Oax. ¿Quieres saber el tiempo estimado de viaje?";
    }

    // Recomendación de salida
    if (preg_match('/cuándo salgo|cuando salgo|mejor hora|hora recomendada|qué hora/', $msg)) {
        if (!$ctx) return "Activa tu ubicación primero para darte una recomendación.";
        $recom = [
            'bajo'  => "puedes salir ahora mismo, el tráfico está despejado.",
            'medio' => "te recomiendo esperar a que baje el tráfico o salir en los próximos 30 minutos.",
            'alto'  => "espera al menos 1 hora antes de salir para evitar el tráfico alto.",
        ];
        return "Con el nivel de tráfico actual ({$ctx['nivel_trafico']}), " . ($recom[$ctx['nivel_trafico']] ?? "consulta más tarde.");
    }

    // Ayuda
    if (preg_match('/ayuda|help|qué puedes|que puedes|comandos/', $msg)) {
        return "Puedo ayudarte con: nivel de tráfico actual, tiempo estimado de viaje, hora de llegada, condiciones del clima, distancia al ITTux y recomendaciones de salida. ¿Qué quieres saber?";
    }

    return "No entendí tu consulta. Puedes preguntarme sobre tráfico, tiempo de viaje, clima o distancia al ITTux.";
}
