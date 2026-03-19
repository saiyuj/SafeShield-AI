import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FakeCallScreen() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [callDuration, setCallDuration] = useState(0);
  const [delay, setDelay] = useState(5);
  const timerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isCallActive]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const triggerFakeCall = () => {
    setTimeout(() => setIsCallActive(true), delay * 1000);
    Alert.alert('Fake Call', `Incoming call from ${callerName} in ${delay} seconds!`);
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
          <Text style={s.callStatus}>Incoming Call</Text>
          <Text style={s.callTimer}>{formatTime(callDuration)}</Text>
        </View>
        <View style={s.callActions}>
          {[['mic-off-outline', 'Mute'], ['volume-high-outline', 'Speaker'], ['keypad-outline', 'Keypad']].map(([icon, label]) => (
            <View key={label} style={s.callActionBtn}>
              <View style={s.callActionIcon}><Ionicons name={icon as any} size={26} color="white" /></View>
              <Text style={s.callActionLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.endCallBtn} onPress={() => setIsCallActive(false)}>
          <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fake Call</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.previewCard}>
          <Ionicons name="phone-portrait-outline" size={50} color="#30B0C7" />
          <Text style={s.previewTitle}>Fake Incoming Call</Text>
          <Text style={s.previewSub}>Escape danger with a realistic fake call from {callerName}</Text>
        </View>

        <View style={s.settingsCard}>
          <Text style={s.settingsTitle}>SETTINGS</Text>
          <Text style={s.settingsLabel}>Caller Name</Text>
          <TextInput style={s.input} value={callerName} onChangeText={setCallerName} placeholderTextColor="#444" placeholder="Enter caller name" />
          <Text style={s.settingsLabel}>Delay (seconds)</Text>
          <View style={s.delayRow}>
            {[3, 5, 10, 15, 30].map(d => (
              <TouchableOpacity key={d} style={[s.delayBtn, delay === d && s.delayBtnActive]} onPress={() => setDelay(d)}>
                <Text style={[s.delayBtnText, delay === d && s.delayBtnTextActive]}>{d}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.triggerBtn} onPress={triggerFakeCall} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={22} color="#111" />
          <Text style={s.triggerBtnText}>Trigger Fake Call in {delay}s</Text>
        </TouchableOpacity>

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>SAFETY TIPS</Text>
          {['Use this to escape uncomfortable situations', 'Set delay to give yourself time to prepare', 'Act naturally when the fake call comes', 'Use in public places when feeling unsafe'].map((tip, i) => (
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
  container: { flex:1, backgroundColor:'#111111' },
  callScreen: { flex:1, backgroundColor:'#1a1a2e', justifyContent:'space-between', padding:30 },
  callNetwork: { color:'#aaa', fontSize:13, textAlign:'center', marginTop:10 },
  callerInfo: { alignItems:'center', flex:1, justifyContent:'center' },
  callerAvatar: { width:120, height:120, borderRadius:60, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center', marginBottom:20 },
  callerAvatarText: { color:'#111', fontSize:52, fontWeight:'800' },
  callerName: { color:'white', fontSize:32, fontWeight:'800', marginBottom:8 },
  callStatus: { color:'#aaa', fontSize:16, marginBottom:8 },
  callTimer: { color:'#FFE033', fontSize:22, fontWeight:'700' },
  callActions: { flexDirection:'row', justifyContent:'space-around', marginBottom:40 },
  callActionBtn: { alignItems:'center', gap:8 },
  callActionIcon: { backgroundColor:'#2a2a4e', padding:18, borderRadius:40 },
  callActionLabel: { color:'#aaa', fontSize:12 },
  endCallBtn: { backgroundColor:'#FF3B30', width:72, height:72, borderRadius:36, justifyContent:'center', alignItems:'center', alignSelf:'center', marginBottom:20 },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:20, paddingBottom:100 },
  previewCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  previewTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:8, marginTop:12 },
  previewSub: { color:'#555', fontSize:13, textAlign:'center', lineHeight:20 },
  settingsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  settingsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  settingsLabel: { color:'#888', fontSize:13, marginBottom:8, fontWeight:'600' },
  input: { backgroundColor:'#111111', borderRadius:12, padding:14, color:'white', fontSize:15, marginBottom:18, borderWidth:1, borderColor:'#2C2C2E' },
  delayRow: { flexDirection:'row', gap:10, marginBottom:4 },
  delayBtn: { flex:1, backgroundColor:'#111111', borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:'#2C2C2E' },
  delayBtnActive: { backgroundColor:'#FFE033', borderColor:'#FFE033' },
  delayBtnText: { color:'#555', fontSize:13, fontWeight:'600' },
  delayBtnTextActive: { color:'#111' },
  triggerBtn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  triggerBtnText: { color:'#111', fontSize:17, fontWeight:'800' },
  tipsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  tipsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  tipRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:12 },
  tipDot: { width:6, height:6, borderRadius:3, backgroundColor:'#FFE033', marginTop:5 },
  tipText: { color:'#888', fontSize:13, flex:1, lineHeight:20 },
});
