<?php
class WeatherService
{
    public static function obtener(float $lat, float $lon): array
    {
        $url = sprintf(WEATHER_URL, $lat, $lon, WEATHER_API_KEY);
        $ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
        $raw = @file_get_contents($url, false, $ctx);

        if ($raw === false) return self::fallback('Sin conexión');

        $data = json_decode($raw, true);
        if (($data['cod'] ?? 0) != 200) return self::fallback($data['message'] ?? 'Error API');

        $id          = $data['weather'][0]['id']          ?? 800;
        $descripcion = $data['weather'][0]['description'] ?? 'despejado';
        $icono       = $data['weather'][0]['icon']        ?? '01d';
        $temp        = $data['main']['temp']              ?? 25.0;
        $humedad     = $data['main']['humidity']          ?? 0;
        $viento      = $data['wind']['speed']             ?? 0;
        $ciudad      = $data['name']                      ?? 'Desconocida';
        $pais        = $data['sys']['country']            ?? '';

        return [
            'clima_raw'   => ucfirst($descripcion),
            'clima_valor' => self::idAValor($id),
            'temp_c'      => round($temp, 1),
            'humedad'     => $humedad,
            'viento_kmh'  => round($viento * 3.6, 1),
            'icono'       => $icono,
            'ciudad'      => $ciudad,
            'pais'        => $pais,
            'error'       => null,
        ];
    }

    private static function idAValor(int $id): float
    {
        if ($id >= 200 && $id < 600) return 1.0;
        if ($id >= 600 && $id < 700) return 1.0;
        if ($id >= 700 && $id < 800) return 0.5;
        if ($id === 800)             return 0.0;
        if ($id > 800)               return 0.5;
        return 0.0;
    }

    private static function fallback(string $msg): array
    {
        return [
            'clima_raw'   => 'No disponible',
            'clima_valor' => 0.0,
            'temp_c'      => null,
            'humedad'     => null,
            'viento_kmh'  => null,
            'icono'       => '01d',
            'ciudad'      => null,
            'pais'        => null,
            'error'       => $msg,
        ];
    }
}
