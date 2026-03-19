import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

const KEYWORDS_BY_LANGUAGE = [
  { lang: 'English', color: '#7c6fff', words: ['help', 'save me', 'stop', 'leave me', 'dont touch', 'please stop'] },
  { lang: 'Hindi', color: '#ff6b6b', words: ['bachao', 'chodo', 'ruko', 'madad karo'] },
  { lang: 'Tamil', color: '#ffd93d', words: ['uthavi', 'vittu vidu', 'niruthtu'] },
  { lang: 'Telugu', color: '#6bcb77', words: ['sahayam', 'vadlandi', 'apandi'] },
  { lang: 'Malayalam', color: '#4d96ff', words: ['sahayam', 'vittu', 'nirthoo'] },
  { lang: 'Kannada', color: '#ff9f43', words: ['sahaya', 'bidi', 'nillisi'] },
  { lang: 'Bengali', color: '#ff6b9d', words: ['sahajjo', 'charo', 'thamo'] },
  { lang: 'Marathi', color: '#c77dff', words: ['madat kara', 'soda', 'thamba'] },
  { lang: 'Punjabi', color: '#00b4d8', words: ['madad', 'chhado', 'ruko'] },
  { lang: 'Gujarati', color: '#ff9f1c', words: ['madad', 'chhodo', 'roko'] },
];

export default function KeywordsScreen() {
  const [isListening, setIsListening] = useState(false);
  const [detectedWords, setDetectedWords] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isListening) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start();
      startListening();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      stopListening();
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening]);

  const startListening = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;
      await recordChunk();
      intervalRef.current = setInterval(async () => await recordChunk(), 4000);
    } catch (e) {}
  };

  const recordChunk = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      await new Promise(r => setTimeout(r, 3000));
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'chunk.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 });
      const data = response.data;
      if (data.is_distress && data.confidence.distress > 60) {
        const time = new Date().toLocaleTimeString();
        setDetectedWords(prev => [`${time} — Distress detected! (${data.confidence.distress}%)`, ...prev.slice(0, 9)]);
        setAlertCount(c => c + 1);
        Alert.alert('Distress Detected!', 'A distress sound was detected!', [{ text: 'OK' }]);
      }
    } catch (e) {}
  };

  const stopListening = async () => {
    clearInterval(intervalRef.current);
    try { if (recordingRef.current) await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Voice Keywords</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={[s.monitorCard, isListening && s.monitorCardActive]}>
          <Animated.View style={[s.orb, { transform: [{ scale: pulseAnim }] }]}>
            <View style={s.orbInner}>
              <Ionicons name={isListening ? "ear" : "ear-outline"} size={36} color="#FFE033" />
            </View>
          </Animated.View>
          <Text style={s.monitorTitle}>{isListening ? 'LISTENING...' : 'NOT ACTIVE'}</Text>
          <Text style={s.monitorSub}>{isListening ? 'Monitoring in 10 Indian languages' : 'Tap start to begin'}</Text>
          <View style={s.langCountBadge}>
            <Ionicons name="language-outline" size={14} color="#FFE033" />
            <Text style={s.langCountText}>10 Languages • 50+ Keywords</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.btn, isListening ? s.btnStop : s.btnStart]} onPress={() => setIsListening(!isListening)} activeOpacity={0.8}>
          <Ionicons name={isListening ? "stop-circle-outline" : "ear-outline"} size={22} color={isListening ? '#FF3B30' : 'white'} />
          <Text style={[s.btnText, isListening && { color: '#FF3B30' }]}>{isListening ? 'Stop Listening' : 'Start Listening'}</Text>
        </TouchableOpacity>

        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={[s.statVal, { color: alertCount > 0 ? '#FF3B30' : '#FFE033' }]}>{alertCount}</Text><Text style={s.statLabel}>Alerts</Text></View>
          <View style={s.statBox}><Text style={[s.statVal, { color: isListening ? '#34C759' : '#444' }]}>{isListening ? 'ON' : 'OFF'}</Text><Text style={s.statLabel}>Status</Text></View>
          <View style={s.statBox}><Text style={s.statVal}>10</Text><Text style={s.statLabel}>Languages</Text></View>
        </View>

        {KEYWORDS_BY_LANGUAGE.map((lang, i) => (
          <View key={i} style={s.langCard}>
            <View style={s.langHeader}>
              <View style={[s.langDot, { backgroundColor: lang.color }]} />
              <Text style={s.langName}>{lang.lang}</Text>
              <Text style={s.langWordCount}>{lang.words.length} keywords</Text>
            </View>
            <View style={s.keywordsList}>
              {lang.words.map((word, j) => (
                <View key={j} style={[s.keywordBadge, { borderColor: lang.color + '44', backgroundColor: lang.color + '11' }]}>
                  <Text style={[s.keywordText, { color: lang.color }]}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {detectedWords.length > 0 && (
          <View style={s.logCard}>
            <Text style={s.logTitle}>DETECTION LOG</Text>
            {detectedWords.map((log, i) => (
              <View key={i} style={s.logRow}>
                <Ionicons name="alert-circle-outline" size={16} color="#FF3B30" />
                <Text style={s.logText}>{log}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:20, paddingBottom:100 },
  monitorCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  monitorCardActive: { borderColor:'#FFE033' },
  orb: { width:120, height:120, borderRadius:60, backgroundColor:'rgba(255,224,51,0.1)', justifyContent:'center', alignItems:'center', borderWidth:1.5, borderColor:'rgba(255,224,51,0.3)', marginBottom:20 },
  orbInner: { width:85, height:85, borderRadius:43, backgroundColor:'rgba(255,224,51,0.2)', justifyContent:'center', alignItems:'center' },
  monitorTitle: { color:'white', fontSize:18, fontWeight:'800', letterSpacing:1, marginBottom:8 },
  monitorSub: { color:'#555', fontSize:13, textAlign:'center', marginBottom:12 },
  langCountBadge: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,224,51,0.1)', borderRadius:20, paddingHorizontal:14, paddingVertical:6, borderWidth:1, borderColor:'rgba(255,224,51,0.3)' },
  langCountText: { color:'#FFE033', fontSize:12, fontWeight:'700' },
  btn: { borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  btnStart: { backgroundColor:'#FFE033' },
  btnStop: { backgroundColor:'#1C1C1E', borderWidth:2, borderColor:'#FF3B30' },
  btnText: { color:'#111', fontSize:17, fontWeight:'700' },
  statsRow: { flexDirection:'row', gap:12, marginBottom:20 },
  statBox: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:18, alignItems:'center', borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { color:'#FFE033', fontSize:22, fontWeight:'800' },
  statLabel: { color:'#444', fontSize:11, marginTop:4 },
  langCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:14, borderWidth:1, borderColor:'#2C2C2E' },
  langHeader: { flexDirection:'row', alignItems:'center', marginBottom:12 },
  langDot: { width:10, height:10, borderRadius:5, marginRight:10 },
  langName: { color:'white', fontSize:15, fontWeight:'700', flex:1 },
  langWordCount: { color:'#444', fontSize:12 },
  keywordsList: { flexDirection:'row', flexWrap:'wrap', gap:8 },
  keywordBadge: { borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1 },
  keywordText: { fontSize:12, fontWeight:'600' },
  logCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:20, borderWidth:1, borderColor:'rgba(255,59,48,0.3)' },
  logTitle: { color:'#FF3B30', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  logRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  logText: { color:'#aaa', fontSize:12, flex:1 },
});
