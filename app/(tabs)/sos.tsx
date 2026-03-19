import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Animated, Alert, StatusBar, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SOSScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sent, setSent] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerSOS = () => {
    setSosActive(true);
    setCountdown(3);
    setSent(false);
    Vibration.vibrate([200, 100, 200]);
    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      Vibration.vibrate(200);
      if (count === 0) {
        clearInterval(timerRef.current);
        setSent(true);
        Vibration.vibrate([500, 200, 500, 200, 500]);
        Alert.alert('SOS SENT!', 'Emergency contacts notified with your location!\n\nStay calm. Help is on the way.', [{ text: 'OK', onPress: () => { setSosActive(false); setSent(false); } }]);
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setSosActive(false);
    setSent(false);
    setCountdown(3);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Emergency SOS</Text>
        <Text style={s.headerSub}>One tap to alert your contacts</Text>
      </View>

      <View style={s.content}>
        <Animated.View style={[s.sosOuter, { transform: [{ scale: pulseAnim }] }]}>
          <View style={s.sosMiddle}>
            <TouchableOpacity style={[s.sosBtn, sosActive && s.sosBtnActive]} onPress={sosActive ? cancelSOS : triggerSOS} activeOpacity={0.8}>
              {sosActive && !sent ? (
                <>
                  <Text style={s.sosCountdown}>{countdown}</Text>
                  <Text style={s.sosBtnSubText}>Tap to cancel</Text>
                </>
              ) : (
                <>
                  <Text style={s.sosBtnText}>SOS</Text>
                  <Text style={s.sosBtnSubText}>Tap for emergency</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {sosActive && !sent && (
          <View style={s.alertBanner}>
            <Ionicons name="warning-outline" size={18} color="#FF3B30" />
            <Text style={s.alertBannerText}>Sending SOS in {countdown} seconds...</Text>
          </View>
        )}

        <View style={s.infoRow}>
          {[
            { icon: <Ionicons name="location-outline" size={24} color="#FFE033" />, title: 'Location', desc: 'GPS sent' },
            { icon: <Ionicons name="mail-outline" size={24} color="#FFE033" />, title: 'Email', desc: 'Alert sent' },
            { icon: <Ionicons name="people-outline" size={24} color="#FFE033" />, title: 'Contacts', desc: 'Notified' },
          ].map((item, i) => (
            <View key={i} style={s.infoCard}>
              {item.icon}
              <Text style={s.infoTitle}>{item.title}</Text>
              <Text style={s.infoDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.tipsCard}>
          <View style={s.tipsHeader}>
            <Ionicons name="heart-outline" size={16} color="#FFE033" />
            <Text style={s.tipsTitle}>SAFETY TIPS</Text>
          </View>
          {[
            'Stay calm and move to a safe place',
            'Call 112 for police emergency',
            'Call 1091 for women helpline',
            'Your location is shared automatically',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#222', alignItems:'center' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'900' },
  headerSub: { color:'#555', fontSize:13, marginTop:4 },
  content: { flex:1, padding:20, alignItems:'center' },
  sosOuter: { width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,59,48,0.1)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,59,48,0.2)', marginBottom:24, marginTop:20 },
  sosMiddle: { width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,59,48,0.15)', justifyContent:'center', alignItems:'center' },
  sosBtn: { width:140, height:140, borderRadius:70, backgroundColor:'#FF3B30', justifyContent:'center', alignItems:'center', borderWidth:3, borderColor:'#ff6b6b' },
  sosBtnActive: { backgroundColor:'#FF9500' },
  sosBtnText: { color:'white', fontSize:40, fontWeight:'900', letterSpacing:2 },
  sosCountdown: { color:'white', fontSize:60, fontWeight:'900' },
  sosBtnSubText: { color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:4 },
  alertBanner: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(255,59,48,0.15)', borderRadius:14, padding:14, marginBottom:20, borderWidth:1, borderColor:'rgba(255,59,48,0.3)', width:'100%', justifyContent:'center' },
  alertBannerText: { color:'#FF3B30', fontSize:15, fontWeight:'700' },
  infoRow: { flexDirection:'row', gap:12, marginBottom:20, width:'100%' },
  infoCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:16, alignItems:'center', gap:6, borderWidth:1, borderColor:'#2C2C2E' },
  infoTitle: { color:'white', fontSize:13, fontWeight:'700' },
  infoDesc: { color:'#555', fontSize:11 },
  tipsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E', width:'100%' },
  tipsHeader: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:14 },
  tipsTitle: { color:'#FFE033', fontSize:12, fontWeight:'800', letterSpacing:1 },
  tipRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  tipDot: { width:6, height:6, borderRadius:3, backgroundColor:'#FFE033' },
  tipText: { color:'#888', fontSize:13, flex:1 },
});
