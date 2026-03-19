import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView, Animated } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

export default function SafeWalkScreen() {
  const [isWalking, setIsWalking] = useState(false);
  const [status, setStatus] = useState('idle');
  const [alerts, setAlerts] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isWalking) {
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timerRef.current);
  }, [isWalking]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startWalk = () => {
    setIsWalking(true);
    setDuration(0);
    setAlerts(0);
    setStatus('monitoring');
    Alert.alert('Safe Walk Started', 'SafeShield is now monitoring you. Stay safe!');
  };

  const stopWalk = () => {
    setIsWalking(false);
    setStatus('idle');
    Alert.alert('Safe Walk Ended', `Walk duration: ${formatTime(duration)}\nAlerts triggered: ${alerts}`);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Safe Walk</Text>
        <Text style={s.headerSub}>Continuous AI monitoring while you walk</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <Animated.View style={[s.monitorCard, isWalking && s.monitorCardActive, {transform: [{scale: pulseAnim}]}]}>
          <Text style={s.monitorIcon}>{isWalking ? '🚶‍♀️' : '👟'}</Text>
          <Text style={s.monitorTitle}>{isWalking ? 'MONITORING ACTIVE' : 'READY TO WALK'}</Text>
          <Text style={s.monitorTime}>{formatTime(duration)}</Text>
          <Text style={s.monitorSub}>{isWalking ? 'AI is listening for distress sounds' : 'Start safe walk to begin monitoring'}</Text>
        </Animated.View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statVal}>{formatTime(duration)}</Text>
            <Text style={s.statLabel}>Duration</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statVal, {color: alerts > 0 ? '#ff4444' : '#00e676'}]}>{alerts}</Text>
            <Text style={s.statLabel}>Alerts</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statVal, {color: isWalking ? '#00e676' : '#444'}]}>{isWalking ? 'ON' : 'OFF'}</Text>
            <Text style={s.statLabel}>Status</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.btn, isWalking ? s.btnStop : s.btnStart]}
          onPress={isWalking ? stopWalk : startWalk}
          activeOpacity={0.8}
        >
          <Text style={s.btnText}>{isWalking ? '⏹  End Safe Walk' : '🚶‍♀️  Start Safe Walk'}</Text>
        </TouchableOpacity>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>HOW IT WORKS</Text>
          {[
            ['🎙', 'Listens continuously via microphone'],
            ['🤖', 'AI analyzes every 3 seconds'],
            ['🚨', 'Triggers alert if distress detected'],
            ['📍', 'Sends your location to contacts'],
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
  container: { flex:1, backgroundColor:'#060612' },
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#12122a' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'800' },
  headerSub: { color:'#444', fontSize:13, marginTop:4 },
  scroll: { padding:20, paddingBottom:100 },
  monitorCard: { backgroundColor:'#0d0d1f', borderRadius:28, padding:36, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  monitorCardActive: { borderColor:'#00e676', backgroundColor:'rgba(0,230,118,0.05)' },
  monitorIcon: { fontSize:60, marginBottom:12 },
  monitorTitle: { color:'white', fontSize:16, fontWeight:'800', letterSpacing:1, marginBottom:8 },
  monitorTime: { color:'#7c6fff', fontSize:48, fontWeight:'900', marginBottom:8 },
  monitorSub: { color:'#555', fontSize:13, textAlign:'center' },
  statsRow: { flexDirection:'row', gap:12, marginBottom:20 },
  statBox: { flex:1, backgroundColor:'#0d0d1f', borderRadius:16, padding:18, alignItems:'center', borderWidth:1, borderColor:'#12122a' },
  statVal: { color:'#7c6fff', fontSize:20, fontWeight:'800' },
  statLabel: { color:'#444', fontSize:11, marginTop:4 },
  btn: { borderRadius:18, padding:18, alignItems:'center', marginBottom:20 },
  btnStart: { backgroundColor:'#00e676' },
  btnStop: { backgroundColor:'#12122a', borderWidth:2, borderColor:'#ff4444' },
  btnText: { color:'white', fontSize:17, fontWeight:'700' },
  infoCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, borderWidth:1, borderColor:'#12122a' },
  infoTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  infoRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  infoIcon: { fontSize:22 },
  infoText: { color:'#888', fontSize:14, flex:1 },
});
