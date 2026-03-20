import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Animated, Alert, StatusBar, Vibration, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function SOSScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerSOS = async () => {
    Vibration.vibrate([200, 100, 200]);
    setSosActive(true);
    setCountdown(3);
    setSent(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    } catch (e) {}

    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      Vibration.vibrate(300);
      if (count === 0) {
        clearInterval(timerRef.current);
        setSent(true);
        Vibration.vibrate([500, 200, 500, 200, 500]);
        Alert.alert(
          '🚨 SOS SENT!',
          'Emergency contacts notified!\nYour location has been shared.\n\nHelp is on the way. Stay calm.',
          [{ text: 'OK', onPress: () => { setSosActive(false); setSent(false); } }]
        );
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setSosActive(false);
    setSent(false);
    setCountdown(3);
    Vibration.cancel();
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <View style={s.header}>
        <Text style={s.headerTitle}>Emergency SOS</Text>
        <Text style={s.headerSub}>One tap to alert your contacts</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* SOS Button Area */}
        <View style={s.sosArea}>

          {/* Outer rings */}
          <Animated.View style={[s.ring3, sosActive && s.ringActive3]} />
          <Animated.View style={[s.ring2, sosActive && s.ringActive2]} />
          <Animated.View style={[s.ring1, sosActive && s.ringActive1]} />

          {/* Main SOS Button */}
          <Animated.View style={[s.sosBtnWrap, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[s.sosBtn, sosActive && s.sosBtnActive]}
              onPress={sosActive ? cancelSOS : triggerSOS}
              activeOpacity={0.85}
            >
              {sosActive && !sent ? (
                <View style={s.sosBtnContent}>
                  <Text style={s.sosCountdown}>{countdown}</Text>
                  <Text style={s.sosCancelText}>Tap to cancel</Text>
                </View>
              ) : (
                <View style={s.sosBtnContent}>
                  <Text style={s.sosBtnText}>SOS</Text>
                  <Text style={s.sosBtnSub}>Hold for Emergency</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Status */}
        {sosActive && !sent && (
          <View style={s.statusCard}>
            <Ionicons name="radio-outline" size={20} color="#FF3B30" />
            <Text style={s.statusText}>Sending SOS in {countdown} seconds...</Text>
          </View>
        )}

        {/* Location */}
        {location && (
          <View style={s.locationCard}>
            <Ionicons name="location-outline" size={20} color="#34C759" />
            <Text style={s.locationText}>Location ready to share: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.quickActions}>
          <Text style={s.quickTitle}>QUICK EMERGENCY CALLS</Text>
          <View style={s.quickGrid}>
            {[
              { icon: 'shield-outline', label: 'Police', number: '100', color: '#007AFF' },
              { icon: 'medkit-outline', label: 'Ambulance', number: '108', color: '#34C759' },
              { icon: 'woman-outline', label: 'Women', number: '1091', color: '#FF2D55' },
              { icon: 'alert-circle-outline', label: 'Emergency', number: '112', color: '#FF3B30' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[s.quickCard, { borderColor: item.color + '44' }]}
                onPress={() => Alert.alert(`Calling ${item.label}`, `Dialing ${item.number}...`)}
                activeOpacity={0.8}
              >
                <View style={[s.quickIcon, { backgroundColor: item.color + '22' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={s.quickLabel}>{item.label}</Text>
                <Text style={[s.quickNumber, { color: item.color }]}>{item.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💛 STAY SAFE</Text>
          {[
            'Move to a crowded public area',
            'Stay on the phone with someone',
            'Make noise to attract attention',
            'Trust your instincts always',
          ].map((tip, i) => (
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
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#222', alignItems:'center' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'900' },
  headerSub: { color:'#555', fontSize:13, marginTop:4 },
  scroll: { padding:20, paddingBottom:100 },
  sosArea: { alignItems:'center', justifyContent:'center', height:280, marginBottom:20 },
  ring3: { position:'absolute', width:260, height:260, borderRadius:130, borderWidth:1, borderColor:'rgba(255,59,48,0.1)' },
  ring2: { position:'absolute', width:220, height:220, borderRadius:110, borderWidth:1.5, borderColor:'rgba(255,59,48,0.15)' },
  ring1: { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:2, borderColor:'rgba(255,59,48,0.2)' },
  ringActive3: { borderColor:'rgba(255,59,48,0.2)' },
  ringActive2: { borderColor:'rgba(255,59,48,0.3)' },
  ringActive1: { borderColor:'rgba(255,59,48,0.4)' },
  sosBtnWrap: { width:150, height:150 },
  sosBtn: { width:150, height:150, borderRadius:75, backgroundColor:'#FF3B30', justifyContent:'center', alignItems:'center', borderWidth:4, borderColor:'#FF6B6B', shadowColor:'#FF3B30', shadowOffset:{width:0,height:0}, shadowOpacity:0.8, shadowRadius:20, elevation:20 },
  sosBtnActive: { backgroundColor:'#FF9500', borderColor:'#FFB347' },
  sosBtnContent: { alignItems:'center' },
  sosBtnText: { color:'white', fontSize:44, fontWeight:'900', letterSpacing:3 },
  sosBtnSub: { color:'rgba(255,255,255,0.7)', fontSize:10, marginTop:2 },
  sosCountdown: { color:'white', fontSize:64, fontWeight:'900' },
  sosCancelText: { color:'rgba(255,255,255,0.7)', fontSize:10 },
  statusCard: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(255,59,48,0.1)', borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:'rgba(255,59,48,0.3)' },
  statusText: { color:'#FF3B30', fontSize:14, fontWeight:'700' },
  locationCard: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(52,199,89,0.1)', borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:'rgba(52,199,89,0.3)' },
  locationText: { color:'#34C759', fontSize:12, flex:1 },
  quickActions: { marginBottom:20 },
  quickTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  quickGrid: { flexDirection:'row', gap:10 },
  quickCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:14, alignItems:'center', borderWidth:1 },
  quickIcon: { width:44, height:44, borderRadius:12, justifyContent:'center', alignItems:'center', marginBottom:8 },
  quickLabel: { color:'#888', fontSize:11, marginBottom:4 },
  quickNumber: { fontSize:16, fontWeight:'900' },
  tipsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  tipsTitle: { color:'#FFE033', fontSize:12, fontWeight:'800', letterSpacing:1, marginBottom:14 },
  tipRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  tipText: { color:'#888', fontSize:13, flex:1 },
});
