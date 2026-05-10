export interface PrediccionResult {
  ok: boolean;
  escuela: string;
  ciudad_usuario: string;
  nivel_trafico: 'bajo' | 'medio' | 'alto';
  score: number;
  tiempo: {
    minutos: number;
    descripcion: string;
    hora_llegada: string;
    fecha_llegada: string;
  };
  clima: {
    descripcion: string;
    valor: number;
    temp_c: number | null;
    humedad: number | null;
    viento_kmh: number | null;
    icono: string;
  };
  contexto: {
    hora: number;
    hora_formato: string;
    dia: number;
    distancia_recta_km: number;
    distancia_carretera_km: number;
    lat_usuario: number;
    lon_usuario: number;
    multiplicador_trafico: number;
  };
}
export interface ChatMessage {
  id: string;
  tipo: 'user' | 'bot';
  texto: string;
  timestamp: Date;
}
export interface HistorialItem {
  id: number;
  hora: number;
  dia: number;
  clima: number;
  distancia_km: number;
  nivel_trafico: 'bajo' | 'medio' | 'alto';
  tiempo_minutos: number;
  lat: number;
  lon: number;
  creado_en: string;
}
