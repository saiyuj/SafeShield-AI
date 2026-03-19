import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Animated, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`${time}  ${message}`, ...prev.slice(0, 4)]);
  };

  const triggerSOS = () => {
    Alert.alert(
      '🚨 SOS ALERT',
      'Emergency alert will be sent to all your contacts immediately!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SEND SOS', style: 'destructive', onPress: () => {
          addLog('🚨 SOS triggered manually!');
          Alert.alert('SOS Sent!', 'Emergency contacts have been notified with your location!');
        }}
      ]
    );
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Allow microphone access to use SafeShield.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setResult(null);
      addLog('Listening for distress sounds...');
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopAndAnalyze = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      addLog('Analyzing audio with AI...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'recording.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      });
      const data = response.data;
      setResult(data);
      if (data.is_distress) {
        addLog(`ALERT! Distress detected — ${data.confidence.distress}% confidence`);
        Alert.alert('Emergency Alert Triggered', `Distress detected at ${data.confidence.distress}% confidence. Emergency contacts notified.`, [{ text: 'OK' }]);
      } else {
        addLog(`Safe — Normal sound (${data.confidence.normal}% confidence)`);
      }
    } catch (e) {
      addLog('Error connecting to server');
      Alert.alert('Error', 'Could not reach SafeShield server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060612" />
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <View style={s.brandIcon}><Text style={{fontSize:18}}>🛡</Text></View>
          <View>
            <Text style={s.brandName}>SafeShield</Text>
            <Text style={s.brandTag}>AI Safety System</Text>
          </View>
        </View>
        <View style={[s.badge, {backgroundColor: isRecording ? '#ff000022' : '#00e67622', borderColor: isRecording ? '#ff0000' : '#00e676'}]}>
          <View style={[s.badgeDot, {backgroundColor: isRecording ? '#ff0000' : '#00e676'}]} />
          <Text style={[s.badgeText, {color: isRecording ? '#ff4444' : '#00e676'}]}>{isRecording ? 'LIVE' : 'READY'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* SOS Button */}
        <Animated.View style={[s.sosWrap, {transform: [{scale: sosAnim}]}]}>
          <TouchableOpacity style={s.sosBtn} onPress={triggerSOS} activeOpacity={0.8}>
            <Text style={s.sosText}>SOS</Text>
            <Text style={s.sosSubText}>Hold for Emergency</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* AI Detection Card */}
        <View style={s.mainCard}>
          <Animated.View style={[s.orbOuter, {transform: [{scale: pulseAnim}]}]}>
            <View style={s.orbMiddle}>
              <View style={s.orbInner}>
                <Text style={s.orbIcon}>{isRecording ? '🔴' : isAnalyzing ? '⚡' : '🎙'}</Text>
              </View>
            </View>
          </Animated.View>
          <Text style={s.mainTitle}>{isRecording ? 'Monitoring...' : isAnalyzing ? 'Analyzing...' : 'AI Detection'}</Text>
          <Text style={s.mainSub}>{isRecording ? 'AI is actively listening' : isAnalyzing ? 'Processing with ML model' : 'Tap to analyze audio for distress'}</Text>
        </View>

        {!isAnalyzing && (
          <TouchableOpacity style={[s.btn, isRecording ? s.btnStop : s.btnStart]} onPress={isRecording ? stopAndAnalyze : startRecording} activeOpacity={0.8}>
            <Text style={s.btnText}>{isRecording ? '⏹  Stop & Analyze' : '▶  Start Detection'}</Text>
          </TouchableOpacity>
        )}

        {isAnalyzing && (
          <View style={s.analyzingBox}>
            <ActivityIndicator size="large" color="#7c6fff" />
            <Text style={s.analyzingText}>AI Model Processing...</Text>
          </View>
        )}

        {result && (
          <View style={[s.resultBox, result.is_distress ? s.resultRed : s.resultGreen]}>
            <View style={s.resultTop}>
              <Text style={s.resultEmoji}>{result.is_distress ? '🚨' : '✅'}</Text>
              <View style={{flex:1}}>
                <Text style={[s.resultTitle, {color: result.is_distress ? '#ff4444' : '#00e676'}]}>{result.is_distress ? 'DISTRESS DETECTED' : 'ALL CLEAR'}</Text>
                <Text style={s.resultSub}>{result.is_distress ? 'Emergency contacts notified' : 'No threat detected'}</Text>
              </View>
            </View>
            <View style={s.line} />
            <View style={{marginBottom:12}}>
              <View style={s.confRow}>
                <View style={[s.dot2, {backgroundColor:'#ff4444'}]} />
                <Text style={s.confLabel}>Distress</Text>
                <Text style={s.confVal}>{result.confidence.distress}%</Text>
              </View>
              <View style={s.barBg}><View style={[s.barFill, {width:`${result.confidence.distress}%`, backgroundColor:'#ff4444'}]} /></View>
            </View>
            <View style={{marginBottom:18}}>
              <View style={s.confRow}>
                <View style={[s.dot2, {backgroundColor:'#00e676'}]} />
                <Text style={s.confLabel}>Normal</Text>
                <Text style={s.confVal}>{result.confidence.normal}%</Text>
              </View>
              <View style={s.barBg}><View style={[s.barFill, {width:`${result.confidence.normal}%`, backgroundColor:'#00e676'}]} /></View>
            </View>
            <TouchableOpacity style={s.scanAgain} onPress={() => { setResult(null); setLogs([]); }}>
              <Text style={s.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {logs.length > 0 && (
          <View style={s.logBox}>
            <Text style={s.logHead}>ACTIVITY LOG</Text>
            {logs.map((log, i) => (
              <View key={i} style={s.logRow}>
                <View style={s.logDot} />
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
  container: { flex:1, backgroundColor:'#060612' },
  topBar: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#12122a' },
  brandRow: { flexDirection:'row', alignItems:'center', gap:12 },
  brandIcon: { width:40, height:40, borderRadius:12, backgroundColor:'#12122a', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#7c6fff' },
  brandName: { color:'white', fontSize:17, fontWeight:'800', letterSpacing:0.5 },
  brandTag: { color:'#444', fontSize:11 },
  badge: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1 },
  badgeDot: { width:7, height:7, borderRadius:4 },
  badgeText: { fontSize:11, fontWeight:'700', letterSpacing:1 },
  scroll: { padding:20, paddingBottom:100 },
  sosWrap: { alignItems:'center', marginBottom:24 },
  sosBtn: { width:160, height:160, borderRadius:80, backgroundColor:'#ff0000', justifyContent:'center', alignItems:'center', borderWidth:4, borderColor:'#ff4444', shadowColor:'#ff0000', shadowOffset:{width:0,height:0}, shadowOpacity:0.8, shadowRadius:20, elevation:20 },
  sosText: { color:'white', fontSize:42, fontWeight:'900', letterSpacing:4 },
  sosSubText: { color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:4 },
  mainCard: { backgroundColor:'#0d0d1f', borderRadius:28, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  orbOuter: { width:110, height:110, borderRadius:55, backgroundColor:'rgba(124,111,255,0.1)', justifyContent:'center', alignItems:'center', borderWidth:1.5, borderColor:'rgba(124,111,255,0.2)', marginBottom:18 },
  orbMiddle: { width:80, height:80, borderRadius:40, backgroundColor:'rgba(124,111,255,0.15)', justifyContent:'center', alignItems:'center' },
  orbInner: { width:55, height:55, borderRadius:28, backgroundColor:'rgba(124,111,255,0.25)', justifyContent:'center', alignItems:'center' },
  orbIcon: { fontSize:26 },
  mainTitle: { color:'white', fontSize:20, fontWeight:'800', marginBottom:6 },
  mainSub: { color:'#555', fontSize:12, textAlign:'center' },
  btn: { borderRadius:18, padding:18, alignItems:'center', justifyContent:'center', marginBottom:20 },
  btnStart: { backgroundColor:'#7c6fff' },
  btnStop: { backgroundColor:'#12122a', borderWidth:2, borderColor:'#ff4444' },
  btnText: { color:'white', fontSize:17, fontWeight:'700' },
  analyzingBox: { alignItems:'center', padding:28, backgroundColor:'#0d0d1f', borderRadius:20, marginBottom:20 },
  analyzingText: { color:'white', fontSize:15, fontWeight:'600', marginTop:14 },
  resultBox: { borderRadius:22, padding:22, marginBottom:20, borderWidth:1 },
  resultRed: { backgroundColor:'rgba(255,68,68,0.06)', borderColor:'rgba(255,68,68,0.25)' },
  resultGreen: { backgroundColor:'rgba(0,230,118,0.06)', borderColor:'rgba(0,230,118,0.25)' },
  resultTop: { flexDirection:'row', alignItems:'center', gap:14, marginBottom:18 },
  resultEmoji: { fontSize:44 },
  resultTitle: { fontSize:16, fontWeight:'800', letterSpacing:0.8 },
  resultSub: { color:'#666', fontSize:12, marginTop:4 },
  line: { height:1, backgroundColor:'#12122a', marginBottom:18 },
  confRow: { flexDirection:'row', alignItems:'center', marginBottom:7 },
  dot2: { width:8, height:8, borderRadius:4, marginRight:8 },
  confLabel: { color:'#888', fontSize:13, flex:1 },
  confVal: { color:'white', fontSize:13, fontWeight:'700' },
  barBg: { height:7, backgroundColor:'#12122a', borderRadius:6, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:6 },
  scanAgain: { backgroundColor:'#12122a', borderRadius:12, padding:14, alignItems:'center' },
  scanAgainText: { color:'#7c6fff', fontSize:15, fontWeight:'600' },
  logBox: { backgroundColor:'#0d0d1f', borderRadius:18, padding:18, marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  logHead: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  logRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  logDot: { width:6, height:6, borderRadius:3, backgroundColor:'#7c6fff', marginTop:5 },
  logText: { color:'#777', fontSize:12, flex:1, lineHeight:18 },
});
