import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, TextInput } from 'react-native';

export default function FakeCallScreen() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [callDuration, setCallDuration] = useState(0);
  const [delay, setDelay] = useState(5);
  const timerRef = useRef(null);
  const ringAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isCallActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerFakeCall = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => {
      ringAnim.stopAnimation();
      setIsCallActive(true);
    }, delay * 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  if (isCallActive) {
    return (
      <SafeAreaView style={s.callScreen}>
        <Text style={s.callNetwork}>SafeShield Protection</Text>
        <View style={s.callerInfo}>
          <View style={s.callerAvatar}>
            <Text style={s.callerAvatarText}>{callerName[0]}</Text>
          </View>
          <Text style={s.callerName}>{callerName}</Text>
          <Text style={s.callStatus}>SafeShield Fake Call</Text>
          <Text style={s.callTimer}>{formatTime(callDuration)}</Text>
        </View>
        <View style={s.callActions}>
          <TouchableOpacity style={s.callActionBtn}>
            <Text style={s.callActionIcon}>🔇</Text>
            <Text style={s.callActionLabel}>Mute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.callActionBtn}>
            <Text style={s.callActionIcon}>🔊</Text>
            <Text style={s.callActionLabel}>Speaker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.callActionBtn}>
            <Text style={s.callActionIcon}>⌨️</Text>
            <Text style={s.callActionLabel}>Keypad</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.endCallBtn} onPress={endCall}>
          <Text style={s.endCallIcon}>📵</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Fake Call</Text>
        <Text style={s.headerSub}>Escape danger with a fake incoming call</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.previewCard}>
          <Text style={s.previewIcon}>📱</Text>
          <Text style={s.previewTitle}>Fake Incoming Call</Text>
          <Text style={s.previewSub}>Your phone will show a realistic incoming call from {callerName}</Text>
        </View>

        <View style={s.settingsCard}>
          <Text style={s.settingsTitle}>SETTINGS</Text>

          <Text style={s.settingsLabel}>Caller Name</Text>
          <TextInput
            style={s.input}
            value={callerName}
            onChangeText={setCallerName}
            placeholderTextColor="#444"
            placeholder="Enter caller name"
          />

          <Text style={s.settingsLabel}>Delay (seconds)</Text>
          <View style={s.delayRow}>
            {[3, 5, 10, 15, 30].map(d => (
              <TouchableOpacity
                key={d}
                style={[s.delayBtn, delay === d && s.delayBtnActive]}
                onPress={() => setDelay(d)}
              >
                <Text style={[s.delayBtnText, delay === d && s.delayBtnTextActive]}>{d}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.triggerBtn} onPress={triggerFakeCall} activeOpacity={0.8}>
          <Text style={s.triggerBtnText}>📞  Trigger Fake Call in {delay}s</Text>
        </TouchableOpacity>

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>SAFETY TIPS</Text>
          {[
            'Use this to escape uncomfortable situations',
            'Set delay to give yourself time to prepare',
            'Act naturally when the fake call comes',
            'Use it in public places when feeling unsafe',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#060612' },
  callScreen: { flex:1, backgroundColor:'#1a1a2e', justifyContent:'space-between', padding:30 },
  callNetwork: { color:'#aaa', fontSize:13, textAlign:'center', marginTop:10 },
  callerInfo: { alignItems:'center', flex:1, justifyContent:'center' },
  callerAvatar: { width:120, height:120, borderRadius:60, backgroundColor:'#7c6fff', justifyContent:'center', alignItems:'center', marginBottom:20 },
  callerAvatarText: { color:'white', fontSize:52, fontWeight:'800' },
  callerName: { color:'white', fontSize:32, fontWeight:'800', marginBottom:8 },
  callStatus: { color:'#aaa', fontSize:16, marginBottom:8 },
  callTimer: { color:'#7c6fff', fontSize:22, fontWeight:'700' },
  callActions: { flexDirection:'row', justifyContent:'space-around', marginBottom:40 },
  callActionBtn: { alignItems:'center', gap:8 },
  callActionIcon: { fontSize:30, backgroundColor:'#2a2a4e', padding:18, borderRadius:40 },
  callActionLabel: { color:'#aaa', fontSize:12 },
  endCallBtn: { backgroundColor:'#ff0000', width:72, height:72, borderRadius:36, justifyContent:'center', alignItems:'center', alignSelf:'center', marginBottom:20 },
  endCallIcon: { fontSize:32 },
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#12122a' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'800' },
  headerSub: { color:'#444', fontSize:13, marginTop:4 },
  scroll: { padding:20, paddingBottom:100 },
  previewCard: { backgroundColor:'#0d0d1f', borderRadius:24, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  previewIcon: { fontSize:50, marginBottom:12 },
  previewTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:8 },
  previewSub: { color:'#555', fontSize:13, textAlign:'center', lineHeight:20 },
  settingsCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  settingsTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  settingsLabel: { color:'#888', fontSize:13, marginBottom:8, fontWeight:'600' },
  input: { backgroundColor:'#060612', borderRadius:12, padding:14, color:'white', fontSize:15, marginBottom:18, borderWidth:1, borderColor:'#1a1a2e' },
  delayRow: { flexDirection:'row', gap:10, marginBottom:4 },
  delayBtn: { flex:1, backgroundColor:'#060612', borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:'#1a1a2e' },
  delayBtnActive: { backgroundColor:'#7c6fff', borderColor:'#7c6fff' },
  delayBtnText: { color:'#555', fontSize:13, fontWeight:'600' },
  delayBtnTextActive: { color:'white' },
  triggerBtn: { backgroundColor:'#7c6fff', borderRadius:18, padding:18, alignItems:'center', marginBottom:20 },
  triggerBtnText: { color:'white', fontSize:17, fontWeight:'700' },
  tipsCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, borderWidth:1, borderColor:'#12122a' },
  tipsTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  tipRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:12 },
  tipDot: { width:6, height:6, borderRadius:3, backgroundColor:'#7c6fff', marginTop:5 },
  tipText: { color:'#888', fontSize:13, flex:1, lineHeight:20 },
});
