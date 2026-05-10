import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ListRenderItem,
} from 'react-native';
import { API_BASE } from '@/constants/Api';
import { HistorialItem } from '@/types';

const DIAS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const CLIMAS: Record<string, string> = { '0':'☀️', '0.5':'☁️', '1':'🌧' };
const BADGE_COLOR: Record<string, string> = { bajo:'#16a34a', medio:'#d97706', alto:'#dc2626' };

function formatTiempo(min: number) {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min/60)} h ${min%60 > 0 ? min%60+'min' : ''}`.trim();
}

export default function HistorialScreen() {
  const [items, setItems]           = useState<HistorialItem[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchHistorial = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/history`);
      const data = await res.json();
      if (data.ok) { setItems(data.data); setError(null); }
      else setError('No se pudieron cargar los datos.');
    } catch {
      setError('Sin conexión al servidor.\nEl historial requiere MySQL conectado.');
    } finally { setCargando(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchHistorial(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchHistorial(); };

  const renderItem: ListRenderItem<HistorialItem> = ({ item }) => {
    const climaKey = String(item.clima);
    const h = Math.floor(item.hora);
    const m = Math.round((item.hora - h) * 60).toString().padStart(2,'0');
    return (
      <View style={s.fila}>
        <View style={[s.badge, { backgroundColor: BADGE_COLOR[item.nivel_trafico] ?? '#888' }]}>
          <Text style={s.badgeTxt}>{item.nivel_trafico.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.filaTop}>
            <Text style={s.filaTitulo}>{DIAS[item.dia] ?? '--'} {h}:{m}</Text>
            <Text style={s.filaTiempo}>{formatTiempo(item.tiempo_minutos)}</Text>
          </View>
          <View style={s.filaBottom}>
            <Text style={s.filaInfo}>{CLIMAS[climaKey] ?? '🌤'} · {item.distancia_km} km</Text>
            <Text style={s.filaFecha}>{new Date(item.creado_en).toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (cargando) return (
    <View style={[s.flex,s.center,{backgroundColor:'#f1f5f9'}]}>
      <ActivityIndicator size="large" color="#1e3a5f" />
      <Text style={{marginTop:12,color:'#64748b'}}>Cargando historial...</Text>
    </View>
  );

  if (error) return (
    <View style={[s.flex,s.center,{backgroundColor:'#f1f5f9',padding:28}]}>
      <Text style={{fontSize:40,marginBottom:12}}>📋</Text>
      <Text style={{fontSize:16,fontWeight:'600',color:'#1e293b',marginBottom:8}}>Sin historial</Text>
      <Text style={{fontSize:14,color:'#64748b',textAlign:'center',lineHeight:20,marginBottom:20}}>{error}</Text>
      <TouchableOpacity style={s.btnPrimary} onPress={onRefresh}>
        <Text style={{color:'#fff',fontWeight:'600'}}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList style={{flex:1,backgroundColor:'#f1f5f9'}} data={items} keyExtractor={i=>String(i.id)}
      renderItem={renderItem} contentContainerStyle={{padding:16,gap:10,paddingBottom:32}}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e3a5f" />}
      ListHeaderComponent={<Text style={s.headerTxt}>Últimas {items.length} predicciones</Text>}
      ListEmptyComponent={<Text style={{color:'#64748b',textAlign:'center',marginTop:40}}>Sin predicciones aún.</Text>}
    />
  );
}

const s = StyleSheet.create({
  flex:{flex:1}, center:{justifyContent:'center',alignItems:'center'},
  headerTxt:{fontSize:13,color:'#64748b',marginBottom:8,fontWeight:'500'},
  fila:{backgroundColor:'#ffffff',borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#e2e8f0',shadowColor:'#000',shadowOpacity:0.04,shadowRadius:4,elevation:1},
  badge:{paddingHorizontal:10,paddingVertical:5,borderRadius:20,minWidth:60,alignItems:'center'},
  badgeTxt:{color:'#fff',fontSize:11,fontWeight:'700'},
  filaTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:4},
  filaTitulo:{fontSize:15,fontWeight:'600',color:'#1e293b'},
  filaTiempo:{fontSize:14,fontWeight:'600',color:'#1e3a5f'},
  filaBottom:{flexDirection:'row',justifyContent:'space-between'},
  filaInfo:{fontSize:13,color:'#64748b'},
  filaFecha:{fontSize:12,color:'#94a3b8'},
  btnPrimary:{backgroundColor:'#1e3a5f',paddingHorizontal:28,paddingVertical:12,borderRadius:10},
});
