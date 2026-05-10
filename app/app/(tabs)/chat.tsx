import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ListRenderItem,
} from 'react-native';
import { API_BASE } from '@/constants/Api';
import { usePrediccion } from '@/context/PrediccionContext';
import { ChatMessage } from '@/types';

const CHIPS = [
  { label: '🚦 Nivel de tráfico', pregunta: '¿Cuál es el nivel de tráfico?' },
  { label: '🕐 ¿Cuándo salir?',   pregunta: '¿Cuándo debería salir?' },
  { label: '🌤 Clima',            pregunta: '¿Cómo está el clima?' },
  { label: '⏱ Tiempo de viaje',   pregunta: '¿Cuánto tiempo tarda el viaje?' },
  { label: '📍 Distancia',        pregunta: '¿Cuál es la distancia al ITTux?' },
];

export default function ChatScreen() {
  const { prediccion } = usePrediccion();
  const [mensajes, setMensajes] = useState<ChatMessage[]>([{
    id: '0', tipo: 'bot',
    texto: '¡Hola! Soy tu asistente de tráfico para el ITTux. ¿En qué te puedo ayudar?',
    timestamp: new Date(),
  }]);
  const [input, setInput]       = useState('');
  const [enviando, setEnviando] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => { listRef.current?.scrollToEnd({ animated: true }); }, [mensajes]);

  async function enviar(textoOverride?: string) {
    const texto = (textoOverride ?? input).trim();
    if (!texto || enviando) return;
    setMensajes(prev => [...prev, { id: Date.now().toString(), tipo: 'user', texto, timestamp: new Date() }]);
    setInput(''); setEnviando(true);
    const ctx = prediccion ? {
      nivel_trafico: prediccion.nivel_trafico, tiempo_desc: prediccion.tiempo.descripcion,
      hora_llegada: prediccion.tiempo.hora_llegada, clima: prediccion.clima.descripcion,
      temp_c: prediccion.clima.temp_c, distancia_km: prediccion.contexto.distancia_carretera_km,
    } : null;
    try {
      const res  = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, contexto: ctx }),
      });
      const data = await res.json();
      setMensajes(prev => [...prev, { id: (Date.now()+1).toString(), tipo: 'bot', texto: data.respuesta ?? 'Sin respuesta.', timestamp: new Date() }]);
    } catch {
      setMensajes(prev => [...prev, { id: (Date.now()+1).toString(), tipo: 'bot', texto: 'Error al conectar con el asistente.', timestamp: new Date() }]);
    }
    setEnviando(false);
  }

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <View style={[s.burbuja, item.tipo === 'user' ? s.burbujaUser : s.burbujaBot]}>
      <Text style={item.tipo === 'user' ? s.txtUser : s.txtBot}>{item.texto}</Text>
      <Text style={s.hora}>{item.timestamp.getHours().toString().padStart(2,'0')}:{item.timestamp.getMinutes().toString().padStart(2,'0')}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:'#f1f5f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {!prediccion && (
        <View style={s.aviso}>
          <Text style={s.avisoTxt}>💡 Ve a Tráfico primero para que el asistente tenga contexto de tu viaje.</Text>
        </View>
      )}
      <FlatList ref={listRef} data={mensajes} keyExtractor={i => i.id} renderItem={renderItem}
        contentContainerStyle={s.lista} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })} />
      <View style={s.chips}>
        {CHIPS.map(c => (
          <TouchableOpacity key={c.label} style={s.chip} onPress={() => enviar(c.pregunta)}>
            <Text style={s.chipTxt}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput}
          placeholder="Escribe tu pregunta..." placeholderTextColor="#64748b"
          returnKeyType="send" onSubmitEditing={() => enviar()} editable={!enviando} />
        <TouchableOpacity style={[s.btnSend, enviando && { opacity:0.5 }]} onPress={() => enviar()} disabled={enviando}>
          <Text style={s.btnSendTxt}>{enviando ? '...' : '➤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  aviso:{backgroundColor:'#eef4ff',padding:10,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#c7d9f5'},
  avisoTxt:{fontSize:13,color:'#1e3a5f',lineHeight:18},
  lista:{padding:16,gap:10,paddingBottom:8},
  burbuja:{maxWidth:'80%',paddingHorizontal:14,paddingVertical:10,borderRadius:16,marginBottom:2},
  burbujaBot:{backgroundColor:'#e8f0fe',alignSelf:'flex-start',borderBottomLeftRadius:4},
  burbujaUser:{backgroundColor:'#1e3a5f',alignSelf:'flex-end',borderBottomRightRadius:4},
  txtBot:{color:'#1e293b',fontSize:14,lineHeight:20},
  txtUser:{color:'#ffffff',fontSize:14,lineHeight:20},
  hora:{fontSize:10,color:'rgba(0,0,0,0.3)',marginTop:4,alignSelf:'flex-end'},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:6,padding:12,paddingBottom:6,backgroundColor:'#ffffff',borderTopWidth:1,borderTopColor:'#e2e8f0'},
  chip:{backgroundColor:'#f1f5f9',borderWidth:1,borderColor:'#e2e8f0',borderRadius:20,paddingHorizontal:12,paddingVertical:6},
  chipTxt:{fontSize:12,color:'#1e293b'},
  inputRow:{flexDirection:'row',gap:8,padding:12,paddingTop:6,backgroundColor:'#ffffff',borderTopWidth:1,borderTopColor:'#e2e8f0'},
  input:{flex:1,backgroundColor:'#f1f5f9',borderWidth:1.5,borderColor:'#e2e8f0',borderRadius:22,paddingHorizontal:16,paddingVertical:10,fontSize:15,color:'#1e293b'},
  btnSend:{backgroundColor:'#1e3a5f',width:44,height:44,borderRadius:22,justifyContent:'center',alignItems:'center'},
  btnSendTxt:{color:'#fff',fontSize:18},
});
