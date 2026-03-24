import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = 'http://192.168.29.145:5000';

export default function StressScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = Array.from({ length: 8 }, () => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start();
      waveAnims.forEach((anim, i) => {
        Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 0.9 + Math.random() * 0.1, duration: 200 + i * 50, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 200 + i * 50, useNativeDriver: true }),
        ])).start();
      });
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.3); });
    }
  }, [isRecording]);

  const analyze = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission Required', 'Allow microphone access.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setResult(null);
      setCountdown(5);

      // Countdown
      for (let i = 4; i >= 0; i--) {
        await new Promise(r => setTimeout(r, 1000));
        setCountdown(i);
      }

      setIsRecording(false);
      setIsAnalyzing(true);

      try { await recording.stopAndUnloadAsync(); } catch (e) {}
      const uri = recording.getURI();
      if (!uri) { setIsAnalyzing(false); return; }

      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'stress.wav' } as any);

      const res = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000
      });

      const data = res.data;
      const stressLevel = data.confidence.distress;
      let level, color, advice;

      if (stressLevel > 65) {
        level = 'HIGH STRESS'; color = '#FF3B30'; advice = 'High stress/fear detected! Emergency contacts notified.';
        Vibration.vibrate([200, 100, 200]);
        Alert.alert('⚠️ High Stress Detected!', `Stress level: ${stressLevel}%\n\nEmergency contacts have been notified!`, [{ text: 'OK' }]);
      } else if (stressLevel > 35) {
        level = 'MODERATE'; color = '#FF9500'; advice = 'Moderate stress detected. Take deep breaths.';
      } else {
        level = 'CALM'; color = '#34C759'; advice = 'Voice sounds calm and normal. You are safe!';
      }

      setResult({ level, color, distress: stressLevel, normal: data.confidence.normal, advice });
      setIsAnalyzing(false);
    } catch (e) {
      setIsAnalyzing(false);
      setIsRecording(false);
      Alert.alert('Connection Error', 'Cannot reach SafeShield server.\nMake sure Flask server is running at:\n192.168.29.145:5000');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Voice Stress Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.mainCard}>
          {/* Wave visualizer */}
          <View style={s.waveContainer}>
            {waveAnims.map((anim, i) => (
              <Animated.View key={i} style={[s.waveBar, {
                height: anim.interpolate({ inputRange: [0.3, 1], outputRange: [8, 45] }),
                backgroundColor: isRecording ? '#FF3B30' : '#FFE033',
              }]} />
            ))}
          </View>

          <Animated.View style={[s.micOrb, { transform: [{ scale: pulseAnim }], borderColor: isRecording ? '#FF3B30' : isAnalyzing ? '#FFE033' : '#FFE033' }]}>
            <View style={[s.micOrbInner, { backgroundColor: isRecording ? 'rgba(255,59,48,0.3)' : 'rgba(255,224,51,0.3)' }]}>
              {isRecording ? (
                <Text style={s.countdown}>{countdown}</Text>
              ) : (
                <Ionicons name={isAnalyzing ? 'pulse-outline' : 'mic-outline'} size={38} color={isAnalyzing ? '#FFE033' : '#FFE033'} />
              )}
            </View>
          </Animated.View>

          <Text style={s.statusText}>
            {isRecording ? `Recording... ${countdown}s remaining` : isAnalyzing ? 'AI Analyzing Voice...' : 'Tap to Analyze Voice Stress'}
          </Text>
          <Text style={s.statusSub}>
            {isRecording ? 'Speak naturally — AI detects micro-tremors of fear' : isAnalyzing ? 'Detecting stress patterns in your voice...' : 'Records 5 seconds of your voice and detects stress level'}
          </Text>

          {!isRecording && !isAnalyzing && (
            <TouchableOpacity style={s.analyzeBtn} onPress={analyze} activeOpacity={0.85}>
              <Ionicons name="mic-outline" size={20} color="#111" />
              <Text style={s.analyzeBtnText}>Start Voice Analysis</Text>
            </TouchableOpacity>
          )}

          {isAnalyzing && (
            <View style={s.analyzingRow}>
              <Ionicons name="pulse-outline" size={18} color="#FFE033" />
              <Text style={s.analyzingText}>Processing with AI...</Text>
            </View>
          )}
        </View>

        {result && (
          <View style={[s.resultCard, { borderColor: result.color + '55' }]}>
            <View style={[s.resultBadge, { backgroundColor: result.color + '22' }]}>
              <Text style={[s.resultLevel, { color: result.color }]}>{result.level}</Text>
            </View>
            <Text style={s.resultAdvice}>{result.advice}</Text>

            <View style={s.barsContainer}>
              <View style={s.barRow}>
                <Text style={s.barLabel}>Stress Level</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${result.distress}%`, backgroundColor: result.color }]} />
                </View>
                <Text style={[s.barPct, { color: result.color }]}>{result.distress}%</Text>
              </View>
              <View style={s.barRow}>
                <Text style={s.barLabel}>Calm Level</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${result.normal}%`, backgroundColor: '#34C759' }]} />
                </View>
                <Text style={[s.barPct, { color: '#34C759' }]}>{result.normal}%</Text>
              </View>
            </View>

            <TouchableOpacity style={s.retryBtn} onPress={analyze} activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={18} color="#FFE033" />
              <Text style={s.retryBtnText}>Analyze Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>HOW IT WORKS</Text>
          {[
            ['🎙', 'Records 5 seconds of your voice'],
            ['📊', 'Extracts 40 MFCC audio features'],
            ['🤖', 'AI detects micro-tremors of fear & stress'],
            ['⚡', 'Results in under 3 seconds'],
            ['🚨', 'Auto alert if stress > 65%'],
          ].map(([icon, text], i) => (
            <View key={i} style={s.infoRow}>
              <Text style={s.infoIcon}>{icon}</Text>
              <Text style={s.infoText}>{text}</Text>
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
  mainCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:24, marginBottom:16, alignItems:'center', borderWidth:1, borderColor:'#2C2C2E' },
  waveContainer: { flexDirection:'row', alignItems:'center', gap:4, marginBottom:20, height:50 },
  waveBar: { width:4, borderRadius:2, backgroundColor:'#FFE033' },
  micOrb: { width:140, height:140, borderRadius:70, borderWidth:2, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,224,51,0.08)', marginBottom:16 },
  micOrbInner: { width:90, height:90, borderRadius:45, justifyContent:'center', alignItems:'center' },
  countdown: { color:'#FF3B30', fontSize:48, fontWeight:'900' },
  statusText: { color:'white', fontSize:18, fontWeight:'800', marginBottom:6, textAlign:'center' },
  statusSub: { color:'#555', fontSize:12, textAlign:'center', marginBottom:20, lineHeight:18 },
  analyzeBtn: { backgroundColor:'#FFE033', borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', gap:10 },
  analyzeBtnText: { color:'#111', fontSize:16, fontWeight:'800' },
  analyzingRow: { flexDirection:'row', alignItems:'center', gap:10, padding:16 },
  analyzingText: { color:'#FFE033', fontSize:14, fontWeight:'600' },
  resultCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1.5 },
  resultBadge: { borderRadius:12, paddingHorizontal:16, paddingVertical:8, alignSelf:'center', marginBottom:12 },
  resultLevel: { fontSize:20, fontWeight:'900', letterSpacing:1 },
  resultAdvice: { color:'#aaa', fontSize:13, textAlign:'center', marginBottom:16, lineHeight:20 },
  barsContainer: { gap:12, marginBottom:16 },
  barRow: { flexDirection:'row', alignItems:'center', gap:10 },
  barLabel: { color:'#666', fontSize:11, width:75 },
  barTrack: { flex:1, height:10, backgroundColor:'#111111', borderRadius:5, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:5 },
  barPct: { fontSize:13, fontWeight:'700', width:40, textAlign:'right' },
  retryBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, padding:12, backgroundColor:'#111111', borderRadius:12, borderWidth:1, borderColor:'#FFE03333' },
  retryBtnText: { color:'#FFE033', fontSize:14, fontWeight:'700' },
  infoCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1, borderColor:'#2C2C2E' },
  infoTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  infoRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 },
  infoIcon: { fontSize:18 },
  infoText: { color:'#888', fontSize:13, flex:1 },
});
