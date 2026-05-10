<?php
/**
 * Red neuronal simple: 4 entradas → 3 neuronas ocultas → 2 salidas
 * Matriz de pesos: 4x3 (entrada→oculta) + 3x2 (oculta→salida)
 *
 * Entradas:
 *   [0] hora_normalizada   0.0 – 1.0  (hora / 23)
 *   [1] dia_semana         0.0 – 1.0  (dia / 6)
 *   [2] clima              0.0 – 1.0  (0=despejado, 0.5=nublado, 1=lluvia)
 *   [3] distancia_km       0.0 – 1.0  (normalizada sobre máximo conocido)
 *
 * Salidas:
 *   [0] nivel_trafico      0.0 – 1.0  (bajo/medio/alto)
 *   [1] tiempo_minutos     0.0 – 1.0  (desnormalizar × MAX_TIEMPO)
 */
class NeuralNetwork
{
    private array $w1;   // pesos entrada → oculta  [4][3]
    private array $b1;   // bias oculta              [3]
    private array $w2;   // pesos oculta → salida   [3][2]
    private array $b2;   // bias salida              [2]

    const MAX_TIEMPO = 60; // minutos máximos esperados

    public function __construct()
    {
        $this->loadWeights();
    }

    // ── Forward pass ────────────────────────────────────
    public function predict(array $inputs): array
    {
        // Capa oculta
        $hidden = [];
        for ($j = 0; $j < 3; $j++) {
            $sum = $this->b1[$j];
            for ($i = 0; $i < 4; $i++) {
                $sum += $inputs[$i] * $this->w1[$i][$j];
            }
            $hidden[$j] = $this->relu($sum);
        }

        // Capa de salida
        $output = [];
        for ($k = 0; $k < 2; $k++) {
            $sum = $this->b2[$k];
            for ($j = 0; $j < 3; $j++) {
                $sum += $hidden[$j] * $this->w2[$j][$k];
            }
            $output[$k] = $this->sigmoid($sum);
        }

        return [
            'nivel_trafico'  => $output[0],
            'tiempo_minutos' => round($output[1] * self::MAX_TIEMPO),
            'etiqueta'       => $this->etiqueta($output[0]),
        ];
    }

    // ── Activaciones ────────────────────────────────────
    private function relu(float $x): float
    {
        return max(0.0, $x);
    }

    private function sigmoid(float $x): float
    {
        return 1.0 / (1.0 + exp(-$x));
    }

    private function etiqueta(float $nivel): string
    {
        if ($nivel < 0.33) return 'bajo';
        if ($nivel < 0.66) return 'medio';
        return 'alto';
    }

    // ── Pesos ───────────────────────────────────────────
    private function loadWeights(): void
    {
        if (file_exists(WEIGHTS_PATH)) {
            $data       = json_decode(file_get_contents(WEIGHTS_PATH), true);
            $this->w1   = $data['w1'];
            $this->b1   = $data['b1'];
            $this->w2   = $data['w2'];
            $this->b2   = $data['b2'];
        } else {
            $this->initRandom();
            $this->saveWeights();
        }
    }

    public function saveWeights(): void
    {
        file_put_contents(WEIGHTS_PATH, json_encode([
            'w1' => $this->w1,
            'b1' => $this->b1,
            'w2' => $this->w2,
            'b2' => $this->b2,
        ], JSON_PRETTY_PRINT));
    }

    private function initRandom(): void
    {
        // Xavier initialization
        $scale1 = sqrt(2.0 / 4);
        $scale2 = sqrt(2.0 / 3);

        for ($i = 0; $i < 4; $i++)
            for ($j = 0; $j < 3; $j++)
                $this->w1[$i][$j] = (lcg_value() * 2 - 1) * $scale1;

        for ($j = 0; $j < 3; $j++) {
            $this->b1[$j] = 0.0;
            for ($k = 0; $k < 2; $k++)
                $this->w2[$j][$k] = (lcg_value() * 2 - 1) * $scale2;
        }
        for ($k = 0; $k < 2; $k++)
            $this->b2[$k] = 0.0;
    }
}
