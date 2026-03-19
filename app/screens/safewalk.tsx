import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function SafeWalkScreen() {
  const [isWalking, setIsWalking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    if (isWalking) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])).start();
    } else {
      clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timerRef.current);
  }, [isWalking]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Safe Walk</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Animated.View style={[s.monitorCard, isWalking && s.monitorCardActive, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="walk-outline" size={60} color={isWalking ? '#34C759' : '#555'} />
          <Text style={s.monitorTitle}>{isWalking ? 'MONITORING ACTIVE' : 'READY TO WALK'}</Text>
          <Text style={s.monitorTime}>{formatTime(duration)}</Text>
          <Text style={s.monitorSub}>{isWalking ? 'AI is listening for distress sounds' : 'Start safe walk to begin monitoring'}</Text>
        </Animated.View>

        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={s.statVal}>{formatTime(duration)}</Text><Text style={s.statLabel}>Duration</Text></View>
          <View style={s.statBox}><Text style={[s.statVal, { color: alerts > 0 ? '#FF3B30' : '#34C759' }]}>{alerts}</Text><Text style={s.statLabel}>Alerts</Text></View>
          <View style={s.statBox}><Text style={[s.statVal, { color: isWalking ? '#34C759' : '#444' }]}>{isWalking ? 'ON' : 'OFF'}</Text><Text style={s.statLabel}>Status</Text></View>
        </View>

        <TouchableOpacity style={[s.btn, isWalking ? s.btnStop : s.btnStart]} onPress={() => { if (isWalking) { setIsWalking(false); Alert.alert('Walk Ended', `Duration: ${formatTime(duration)}\nAlerts: ${alerts}`); setDuration(0); } else setIsWalking(true); }} activeOpacity={0.8}>
          <Ionicons name={isWalking ? "stop-circle-outline" : "walk-outline"} size={22} color={isWalking ? '#FF3B30' : 'white'} />
          <Text style={[s.btnText, isWalking && { color: '#FF3B30' }]}>{isWalking ? 'End Safe Walk' : 'Start Safe Walk'}</Text>
        </TouchableOpacity>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>HOW IT WORKS</Text>
          {[['mic-outline', 'Listens continuously via microphone'], ['pulse-outline', 'AI analyzes every 3 seconds'], ['warning-outline', 'Triggers alert if distress detected'], ['location-outline', 'Sends your location to contacts']].map(([icon, text], i) => (
            <View key={i} style={s.infoRow}>
              <Ionicons name={icon as any} size={22} color="#FFE033" />
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
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:20, paddingBottom:100 },
  monitorCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:36, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  monitorCardActive: { borderColor:'#34C759' },
  monitorTitle: { color:'white', fontSize:16, fontWeight:'800', letterSpacing:1, marginBottom:8, marginTop:12 },
  monitorTime: { color:'#FFE033', fontSize:48, fontWeight:'900', marginBottom:8 },
  monitorSub: { color:'#555', fontSize:13, textAlign:'center' },
  statsRow: { flexDirection:'row', gap:12, marginBottom:20 },
  statBox: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:18, alignItems:'center', borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { color:'#FFE033', fontSize:20, fontWeight:'800' },
  statLabel: { color:'#444', fontSize:11, marginTop:4 },
  btn: { borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  btnStart: { backgroundColor:'#34C759' },
  btnStop: { backgroundColor:'#1C1C1E', borderWidth:2, borderColor:'#FF3B30' },
  btnText: { color:'white', fontSize:17, fontWeight:'700' },
  infoCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  infoTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  infoRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  infoText: { color:'#888', fontSize:14, flex:1 },
});
