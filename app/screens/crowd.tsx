import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

export default function CrowdScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [safetyScore, setSafetyScore] = useState(null);
  const [history, setHistory] = useState([]);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setSafetyScore(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission Required', 'Allow microphone access.'); setIsScanning(false); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      await new Promise(r => setTimeout(r, 5000));
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'crowd.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 15000 });
      const data = response.data;
      const score = Math.round(100 - data.confidence.distress);
      let zone, color, desc;
      if (score >= 70) { zone = 'SAFE ZONE'; color = '#34C759'; desc = 'Your surroundings sound safe'; }
      else if (score >= 40) { zone = 'CAUTION ZONE'; color = '#FFE033'; desc = 'Some unusual sounds detected'; }
      else { zone = 'DANGER ZONE'; color = '#FF3B30'; desc = 'High distress level detected!'; }
      const result = { score, zone, color, desc, time: new Date().toLocaleTimeString() };
      setSafetyScore(result);
      setHistory(prev => [result, ...prev.slice(0, 4)]);
      if (score < 40) Alert.alert('Danger Zone!', 'High distress sounds detected. Move to a safer location!', [{ text: 'OK' }]);
    } catch (e) {
      Alert.alert('Error', 'Could not analyze surroundings.');
    } finally { setIsScanning(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Crowd Safety Score</Text>
        <Text style={s.headerSub}>AI analyzes your surroundings in real time</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.mainCard}>
          <Animated.View style={[s.scoreOrb, { transform: [{ scale: pulseAnim }], borderColor: safetyScore ? safetyScore.color + '66' : '#FFE03344' }]}>
            <View style={s.scoreOrbInner}>
              {isScanning ? (
                <>
                  <Ionicons name="radio-outline" size={40} color="#FFE033" />
                  <Text style={s.scanningLabel}>Scanning...</Text>
                </>
              ) : safetyScore ? (
                <>
                  <Ionicons name={safetyScore.score >= 70 ? 'checkmark-circle-outline' : safetyScore.score >= 40 ? 'warning-outline' : 'alert-circle-outline'} size={36} color={safetyScore.color} />
                  <Text style={[s.scoreNumber, { color: safetyScore.color }]}>{safetyScore.score}</Text>
                  <Text style={s.scoreMax}>/ 100</Text>
                </>
              ) : (
                <>
                  <Ionicons name="help-circle-outline" size={40} color="#444" />
                  <Text style={s.scoreUnknown}>--</Text>
                  <Text style={s.scoreMax}>/ 100</Text>
                </>
              )}
            </View>
          </Animated.View>
          <Text style={[s.zoneText, { color: safetyScore ? safetyScore.color : '#555' }]}>
            {isScanning ? 'ANALYZING...' : safetyScore ? safetyScore.zone : 'UNKNOWN'}
          </Text>
          <Text style={s.zoneDesc}>{isScanning ? 'Listening for 5 seconds' : safetyScore ? safetyScore.desc : 'Start scan to analyze safety'}</Text>
        </View>

        <TouchableOpacity style={[s.btn, isScanning && s.btnDisabled]} onPress={startScan} disabled={isScanning} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={22} color={isScanning ? '#666' : '#111'} />
          <Text style={[s.btnText, isScanning && { color: '#666' }]}>{isScanning ? 'Scanning... (5s)' : 'Start Safety Scan'}</Text>
        </TouchableOpacity>

        <View style={s.zonesCard}>
          <Text style={s.zonesTitle}>SAFETY ZONES</Text>
          {[
            { zone: 'Safe Zone', range: '70-100', color: '#34C759', desc: 'Normal surroundings, low risk' },
            { zone: 'Caution Zone', range: '40-69', color: '#FFE033', desc: 'Some unusual sounds detected' },
            { zone: 'Danger Zone', range: '0-39', color: '#FF3B30', desc: 'High distress level detected!' },
          ].map((item, i) => (
            <View key={i} style={s.zoneRow}>
              <View style={[s.zoneLine, { backgroundColor: item.color }]} />
              <View style={s.zoneInfo}>
                <Text style={[s.zoneName, { color: item.color }]}>{item.zone}</Text>
                <Text style={s.zoneDescText}>{item.desc}</Text>
              </View>
              <Text style={[s.zoneRange, { color: item.color }]}>{item.range}</Text>
            </View>
          ))}
        </View>

        {history.length > 0 && (
          <View style={s.historyCard}>
            <Text style={s.historyTitle}>SCAN HISTORY</Text>
            {history.map((item, i) => (
              <View key={i} style={s.historyRow}>
                <Ionicons name={item.score >= 70 ? 'checkmark-circle-outline' : item.score >= 40 ? 'warning-outline' : 'alert-circle-outline'} size={24} color={item.color} />
                <View style={s.historyInfo}>
                  <Text style={[s.historyZone, { color: item.color }]}>{item.zone}</Text>
                  <Text style={s.historyTime}>{item.time}</Text>
                </View>
                <Text style={[s.historyScore, { color: item.color }]}>{item.score}</Text>
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
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#222' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'900' },
  headerSub: { color:'#555', fontSize:13, marginTop:4 },
  scroll: { padding:20, paddingBottom:120 },
  mainCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  scoreOrb: { width:160, height:160, borderRadius:80, backgroundColor:'rgba(255,224,51,0.05)', justifyContent:'center', alignItems:'center', borderWidth:2, marginBottom:16 },
  scoreOrbInner: { alignItems:'center' },
  scanningLabel: { color:'#FFE033', fontSize:13, fontWeight:'700', marginTop:8 },
  scoreNumber: { fontSize:52, fontWeight:'900' },
  scoreMax: { color:'#555', fontSize:14 },
  scoreUnknown: { color:'#444', fontSize:52, fontWeight:'900' },
  zoneText: { fontSize:18, fontWeight:'900', letterSpacing:1, marginBottom:6 },
  zoneDesc: { color:'#555', fontSize:13, textAlign:'center' },
  btn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  btnDisabled: { backgroundColor:'#1C1C1E', borderWidth:1, borderColor:'#333' },
  btnText: { color:'#111', fontSize:17, fontWeight:'800' },
  zonesCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  zonesTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  zoneRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  zoneLine: { width:4, height:44, borderRadius:2 },
  zoneInfo: { flex:1 },
  zoneName: { fontSize:14, fontWeight:'800' },
  zoneDescText: { color:'#555', fontSize:12, marginTop:2 },
  zoneRange: { fontSize:16, fontWeight:'900' },
  historyCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  historyTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  historyRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  historyInfo: { flex:1 },
  historyZone: { fontSize:13, fontWeight:'700' },
  historyTime: { color:'#555', fontSize:12, marginTop:2 },
  historyScore: { fontSize:22, fontWeight:'900' },
});
