import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Animated, StatusBar, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = "http://192.168.29.145:5000";
const { width } = Dimensions.get('window');

// Animated particle component
const Particle = ({ delay, size, startX, duration }) => {
  const yAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.8, duration: 500, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: duration - 500, useNativeDriver: true }),
          ]),
          Animated.timing(yAnim, { toValue: -200, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0, duration: duration - 300, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      bottom: 0,
      left: startX,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#FFE033',
      opacity: opacityAnim,
      transform: [{ translateY: yAnim }, { scale: scaleAnim }],
    }} />
  );
};

// Animated wave bars
const WaveBars = ({ isActive, color }) => {
  const bars = Array.from({ length: 12 }, (_, i) => {
    const heightAnim = useRef(new Animated.Value(4)).current;
    useEffect(() => {
      if (isActive) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(heightAnim, { toValue: 4 + Math.random() * 30, duration: 200 + Math.random() * 300, useNativeDriver: false }),
            Animated.timing(heightAnim, { toValue: 4, duration: 200 + Math.random() * 300, useNativeDriver: false }),
          ])
        ).start();
      } else {
        heightAnim.stopAnimation();
        Animated.timing(heightAnim, { toValue: 4, duration: 300, useNativeDriver: false }).start();
      }
    }, [isActive]);

    return (
      <Animated.View key={i} style={{
        width: 3,
        height: heightAnim,
        borderRadius: 2,
        backgroundColor: color,
        marginHorizontal: 2,
      }} />
    );
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}>
      {bars}
    </View>
  );
};

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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const isProtectingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Slow rotation
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 10000, useNativeDriver: true })
    ).start();

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isProtecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
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
      if (isProtectingRef.current) await recordAndAnalyze();
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
      if (!isProtectingRef.current) { await safeStopRecording(); setIsAnalyzing(false); return; }
      await safeStopRecording();
      const uri = recording.getURI();
      if (!uri) return;
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'auto.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 });
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

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  const stats = [
    { icon: <MaterialCommunityIcons name="robot-outline" size={22} color="#FFE033" />, val: '87%', label: 'Accuracy' },
    { icon: <Ionicons name="flash-outline" size={22} color="#FFE033" />, val: '3s', label: 'Speed' },
    { icon: <Ionicons name="language-outline" size={22} color="#FFE033" />, val: '10', label: 'Languages' },
    { icon: <Ionicons name="lock-closed-outline" size={22} color="#FFE033" />, val: '24/7', label: 'Protected' },
  ];

  const features = [
    { icon: <Ionicons name="ear-outline" size={24} color="#FF9500" />, title: 'Voice Keywords', desc: '10 Indian languages', color: '#FF9500', screen: 'screens/keywords' },
    { icon: <Ionicons name="people-outline" size={24} color="#5856D6" />, title: 'Crowd Safety', desc: 'Real-time analysis', color: '#5856D6', screen: 'screens/crowd' },
    { icon: <Ionicons name="mic-outline" size={24} color="#FF2D55" />, title: 'Stress Analysis', desc: 'Fear detection', color: '#FF2D55', screen: 'screens/stress' },
    { icon: <Ionicons name="camera-outline" size={24} color="#34C759" />, title: 'Evidence', desc: 'Secret camera', color: '#34C759', screen: 'screens/selfie' },
    { icon: <Ionicons name="calculator-outline" size={24} color="#007AFF" />, title: 'Disguise', desc: 'Calculator look', color: '#007AFF', screen: 'screens/disguise' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* Floating particles when protecting */}
      {isProtecting && (
        <View style={s.particlesContainer} pointerEvents="none">
          {[...Array(8)].map((_, i) => (
            <Particle
              key={i}
              delay={i * 400}
              size={4 + Math.random() * 6}
              startX={40 + i * 35}
              duration={2000 + Math.random() * 1000}
            />
          ))}
        </View>
      )}

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <Animated.View style={[s.logoCircle, { transform: [{ translateY: floatAnim }] }]}>
            <Ionicons name="shield" size={24} color="#111" />
          </Animated.View>
          <View>
            <Text style={s.logoText}>SafeShield</Text>
            <Text style={s.logoSub}>Your safety bestie 💛</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: isProtecting ? '#34C75922' : '#FF3B3022', borderColor: isProtecting ? '#34C759' : '#FF3B30' }]}>
          <Animated.View style={[s.statusDot, { backgroundColor: isProtecting ? '#34C759' : '#FF3B30', opacity: glowOpacity }]} />
          <Text style={[s.statusText, { color: isProtecting ? '#34C759' : '#FF3B30' }]}>{isProtecting ? 'ACTIVE' : 'OFF'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Hero Card */}
        <View style={[s.heroCard, isProtecting && s.heroCardActive]}>

          {/* Rotating ring behind orb */}
          <View style={s.orbContainer}>
            <Animated.View style={[s.rotatingRing, { transform: [{ rotate }] }]} />
            <Animated.View style={[s.rotatingRing2, { transform: [{ rotate: rotate }] }]} />

            <Animated.View style={[s.bigOrb, {
              transform: [{ scale: pulseAnim }],
              borderColor: isProtecting ? 'rgba(52,199,89,0.5)' : 'rgba(255,224,51,0.4)',
              backgroundColor: isProtecting ? 'rgba(52,199,89,0.1)' : 'rgba(255,224,51,0.1)',
            }]}>
              <View style={[s.bigOrbMiddle, { backgroundColor: isProtecting ? 'rgba(52,199,89,0.15)' : 'rgba(255,224,51,0.15)' }]}>
                <View style={[s.bigOrbInner, { backgroundColor: isProtecting ? 'rgba(52,199,89,0.3)' : 'rgba(255,224,51,0.3)' }]}>
                  {isAnalyzing
                    ? <ActivityIndicator size="large" color={isProtecting ? '#34C759' : '#FFE033'} />
                    : <Ionicons name={isProtecting ? "shield-checkmark" : "shield-outline"} size={38} color={isProtecting ? '#34C759' : '#FFE033'} />
                  }
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Wave animation when active */}
          {isProtecting && (
            <View style={s.waveContainer}>
              <WaveBars isActive={isAnalyzing} color={isAnalyzing ? '#FFE033' : '#34C759'} />
            </View>
          )}

          <Text style={s.heroTitle}>{isAnalyzing ? 'Analyzing...' : isProtecting ? 'Protecting You' : 'Protection Off'}</Text>
          <Text style={s.heroSub}>{isAnalyzing ? 'AI processing audio in real time' : isProtecting ? 'AI monitoring automatically every 8s' : 'Tap to start automatic AI protection'}</Text>

          {isProtecting && (
            <View style={s.alertCountRow}>
              <View style={s.alertCountCard}><Text style={s.alertCountVal}>{alertCount}</Text><Text style={s.alertCountLabel}>Alerts</Text></View>
              <View style={s.alertCountCard}><Text style={[s.alertCountVal, { color: '#34C759' }]}>AUTO</Text><Text style={s.alertCountLabel}>Mode</Text></View>
              <View style={s.alertCountCard}><Text style={[s.alertCountVal, { color: '#007AFF' }]}>8s</Text><Text style={s.alertCountLabel}>Interval</Text></View>
            </View>
          )}

          <TouchableOpacity
            style={[s.protectBtn, isProtecting ? s.protectBtnStop : s.protectBtnStart]}
            onPress={() => setIsProtecting(!isProtecting)}
            activeOpacity={0.85}
          >
            <Ionicons name={isProtecting ? "stop-circle-outline" : "shield-checkmark-outline"} size={22} color={isProtecting ? "#FF3B30" : "#111"} />
            <Text style={[s.protectBtnText, isProtecting && { color: '#FF3B30' }]}>{isProtecting ? 'Stop Protection' : 'Start Auto Protection'}</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <Animated.View style={[s.resultCard, result.is_distress ? s.resultDanger : s.resultSafe]}>
            <Ionicons name={result.is_distress ? "warning-outline" : "checkmark-circle-outline"} size={40} color={result.is_distress ? '#FF3B30' : '#34C759'} />
            <View style={s.resultInfo}>
              <Text style={[s.resultTitle, { color: result.is_distress ? '#FF3B30' : '#34C759' }]}>{result.is_distress ? 'DISTRESS DETECTED' : 'ALL CLEAR'}</Text>
              <Text style={s.resultSub}>{result.is_distress ? `${result.confidence.distress}% confidence` : `${result.confidence.normal}% normal`}</Text>
            </View>
          </Animated.View>
        )}

        {/* Activity Log */}
        {logs.length > 0 && (
          <View style={s.logCard}>
            <Text style={s.logTitle}>ACTIVITY LOG</Text>
            {logs.map((log, i) => (
              <View key={i} style={s.logRow}>
                <Animated.View style={[s.logDot, { backgroundColor: log.includes('ALERT') ? '#FF3B30' : '#34C759' }]} />
                <Text style={s.logText}>{log}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={s.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              {stat.icon}
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Protection Suite */}
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
  particlesContainer: { position:'absolute', bottom:200, left:0, right:0, height:200, zIndex:10 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#222' },
  logoRow: { flexDirection:'row', alignItems:'center', gap:12 },
  logoCircle: { width:44, height:44, borderRadius:22, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  logoText: { color:'white', fontSize:18, fontWeight:'900', letterSpacing:0.5 },
  logoSub: { color:'#666', fontSize:11 },
  statusBadge: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1.5 },
  statusDot: { width:7, height:7, borderRadius:4 },
  statusText: { fontSize:11, fontWeight:'800', letterSpacing:1 },
  scroll: { padding:16, paddingBottom:120 },
  heroCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:24, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E', overflow:'hidden' },
  heroCardActive: { borderColor:'#34C75944' },
  orbContainer: { alignItems:'center', justifyContent:'center', height:180, marginBottom:8 },
  rotatingRing: {
    position:'absolute',
    width:170, height:170, borderRadius:85,
    borderWidth:1, borderColor:'rgba(255,224,51,0.15)',
    borderStyle:'dashed',
  },
  rotatingRing2: {
    position:'absolute',
    width:140, height:140, borderRadius:70,
    borderWidth:1, borderColor:'rgba(255,224,51,0.1)',
    borderStyle:'dashed',
  },
  bigOrb: { width:130, height:130, borderRadius:65, justifyContent:'center', alignItems:'center', borderWidth:2 },
  bigOrbMiddle: { width:95, height:95, borderRadius:48, justifyContent:'center', alignItems:'center' },
  bigOrbInner: { width:68, height:68, borderRadius:34, justifyContent:'center', alignItems:'center' },
  waveContainer: { alignItems:'center', marginBottom:12 },
  heroTitle: { color:'white', fontSize:22, fontWeight:'900', marginBottom:6, textAlign:'center' },
  heroSub: { color:'#666', fontSize:13, textAlign:'center', lineHeight:20, marginBottom:16 },
  alertCountRow: { flexDirection:'row', gap:10, justifyContent:'center', marginBottom:16 },
  alertCountCard: { backgroundColor:'#111111', borderRadius:14, padding:12, alignItems:'center', minWidth:70 },
  alertCountVal: { color:'#FFE033', fontSize:18, fontWeight:'900' },
  alertCountLabel: { color:'#555', fontSize:10, marginTop:2 },
  protectBtn: { borderRadius:18, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10 },
  protectBtnStart: { backgroundColor:'#FFE033' },
  protectBtnStop: { backgroundColor:'#111111', borderWidth:2, borderColor:'#FF3B30' },
  protectBtnText: { color:'#111', fontSize:16, fontWeight:'800' },
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
  statCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:12, alignItems:'center', gap:5, borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { color:'#FFE033', fontSize:15, fontWeight:'900' },
  statLabel: { color:'#555', fontSize:9, textAlign:'center' },
  sectionTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:14 },
  featureScroll: { marginBottom:20 },
  featureCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:16, marginRight:12, width:145, borderWidth:1 },
  featureIconBox: { width:46, height:46, borderRadius:13, justifyContent:'center', alignItems:'center', marginBottom:10 },
  featureTitle: { color:'white', fontSize:13, fontWeight:'700', marginBottom:3 },
  featureSub: { color:'#555', fontSize:11, marginBottom:10 },
  featureArrow: { width:24, height:24, borderRadius:12, justifyContent:'center', alignItems:'center', alignSelf:'flex-end' },
});
