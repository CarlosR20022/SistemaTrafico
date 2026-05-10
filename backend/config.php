<?php
define('DB_HOST',     'localhost');
define('DB_NAME',     'sistema_trafico');
define('DB_USER',     'root');
define('DB_PASS',     '');
define('DB_CHARSET',  'utf8mb4');

define('WEIGHTS_PATH',   __DIR__ . '/data/weights.json');
define('ALLOWED_ORIGIN', '*');

// ── OpenWeatherMap ───────────────────────────────────────
define('WEATHER_API_KEY', '4dedc1ccce90cbc4f2d63f9ae5d5012c');
define('WEATHER_URL',
    'https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=es'
);

// ── Instituto Tecnológico de Tuxtepec ────────────────────
define('ESCUELA_NOMBRE', 'Instituto Tecnológico de Tuxtepec');
define('ESCUELA_LAT',    18.09386405550977);
define('ESCUELA_LON',   -96.14614386075964);
define('DISTANCIA_MAX_KM', 30);   // radio máximo esperado para normalizar
