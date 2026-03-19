import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

export default function StressScreen() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stressLevel, setStressLevel] = useState(null);
  const [history, setHistory] = useState([]);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing]);

  const analyzeStress = async () => {
    try {
      setIsAnalyzing(true);
      setStressLevel(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission Required', 'Allow microphone access.'); setIsAnalyzing(false); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      await new Promise(r => setTimeout(r, 5000));
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'stress.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000 });
      const data = response.data;
      const score = data.confidence.distress;
      let level, color, desc;
      if (score >= 70) { level = 'HIGH STRESS'; color = '#FF3B30'; desc = 'High stress/fear detected in voice. Are you okay?'; }
      else if (score >= 40) { level = 'MODERATE'; color = '#FFE033'; desc = 'Some stress detected. Stay calm and breathe.'; }
      else { level = 'CALM'; color = '#34C759'; desc = 'Voice sounds calm and normal. You are safe!'; }
      const result = { level, color, desc, score, time: new Date().toLocaleTimeString() };
      setStressLevel(result);
      setHistory(prev => [result, ...prev.slice(0, 4)]);
      Animated.timing(barAnim, { toValue: score / 100, duration: 1000, useNativeDriver: false }).start();
      if (score >= 70) {
        Alert.alert('High Stress Detected', 'Your voice indicates high stress or fear. Do you need help?', [
          { text: 'I am OK', style: 'cancel' },
          { text: 'Send SOS', style: 'destructive', onPress: () => Alert.alert('SOS Sent!', 'Emergency contacts notified!') }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not analyze voice stress.');
    } finally { setIsAnalyzing(false); }
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
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.mainCard}>
          <Animated.View style={[s.orb, { transform: [{ scale: pulseAnim }], borderColor: stressLevel ? stressLevel.color + '66' : 'rgba(255,224,51,0.3)' }]}>
            <View style={[s.orbInner, { backgroundColor: stressLevel ? stressLevel.color + '22' : 'rgba(255,224,51,0.2)' }]}>
              <Ionicons name={isAnalyzing ? "mic" : stressLevel ? (stressLevel.score >= 70 ? "warning-outline" : stressLevel.score >= 40 ? "alert-circle-outline" : "checkmark-circle-outline") : "mic-outline"} size={40} color={stressLevel ? stressLevel.color : "#FFE033"} />
            </View>
          </Animated.View>

          {isAnalyzing && (
            <>
              <Text style={s.analyzingTitle}>Analyzing Voice...</Text>
              <Text style={s.analyzingSubt}>Speak naturally for 5 seconds</Text>
            </>
          )}

          {!isAnalyzing && stressLevel && (
            <>
              <Text style={[s.stressLevel, { color: stressLevel.color }]}>{stressLevel.level}</Text>
              <Text style={s.stressScore}>{stressLevel.score.toFixed(1)}% stress indicators</Text>
              <Text style={s.stressDesc}>{stressLevel.desc}</Text>
              <View style={s.barBg}>
                <Animated.View style={[s.barFill, { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: stressLevel.color }]} />
              </View>
            </>
          )}

          {!isAnalyzing && !stressLevel && (
            <>
              <Text style={s.idleTitle}>Ready to Analyze</Text>
              <Text style={s.idleSub}>Tap below and speak for 5 seconds</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={[s.btn, isAnalyzing && s.btnDisabled]} onPress={analyzeStress} disabled={isAnalyzing} activeOpacity={0.8}>
          <Ionicons name="mic-outline" size={22} color={isAnalyzing ? '#666' : '#111'} />
          <Text style={[s.btnText, isAnalyzing && { color: '#666' }]}>{isAnalyzing ? 'Analyzing... (5s)' : 'Analyze Voice Stress'}</Text>
        </TouchableOpacity>

        <View style={s.guideCard}>
          <Text style={s.guideTitle}>STRESS LEVELS</Text>
          {[
            { level: 'CALM', range: '0-39%', color: '#34C759', desc: 'Normal voice, no stress detected', icon: 'checkmark-circle-outline' },
            { level: 'MODERATE', range: '40-69%', color: '#FFE033', desc: 'Some stress or anxiety detected', icon: 'alert-circle-outline' },
            { level: 'HIGH STRESS', range: '70-100%', color: '#FF3B30', desc: 'High fear or distress detected', icon: 'warning-outline' },
          ].map((item, i) => (
            <View key={i} style={s.guideRow}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <View style={s.guideInfo}>
                <Text style={[s.guideLevel, { color: item.color }]}>{item.level}</Text>
                <Text style={s.guideDesc}>{item.desc}</Text>
              </View>
              <Text style={[s.guideRange, { color: item.color }]}>{item.range}</Text>
            </View>
          ))}
        </View>

        {history.length > 0 && (
          <View style={s.historyCard}>
            <Text style={s.historyTitle}>HISTORY</Text>
            {history.map((item, i) => (
              <View key={i} style={s.historyRow}>
                <Ionicons name={item.score >= 70 ? "warning-outline" : item.score >= 40 ? "alert-circle-outline" : "checkmark-circle-outline"} size={24} color={item.color} />
                <View style={s.historyInfo}>
                  <Text style={[s.historyLevel, { color: item.color }]}>{item.level}</Text>
                  <Text style={s.historyTime}>{item.time}</Text>
                </View>
                <Text style={[s.historyScore, { color: item.color }]}>{item.score.toFixed(0)}%</Text>
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
  mainCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  orb: { width:130, height:130, borderRadius:65, backgroundColor:'rgba(255,224,51,0.1)', justifyContent:'center', alignItems:'center', borderWidth:2, marginBottom:20 },
  orbInner: { width:90, height:90, borderRadius:45, justifyContent:'center', alignItems:'center' },
  analyzingTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:6 },
  analyzingSubt: { color:'#555', fontSize:13 },
  stressLevel: { fontSize:22, fontWeight:'900', letterSpacing:1, marginBottom:6 },
  stressScore: { color:'#888', fontSize:14, marginBottom:8 },
  stressDesc: { color:'#666', fontSize:13, textAlign:'center', marginBottom:16 },
  barBg: { width:'100%', height:8, backgroundColor:'#111111', borderRadius:6, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:6 },
  idleTitle: { color:'white', fontSize:18, fontWeight:'700', marginBottom:6 },
  idleSub: { color:'#555', fontSize:13 },
  btn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  btnDisabled: { backgroundColor:'#1C1C1E', borderWidth:1, borderColor:'#333' },
  btnText: { color:'#111', fontSize:17, fontWeight:'800' },
  guideCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  guideTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  guideRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  guideInfo: { flex:1 },
  guideLevel: { fontSize:13, fontWeight:'700' },
  guideDesc: { color:'#555', fontSize:12, marginTop:2 },
  guideRange: { fontSize:13, fontWeight:'700' },
  historyCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  historyTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  historyRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  historyInfo: { flex:1 },
  historyLevel: { fontSize:14, fontWeight:'700' },
  historyTime: { color:'#555', fontSize:12, marginTop:2 },
  historyScore: { fontSize:18, fontWeight:'800' },
});
