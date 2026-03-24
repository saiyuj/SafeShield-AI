import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = 'http://192.168.29.145:5000';

const KEYWORDS = {
  English: ['help', 'save me', 'danger', 'call police', 'emergency'],
  Hindi: ['bachao', 'madad karo', 'chhodo', 'police bulao', 'khatra'],
  Tamil: ['udhavi', 'vidungal', 'aapaththu', 'police vaango', 'help pannunga'],
  Telugu: ['sahaayam', 'vadalandi', 'pramadam', 'police raandi', 'kaapaadandi'],
  Malayalam: ['sahaayikku', 'vidoo', 'അപകടം', 'police varika', 'help cheyyoo'],
  Kannada: ['sahaaya', 'bidu', 'police kareyiri', 'apaaya', 'uttara kodi'],
  Bengali: ['bachao', 'sahajjo koro', 'chhere dao', 'police dakao', 'bipad'],
  Marathi: ['vachava', 'madad kara', 'police la sanga', 'dhoka', 'sodva'],
  Punjabi: ['bachao', 'madat karo', 'chhaddo', 'police saddo', 'khatra'],
  Gujarati: ['bachavo', 'madad karo', 'police ne bolavo', 'jokhm', 'chhadvo'],
};

export default function KeywordsScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [detectedKeyword, setDetectedKeyword] = useState('');
  const [alertSent, setAlertSent] = useState(false);
  const [selectedLang, setSelectedLang] = useState('All');
  const [logs, setLogs] = useState([]);
  const recordingRef = useRef(null);
  const isActiveRef = useRef(false);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      waveAnim.stopAnimation(); waveAnim.setValue(0);
    }
    return () => { pulseAnim.stopAnimation(); waveAnim.stopAnimation(); };
  }, [isListening]);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ msg, time, type }, ...prev.slice(0, 6)]);
  };

  const safeStop = async () => {
    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
      recordingRef.current = null;
    }
  };

  const sendEmergencyAlert = async (keyword) => {
    setAlertSent(true);
    Vibration.vibrate([300, 100, 300, 100, 300]);
    addLog(`🚨 ALERT SENT! Keyword: "${keyword}"`, 'alert');
    Alert.alert(
      '🚨 DISTRESS KEYWORD DETECTED!',
      `Keyword: "${keyword}"\n\nEmergency alert sent to your contacts!\nYour location has been shared.\n\nHelp is on the way!`,
      [{ text: 'OK', onPress: () => setAlertSent(false) }]
    );
    try {
      await axios.post(`${API_URL}/predict`, new FormData(), { timeout: 5000 });
    } catch (e) {}
  };

  const recordAndAnalyze = async () => {
    if (!isActiveRef.current) return;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      addLog('👂 Listening for keywords...', 'info');
      await new Promise(r => setTimeout(r, 3000));
      if (!isActiveRef.current) { await safeStop(); return; }
      await safeStop();

      // Send to AI for analysis
      const uri = recording.getURI();
      if (!uri) return;
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'keyword.wav' } as any);
      try {
        const res = await axios.post(`${API_URL}/predict`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000
        });
        if (res.data.is_distress && res.data.confidence.distress > 60) {
          addLog(`⚠️ Distress detected: ${res.data.confidence.distress}%`, 'alert');
          await sendEmergencyAlert('Distress Sound');
        } else {
          addLog(`✅ Safe — ${res.data.confidence.normal}% normal`, 'safe');
        }
      } catch (e) {
        addLog('⚠️ Server check failed — monitoring continues', 'warn');
      }
    } catch (e) {
      addLog('Mic error — retrying...', 'warn');
    }
  };

  const startListening = async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Required', 'Allow microphone access.'); return; }
    setIsListening(true);
    isActiveRef.current = true;
    setLogs([]);
    addLog('✅ Keyword detection started', 'safe');
    await recordAndAnalyze();
    intervalRef.current = setInterval(async () => {
      if (isActiveRef.current) await recordAndAnalyze();
    }, 5000);
  };

  const stopListening = async () => {
    isActiveRef.current = false;
    clearInterval(intervalRef.current);
    await safeStop();
    setIsListening(false);
    addLog('⏹ Detection stopped', 'info');
  };

  const allKeywords = Object.entries(KEYWORDS);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => { stopListening(); router.back(); }} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Voice Keyword Detection</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Main Orb */}
        <View style={s.orbContainer}>
          <Animated.View style={[s.orbOuter, { transform: [{ scale: pulseAnim }], borderColor: isListening ? '#FF3B30' : '#FFE033' }]}>
            <View style={[s.orbMiddle, { backgroundColor: isListening ? 'rgba(255,59,48,0.15)' : 'rgba(255,224,51,0.15)' }]}>
              <View style={[s.orbInner, { backgroundColor: isListening ? 'rgba(255,59,48,0.3)' : 'rgba(255,224,51,0.3)' }]}>
                <Ionicons name={isListening ? 'ear' : 'ear-outline'} size={36} color={isListening ? '#FF3B30' : '#FFE033'} />
              </View>
            </View>
          </Animated.View>
          <Text style={[s.orbStatus, { color: isListening ? '#FF3B30' : '#FFE033' }]}>
            {isListening ? '🔴 LIVE — Listening...' : 'Tap to Start Listening'}
          </Text>
          <Text style={s.orbSub}>
            {isListening ? 'AI monitoring every 5 seconds for distress keywords' : 'Detects distress keywords in 10 Indian languages'}
          </Text>
        </View>

        {/* Alert banner */}
        {alertSent && (
          <View style={s.alertBanner}>
            <Ionicons name="warning" size={22} color="white" />
            <Text style={s.alertBannerText}>🚨 EMERGENCY ALERT SENT!</Text>
          </View>
        )}

        {/* Control button */}
        <TouchableOpacity
          style={[s.controlBtn, isListening && s.controlBtnStop]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.85}
        >
          <Ionicons name={isListening ? 'stop-circle-outline' : 'mic-outline'} size={22} color={isListening ? '#FF3B30' : '#111'} />
          <Text style={[s.controlBtnText, isListening && { color: '#FF3B30' }]}>
            {isListening ? 'Stop Detection' : 'Start Keyword Detection'}
          </Text>
        </TouchableOpacity>

        {/* Activity log */}
        {logs.length > 0 && (
          <View style={s.logCard}>
            <Text style={s.logTitle}>ACTIVITY LOG</Text>
            {logs.map((log, i) => (
              <View key={i} style={s.logRow}>
                <View style={[s.logDot, { backgroundColor: log.type === 'alert' ? '#FF3B30' : log.type === 'safe' ? '#34C759' : '#FFE033' }]} />
                <Text style={s.logTime}>{log.time}</Text>
                <Text style={[s.logMsg, log.type === 'alert' && { color: '#FF3B30' }]}>{log.msg}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Keywords by language */}
        <Text style={s.sectionTitle}>Keywords Being Monitored</Text>
        {allKeywords.map(([lang, words]) => (
          <View key={lang} style={s.langCard}>
            <View style={s.langHeader}>
              <Text style={s.langName}>🌐 {lang}</Text>
              <View style={s.langBadge}><Text style={s.langBadgeText}>{words.length} words</Text></View>
            </View>
            <View style={s.keywordsRow}>
              {words.map((w, i) => (
                <View key={i} style={s.keywordTag}>
                  <Text style={s.keywordText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:17, fontWeight:'800' },
  scroll: { padding:16, paddingBottom:100 },
  orbContainer: { alignItems:'center', marginBottom:20 },
  orbOuter: { width:150, height:150, borderRadius:75, borderWidth:2, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,224,51,0.08)', marginBottom:14 },
  orbMiddle: { width:112, height:112, borderRadius:56, justifyContent:'center', alignItems:'center' },
  orbInner: { width:78, height:78, borderRadius:39, justifyContent:'center', alignItems:'center' },
  orbStatus: { fontSize:16, fontWeight:'800', marginBottom:6 },
  orbSub: { color:'#666', fontSize:12, textAlign:'center', paddingHorizontal:20 },
  alertBanner: { backgroundColor:'#FF3B30', borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', gap:10, marginBottom:14 },
  alertBannerText: { color:'white', fontSize:15, fontWeight:'800', flex:1 },
  controlBtn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 },
  controlBtnStop: { backgroundColor:'#1C1C1E', borderWidth:2, borderColor:'#FF3B30' },
  controlBtnText: { color:'#111', fontSize:16, fontWeight:'800' },
  logCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:16, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  logTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  logRow: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:8 },
  logDot: { width:6, height:6, borderRadius:3 },
  logTime: { color:'#444', fontSize:10, width:70 },
  logMsg: { color:'#888', fontSize:11, flex:1 },
  sectionTitle: { color:'white', fontSize:16, fontWeight:'800', marginBottom:12 },
  langCard: { backgroundColor:'#1C1C1E', borderRadius:16, padding:16, marginBottom:10, borderWidth:1, borderColor:'#2C2C2E' },
  langHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  langName: { color:'white', fontSize:14, fontWeight:'700' },
  langBadge: { backgroundColor:'rgba(255,224,51,0.15)', borderRadius:8, paddingHorizontal:8, paddingVertical:3 },
  langBadgeText: { color:'#FFE033', fontSize:10, fontWeight:'700' },
  keywordsRow: { flexDirection:'row', flexWrap:'wrap', gap:6 },
  keywordTag: { backgroundColor:'#111111', borderRadius:8, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'#333' },
  keywordText: { color:'#aaa', fontSize:11 },
});
