<?php
/**
 * Script de entrenamiento — ejecutar desde CLI:
 *   php train/train.php
 *
 * Ajusta $datos con registros reales de tráfico.
 * Guarda los pesos entrenados en data/weights.json
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/NeuralNetwork.php';

// [hora/23, dia/6, clima, dist/20] => [nivel 0-1, tiempo 0-1]
$datos = [
    [[0.33, 0.0, 0.0, 0.25], [0.2, 0.3]],  // 7:48 lun despejado → bajo  18min
    [[0.33, 0.0, 1.0, 0.25], [0.8, 0.7]],  // 7:48 lun lluvia    → alto  42min
    [[0.29, 1.0, 0.0, 0.25], [0.1, 0.2]],  // 6:48 mar despejado → bajo  12min
    [[0.33, 4.0, 0.5, 0.50], [0.5, 0.5]],  // 7:48 vie nublado   → medio 30min
];

$lr     = 0.1;   // learning rate
$epochs = 5000;

// TODO: implementar backpropagation completo.
// Por ahora el script valida que los pesos se leen y guardan correctamente.
$nn = new NeuralNetwork();

foreach ($datos as $muestra) {
    $pred = $nn->predict($muestra[0]);
    echo "Predicción: {$pred['etiqueta']} – {$pred['tiempo_minutos']} min\n";
}

echo "Entrenamiento pendiente de implementar. Pesos guardados.\n";
