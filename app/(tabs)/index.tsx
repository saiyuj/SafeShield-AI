import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Animated, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = "http://192.168.29.145:5000";

export default function HomeScreen() {
  const [isProtecting, setIsProtecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const recordingRef = useRef(null);
  const isRecordingActiveRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const isProtectingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isProtecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      isProtectingRef.current = true;
      startAutoDetection();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      isProtectingRef.current = false;
      stopAutoDetection();
    }
    return () => {
      isProtectingRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, [isProtecting]);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`${time} — ${message}`, ...prev.slice(0, 4)]);
  };

  const safeStopRecording = async () => {
    if (recordingRef.current && isRecordingActiveRef.current) {
      try {
        isRecordingActiveRef.current = false;
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
    }
  };

  const startAutoDetection = async () => {
    addLog('Auto protection started');
    await recordAndAnalyze();
    intervalRef.current = setInterval(async () => {
      if (isProtectingRef.current) {
        await recordAndAnalyze();
      }
    }, 8000);
  };

  const stopAutoDetection = async () => {
    clearInterval(intervalRef.current);
    await safeStopRecording();
    addLog('Protection stopped');
  };

  const recordAndAnalyze = async () => {
    if (!isProtectingRef.current) return;
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      isRecordingActiveRef.current = true;
      setIsAnalyzing(true);
      addLog('Listening...');
      await new Promise(r => setTimeout(r, 3000));
      if (!isProtectingRef.current) {
        await safeStopRecording();
        setIsAnalyzing(false);
        return;
      }
      await safeStopRecording();
      const uri = recording.getURI();
      if (!uri) return;
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'auto.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      const data = response.data;
      setResult(data);
      setIsAnalyzing(false);
      if (data.is_distress && data.confidence.distress > 65) {
        setAlertCount(c => c + 1);
        addLog(`ALERT! Distress ${data.confidence.distress}%`);
        Alert.alert('🚨 DISTRESS DETECTED!', `Confidence: ${data.confidence.distress}%\nEmergency contacts notified!`, [{ text: 'OK' }]);
      } else {
        addLog(`Safe — ${data.confidence.normal}% normal`);
      }
    } catch (e) {
      setIsAnalyzing(false);
      addLog('Server not reachable');
    }
  };

  const stats = [
    { icon: <MaterialCommunityIcons name="robot-outline" size={24} color="#FFE033" />, val: '87%', label: 'Accuracy' },
    { icon: <Ionicons name="flash-outline" size={24} color="#FFE033" />, val: '3s', label: 'Speed' },
    { icon: <Ionicons name="language-outline" size={24} color="#FFE033" />, val: '10', label: 'Languages' },
    { icon: <Ionicons name="lock-closed-outline" size={24} color="#FFE033" />, val: '24/7', label: 'Protected' },
  ];

  const features = [
    { icon: <Ionicons name="ear-outline" size={26} color="#FF9500" />, title: 'Voice Keywords', desc: '10 Indian languages', color: '#FF9500', screen: 'screens/keywords' },
    { icon: <Ionicons name="people-outline" size={26} color="#5856D6" />, title: 'Crowd Safety', desc: 'Real-time analysis', color: '#5856D6', screen: 'screens/crowd' },
    { icon: <Ionicons name="mic-outline" size={26} color="#FF2D55" />, title: 'Stress Analysis', desc: 'Fear detection', color: '#FF2D55', screen: 'screens/stress' },
    { icon: <Ionicons name="camera-outline" size={26} color="#34C759" />, title: 'Evidence', desc: 'Secret camera', color: '#34C759', screen: 'screens/selfie' },
    { icon: <Ionicons name="calculator-outline" size={26} color="#007AFF" />, title: 'Disguise', desc: 'Calculator look', color: '#007AFF', screen: 'screens/disguise' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={s.header}>
        <View style={s.logoRow}>
          <Animated.View style={[s.logoCircle, { transform: [{ translateY: floatAnim }] }]}>
            <Ionicons name="shield" size={26} color="#111" />
          </Animated.View>
          <View>
            <Text style={s.logoText}>SafeShield</Text>
            <Text style={s.logoSub}>Your safety bestie 💛</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: isProtecting ? '#34C75922' : '#FF3B3022', borderColor: isProtecting ? '#34C759' : '#FF3B30' }]}>
          <View style={[s.statusDot, { backgroundColor: isProtecting ? '#34C759' : '#FF3B30' }]} />
          <Text style={[s.statusText, { color: isProtecting ? '#34C759' : '#FF3B30' }]}>{isProtecting ? 'ACTIVE' : 'OFF'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={[s.heroCard, isProtecting && s.heroCardActive]}>
          <View style={s.heroTop}>
            <Animated.View style={[s.bigOrb, {
              transform: [{ scale: pulseAnim }],
              borderColor: isProtecting ? 'rgba(52,199,89,0.4)' : 'rgba(255,224,51,0.3)',
              backgroundColor: isProtecting ? 'rgba(52,199,89,0.1)' : 'rgba(255,224,51,0.1)',
            }]}>
              <View style={[s.bigOrbMiddle, { backgroundColor: isProtecting ? 'rgba(52,199,89,0.15)' : 'rgba(255,224,51,0.15)' }]}>
                <View style={[s.bigOrbInner, { backgroundColor: isProtecting ? 'rgba(52,199,89,0.25)' : 'rgba(255,224,51,0.25)' }]}>
                  {isAnalyzing
                    ? <ActivityIndicator size="large" color={isProtecting ? '#34C759' : '#FFE033'} />
                    : <Ionicons name={isProtecting ? "shield-checkmark" : "shield-outline"} size={36} color={isProtecting ? '#34C759' : '#FFE033'} />
                  }
                </View>
              </View>
            </Animated.View>
            <Text style={s.heroTitle}>{isAnalyzing ? 'Analyzing...' : isProtecting ? 'Protecting You' : 'Protection Off'}</Text>
            <Text style={s.heroSub}>{isAnalyzing ? 'AI is processing audio right now' : isProtecting ? 'AI automatically monitors every 8 seconds' : 'Tap below to start automatic AI protection'}</Text>
            {isProtecting && (
              <View style={s.alertCountRow}>
                <View style={s.alertCountCard}><Text style={s.alertCountVal}>{alertCount}</Text><Text style={s.alertCountLabel}>Alerts</Text></View>
                <View style={s.alertCountCard}><Text style={[s.alertCountVal, { color: '#34C759' }]}>AUTO</Text><Text style={s.alertCountLabel}>Mode</Text></View>
                <View style={s.alertCountCard}><Text style={[s.alertCountVal, { color: '#007AFF' }]}>8s</Text><Text style={s.alertCountLabel}>Interval</Text></View>
              </View>
            )}
          </View>
          <TouchableOpacity style={[s.protectBtn, isProtecting ? s.protectBtnStop : s.protectBtnStart]} onPress={() => setIsProtecting(!isProtecting)} activeOpacity={0.85}>
            <Ionicons name={isProtecting ? "stop-circle-outline" : "shield-checkmark-outline"} size={24} color={isProtecting ? "#FF3B30" : "#111"} />
            <Text style={[s.protectBtnText, isProtecting && { color: '#FF3B30' }]}>{isProtecting ? 'Stop Protection' : 'Start Auto Protection'}</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[s.resultCard, result.is_distress ? s.resultDanger : s.resultSafe]}>
            <Ionicons name={result.is_distress ? "warning-outline" : "checkmark-circle-outline"} size={40} color={result.is_distress ? '#FF3B30' : '#34C759'} />
            <View style={s.resultInfo}>
              <Text style={[s.resultTitle, { color: result.is_distress ? '#FF3B30' : '#34C759' }]}>{result.is_distress ? 'DISTRESS DETECTED' : 'ALL CLEAR'}</Text>
              <Text style={s.resultSub}>{result.is_distress ? `${result.confidence.distress}% confidence` : `${result.confidence.normal}% normal`}</Text>
            </View>
          </View>
        )}

        {logs.length > 0 && (
          <View style={s.logCard}>
            <Text style={s.logTitle}>ACTIVITY LOG</Text>
            {logs.map((log, i) => (
              <View key={i} style={s.logRow}>
                <View style={[s.logDot, { backgroundColor: log.includes('ALERT') ? '#FF3B30' : '#34C759' }]} />
                <Text style={s.logText}>{log}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              {stat.icon}
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Protection Suite</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.featureScroll}>
          {features.map((f, i) => (
            <TouchableOpacity key={i} style={[s.featureCard, { borderColor: f.color + '44' }]} onPress={() => router.push(f.screen as any)} activeOpacity={0.8}>
              <View style={[s.featureIconBox, { backgroundColor: f.color + '22' }]}>{f.icon}</View>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureSub}>{f.desc}</Text>
              <View style={[s.featureArrow, { backgroundColor: f.color }]}>
                <Ionicons name="chevron-forward" size={14} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#222' },
  logoRow: { flexDirection:'row', alignItems:'center', gap:12 },
  logoCircle: { width:46, height:46, borderRadius:23, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  logoText: { color:'white', fontSize:18, fontWeight:'900', letterSpacing:0.5 },
  logoSub: { color:'#666', fontSize:11 },
  statusBadge: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1.5 },
  statusDot: { width:7, height:7, borderRadius:4 },
  statusText: { fontSize:11, fontWeight:'800', letterSpacing:1 },
  scroll: { padding:16, paddingBottom:120 },
  heroCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:28, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  heroCardActive: { borderColor:'#34C75944' },
  heroTop: { alignItems:'center', marginBottom:24 },
  bigOrb: { width:140, height:140, borderRadius:70, justifyContent:'center', alignItems:'center', borderWidth:2, marginBottom:18 },
  bigOrbMiddle: { width:100, height:100, borderRadius:50, justifyContent:'center', alignItems:'center' },
  bigOrbInner: { width:70, height:70, borderRadius:35, justifyContent:'center', alignItems:'center' },
  heroTitle: { color:'white', fontSize:24, fontWeight:'900', marginBottom:6 },
  heroSub: { color:'#666', fontSize:13, textAlign:'center', lineHeight:20 },
  alertCountRow: { flexDirection:'row', gap:12, marginTop:16 },
  alertCountCard: { backgroundColor:'#111111', borderRadius:14, padding:12, alignItems:'center', minWidth:70 },
  alertCountVal: { color:'#FFE033', fontSize:18, fontWeight:'900' },
  alertCountLabel: { color:'#555', fontSize:10, marginTop:2 },
  protectBtn: { borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10 },
  protectBtnStart: { backgroundColor:'#FFE033' },
  protectBtnStop: { backgroundColor:'#1C1C1E', borderWidth:2, borderColor:'#FF3B30' },
  protectBtnText: { color:'#111', fontSize:17, fontWeight:'800' },
  resultCard: { borderRadius:20, padding:16, marginBottom:16, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1.5 },
  resultDanger: { backgroundColor:'rgba(255,59,48,0.1)', borderColor:'rgba(255,59,48,0.4)' },
  resultSafe: { backgroundColor:'rgba(52,199,89,0.1)', borderColor:'rgba(52,199,89,0.4)' },
  resultInfo: { flex:1 },
  resultTitle: { fontSize:15, fontWeight:'800' },
  resultSub: { color:'#666', fontSize:12, marginTop:3 },
  logCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:16, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  logTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  logRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 },
  logDot: { width:6, height:6, borderRadius:3 },
  logText: { color:'#888', fontSize:12, flex:1 },
  statsRow: { flexDirection:'row', gap:10, marginBottom:24 },
  statCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:14, alignItems:'center', gap:6, borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { color:'#FFE033', fontSize:16, fontWeight:'900' },
  statLabel: { color:'#555', fontSize:10, textAlign:'center' },
  sectionTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:14 },
  featureScroll: { marginBottom:20 },
  featureCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginRight:12, width:150, borderWidth:1 },
  featureIconBox: { width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center', marginBottom:12 },
  featureTitle: { color:'white', fontSize:13, fontWeight:'700', marginBottom:4 },
  featureSub: { color:'#555', fontSize:11, marginBottom:12 },
  featureArrow: { width:26, height:26, borderRadius:13, justifyContent:'center', alignItems:'center', alignSelf:'flex-end' },
});
