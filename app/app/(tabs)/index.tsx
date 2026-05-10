import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Image, ScrollView, RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { API_BASE } from '@/constants/Api';
import { usePrediccion } from '@/context/PrediccionContext';
import { PrediccionResult } from '@/types';

const C = {
  azul:'#1e3a5f', verde:'#16a34a', amarillo:'#d97706', rojo:'#dc2626',
  bg:'#f1f5f9', card:'#ffffff', texto:'#1e293b', muted:'#64748b', borde:'#e2e8f0',
};

export default function PrediccionScreen() {
  const { setPrediccion } = usePrediccion();
  const [data, setData]             = useState<PrediccionResult | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [countdown, setCountdown]   = useState(30);
  const coordsRef    = useRef<{ lat: number; lon: number } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pedirUbicacion();
    return () => { clearInterval(countdownRef.current!); };
  }, []);

  async function pedirUbicacion() {
    setCargando(true); setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permiso de ubicación denegado.\nActívalo en Configuración → Privacidad → Ubicación.');
      setCargando(false); return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      coordsRef.current = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      await predecir(loc.coords.latitude, loc.coords.longitude);
      iniciarContador();
    } catch {
      setError('No se pudo obtener la ubicación GPS.');
      setCargando(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    if (coordsRef.current) { await predecir(coordsRef.current.lat, coordsRef.current.lon); iniciarContador(); }
    setRefreshing(false);
  }

  async function predecir(lat: number, lon: number) {
    const ahora = new Date();
    const h = ahora.getHours(), m = ahora.getMinutes();
    const horaDecimal = h + m / 60;
    const horaFormato = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const dia = (ahora.getDay() + 6) % 7;
    const tzOffset = ahora.getTimezoneOffset() * -60;
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, hora_decimal: horaDecimal, hora_formato: horaFormato, dia, timestamp: ahora.getTime(), tz_offset: tzOffset }),
      });
      const result: PrediccionResult = await res.json();
      setData(result); setPrediccion(result); setCargando(false);
    } catch {
      setError('No se pudo conectar al servidor.\n\n• Verifica que el servidor PHP esté corriendo\n• iPhone y Mac en la misma red WiFi\n• Revisa la IP en constants/Api.ts');
      setCargando(false);
    }
  }

  function iniciarContador() {
    clearInterval(countdownRef.current!); setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (coordsRef.current) predecir(coordsRef.current.lat, coordsRef.current.lon); return 300; }
        return prev - 1;
      });
    }, 1000);
  }

  if (cargando) return (
    <View style={[s.flex, s.center, { backgroundColor: C.bg }]}>
      <ActivityIndicator size="large" color={C.azul} />
      <Text style={s.loadingTxt}>Obteniendo tu ubicación...</Text>
    </View>
  );

  if (error || !data) return (
    <View style={[s.flex, s.center, { backgroundColor: C.bg, padding: 28 }]}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>📍</Text>
      <Text style={s.errTitulo}>Ubicación requerida</Text>
      <Text style={s.errTxt}>{error ?? 'Error desconocido'}</Text>
      <TouchableOpacity style={s.btnPrimary} onPress={pedirUbicacion}>
        <Text style={s.btnPrimaryTxt}>Intentar de nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  const badgeColor = { bajo: C.verde, medio: C.amarillo, alto: C.rojo }[data.nivel_trafico];
  const ciudad = data.ciudad_usuario && !data.ciudad_usuario.startsWith(',') ? data.ciudad_usuario : 'Tu ubicación';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={s.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.azul} />}>

      <View style={s.ciudadRow}>
        <Text style={{ fontSize: 15 }}>📍</Text>
        <Text style={s.ciudadNombre}>{ciudad}</Text>
      </View>

      <View style={s.card}>
        <View style={s.climaRow}>
          <Image source={{ uri: `https://openweathermap.org/img/wn/${data.clima.icono}@2x.png` }} style={s.climaImg} />
          <View style={{ flex: 1 }}>
            <Text style={s.climaDesc}>{data.clima.descripcion !== 'No disponible' ? data.clima.descripcion : 'Clima no disponible'}</Text>
            <View style={s.climaExtras}>
              {data.clima.temp_c    !== null && <Text style={s.climaExtra}>🌡 {data.clima.temp_c} °C</Text>}
              {data.clima.humedad   !== null && <Text style={s.climaExtra}>💧 {data.clima.humedad}%</Text>}
              {data.clima.viento_kmh !== null && <Text style={s.climaExtra}>💨 {data.clima.viento_kmh} km/h</Text>}
            </View>
          </View>
        </View>
      </View>

      <View style={s.card}>
        <View style={[s.badge, { backgroundColor: badgeColor }]}>
          <Text style={s.badgeTxt}>{data.nivel_trafico.toUpperCase()}</Text>
        </View>
        <Text style={s.badgeLbl}>Nivel de tráfico</Text>
        <View style={s.grid}>
          <View style={s.stat}><Text style={s.statVal}>{data.tiempo.descripcion}</Text><Text style={s.statLbl}>tiempo estimado</Text></View>
          <View style={[s.stat, s.statDst]}>
            <Text style={[s.statVal, { fontSize: 26 }]}>{data.tiempo.hora_llegada}</Text>
            {data.tiempo.fecha_llegada !== 'hoy' && <Text style={{ fontSize: 12, color: C.azul, fontWeight: '500' }}>{data.tiempo.fecha_llegada}</Text>}
            <Text style={s.statLbl}>hora de llegada</Text>
          </View>
          <View style={s.stat}><Text style={s.statVal}>{data.contexto.distancia_carretera_km} km</Text><Text style={s.statLbl}>por carretera</Text></View>
          <View style={s.stat}><Text style={s.statVal}>{data.contexto.hora_formato}</Text><Text style={s.statLbl}>hora actual</Text></View>
        </View>
        <View style={s.refreshRow}>
          <TouchableOpacity style={s.btnOutline} onPress={onRefresh}><Text style={s.btnOutlineTxt}>🔄 Actualizar</Text></TouchableOpacity>
          <Text style={{ fontSize: 12, color: C.muted }}>Auto en {countdown}s</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex:{flex:1}, center:{justifyContent:'center',alignItems:'center'},
  scroll:{padding:16,paddingBottom:32,gap:14},
  loadingTxt:{marginTop:14,color:'#64748b',fontSize:15},
  errTitulo:{fontSize:18,fontWeight:'600',color:'#1e293b',marginBottom:10},
  errTxt:{fontSize:14,color:'#64748b',textAlign:'center',lineHeight:22,marginBottom:24},
  ciudadRow:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:2},
  ciudadNombre:{fontSize:15,fontWeight:'600',color:'#1e3a5f'},
  card:{backgroundColor:'#ffffff',borderRadius:16,padding:20,borderWidth:1,borderColor:'#e2e8f0',shadowColor:'#000',shadowOpacity:0.06,shadowRadius:8,elevation:2},
  climaRow:{flexDirection:'row',alignItems:'center',gap:10},
  climaImg:{width:54,height:54},
  climaDesc:{fontSize:15,fontWeight:'600',color:'#1e293b'},
  climaExtras:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:4},
  climaExtra:{fontSize:13,color:'#64748b'},
  badge:{width:130,height:130,borderRadius:65,alignSelf:'center',justifyContent:'center',alignItems:'center',marginBottom:8},
  badgeTxt:{color:'#fff',fontSize:18,fontWeight:'700',letterSpacing:1},
  badgeLbl:{textAlign:'center',color:'#64748b',fontSize:13,marginBottom:18},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:16},
  stat:{width:'47.5%',backgroundColor:'#f1f5f9',borderRadius:12,padding:14,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center'},
  statDst:{borderColor:'#1e3a5f',backgroundColor:'#eef4ff'},
  statVal:{fontSize:18,fontWeight:'700',color:'#1e3a5f',textAlign:'center'},
  statLbl:{fontSize:11,color:'#64748b',marginTop:4,textAlign:'center'},
  refreshRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  btnPrimary:{backgroundColor:'#1e3a5f',paddingHorizontal:28,paddingVertical:13,borderRadius:10},
  btnPrimaryTxt:{color:'#fff',fontWeight:'600',fontSize:15},
  btnOutline:{borderWidth:1.5,borderColor:'#1e3a5f',paddingHorizontal:16,paddingVertical:9,borderRadius:10},
  btnOutlineTxt:{color:'#1e3a5f',fontWeight:'500',fontSize:14},
});
