import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = 'http://192.168.29.145:5000';

export default function CrowdScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      radarAnim.stopAnimation(); radarAnim.setValue(0);
    }
  }, [isScanning]);

  const scan = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission Required', 'Allow microphone access.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsScanning(true);
      setResult(null);
      setCountdown(5);

      for (let i = 4; i >= 0; i--) {
        await new Promise(r => setTimeout(r, 1000));
        setCountdown(i);
      }

      setIsScanning(false);

      try { await recording.stopAndUnloadAsync(); } catch (e) {}
      const uri = recording.getURI();
      if (!uri) return;

      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'crowd.wav' } as any);

      const res = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000
      });

      const distress = res.data.confidence.distress;
      const safeScore = Math.round(100 - distress);
      let label, color, advice, icon;

      if (safeScore >= 75) {
        label = 'SAFE AREA'; color = '#34C759'; icon = 'shield-checkmark-outline';
        advice = 'Environment sounds calm and safe. No immediate threats detected.';
      } else if (safeScore >= 45) {
        label = 'MODERATE RISK'; color = '#FF9500'; icon = 'warning-outline';
        advice = 'Some concerning sounds detected. Stay alert and aware of surroundings.';
        Vibration.vibrate(200);
      } else {
        label = 'HIGH RISK'; color = '#FF3B30'; icon = 'alert-circle-outline';
        advice = 'Dangerous sounds detected! Move to a safer location immediately.';
        Vibration.vibrate([300, 100, 300]);
        Alert.alert('⚠️ UNSAFE AREA DETECTED!', 'High risk environment detected!\nMove to a safer location now!', [{ text: 'OK' }]);
      }

      setResult({ safeScore, distress, label, color, advice, icon });
    } catch (e) {
      setIsScanning(false);
      Alert.alert('Connection Error', 'Cannot reach SafeShield server.\nMake sure Flask server is running at:\n192.168.29.145:5000');
    }
  };

  const radarRotate = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Crowd Safety Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.radarCard}>
          {/* Radar rings */}
          {[130, 100, 70].map((size, i) => (
            <View key={i} style={[s.radarRing, { width: size, height: size, borderRadius: size/2, opacity: 0.2 + i*0.1, borderColor: isScanning ? '#5856D6' : '#FFE033' }]} />
          ))}

          {/* Rotating radar line */}
          {isScanning && (
            <Animated.View style={[s.radarLine, { transform: [{ rotate: radarRotate }] }]} />
          )}

          <Animated.View style={[s.radarCenter, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name={isScanning ? 'radio-outline' : 'people-outline'} size={36} color={isScanning ? '#5856D6' : '#FFE033'} />
          </Animated.View>

          <Text style={[s.radarStatus, { color: isScanning ? '#5856D6' : '#FFE033' }]}>
            {isScanning ? `Scanning... ${countdown}s` : 'Ready to Scan'}
          </Text>
          <Text style={s.radarSub}>
            {isScanning ? 'AI analyzing surrounding sounds...' : 'Analyzes 5 seconds of ambient audio'}
          </Text>
        </View>

        {!isScanning && (
          <TouchableOpacity style={s.scanBtn} onPress={scan} activeOpacity={0.85}>
            <Ionicons name="scan-outline" size={22} color="#111" />
            <Text style={s.scanBtnText}>Start Safety Scan</Text>
          </TouchableOpacity>
        )}

        {isScanning && (
          <View style={s.scanningRow}>
            <Ionicons name="radio-outline" size={18} color="#5856D6" />
            <Text style={s.scanningText}>Scanning environment...</Text>
          </View>
        )}

        {result && (
          <View style={[s.resultCard, { borderColor: result.color + '44' }]}>
            <Ionicons name={result.icon as any} size={52} color={result.color} />
            <Text style={[s.resultLabel, { color: result.color }]}>{result.label}</Text>

            {/* Score gauge */}
            <View style={s.gaugeContainer}>
              <Text style={s.gaugeLabel}>Safety Score</Text>
              <View style={s.gaugeTrack}>
                <View style={[s.gaugeFill, { width: `${result.safeScore}%`, backgroundColor: result.color }]} />
              </View>
              <Text style={[s.gaugeScore, { color: result.color }]}>{result.safeScore}/100</Text>
            </View>

            <Text style={s.resultAdvice}>{result.advice}</Text>

            <View style={s.resultStats}>
              <View style={s.resultStat}>
                <Text style={[s.resultStatVal, { color: '#34C759' }]}>{result.safeScore}%</Text>
                <Text style={s.resultStatLabel}>Safe Score</Text>
              </View>
              <View style={s.resultStat}>
                <Text style={[s.resultStatVal, { color: '#FF3B30' }]}>{result.distress}%</Text>
                <Text style={s.resultStatLabel}>Risk Score</Text>
              </View>
            </View>

            <TouchableOpacity style={s.rescanBtn} onPress={scan} activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={18} color="#5856D6" />
              <Text style={s.rescanBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>SAFETY TIPS</Text>
          {['Stay in well-lit and crowded areas', 'Trust your instincts if something feels wrong', 'Keep emergency contacts on speed dial', 'Share your location with trusted contacts'].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFE033" />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

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
  radarCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:28, marginBottom:16, alignItems:'center', borderWidth:1, borderColor:'#2C2C2E', minHeight:280 },
  radarRing: { position:'absolute', borderWidth:1 },
  radarLine: { position:'absolute', width:2, height:65, backgroundColor:'rgba(88,86,214,0.6)', bottom:'50%', left:'50%', transformOrigin:'bottom' },
  radarCenter: { width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,224,51,0.15)', justifyContent:'center', alignItems:'center', marginBottom:16 },
  radarStatus: { fontSize:18, fontWeight:'800', marginBottom:6 },
  radarSub: { color:'#555', fontSize:12, textAlign:'center' },
  scanBtn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 },
  scanBtnText: { color:'#111', fontSize:16, fontWeight:'800' },
  scanningRow: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, padding:16 },
  scanningText: { color:'#5856D6', fontSize:14, fontWeight:'600' },
  resultCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, alignItems:'center', borderWidth:1.5 },
  resultLabel: { fontSize:22, fontWeight:'900', letterSpacing:1, marginTop:8, marginBottom:16 },
  gaugeContainer: { width:'100%', marginBottom:16 },
  gaugeLabel: { color:'#666', fontSize:11, marginBottom:6 },
  gaugeTrack: { height:12, backgroundColor:'#111111', borderRadius:6, overflow:'hidden', marginBottom:4 },
  gaugeFill: { height:'100%', borderRadius:6 },
  gaugeScore: { fontSize:14, fontWeight:'700', textAlign:'right' },
  resultAdvice: { color:'#aaa', fontSize:13, textAlign:'center', lineHeight:20, marginBottom:16 },
  resultStats: { flexDirection:'row', gap:20, marginBottom:16 },
  resultStat: { alignItems:'center' },
  resultStatVal: { fontSize:24, fontWeight:'900' },
  resultStatLabel: { color:'#555', fontSize:10, marginTop:2 },
  rescanBtn: { flexDirection:'row', alignItems:'center', gap:8, padding:12, backgroundColor:'#111111', borderRadius:12, borderWidth:1, borderColor:'#5856D644' },
  rescanBtnText: { color:'#5856D6', fontSize:14, fontWeight:'700' },
  tipsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1, borderColor:'#2C2C2E' },
  tipsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  tipRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  tipText: { color:'#888', fontSize:13, flex:1 },
});
