import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HealthScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('period');
  const [lastPeriod, setLastPeriod] = useState(null);
  const [safetyMode, setSafetyMode] = useState(false);
  const [medicalAlert, setMedicalAlert] = useState(false);
  const [heartRate, setHeartRate] = useState(null);
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ])).start();
  }, []);

  const logPeriod = (day) => {
    setLastPeriod(day);
    Alert.alert('✅ Period Logged!', `Day ${day} recorded.\n\n${safetyMode ? '🛡 Safety mode is ON.' : 'Enable Safety Mode for extra protection.'}`);
  };

  const simulateHeartRate = () => {
    const rate = Math.floor(Math.random() * 60) + 60;
    setHeartRate(rate);
    if (rate > 110) {
      Alert.alert('⚠️ High Heart Rate!', `Heart rate: ${rate} BPM\n\nDo you need help?`, [
        { text: 'I am OK', style: 'cancel' },
        { text: 'Call Emergency', style: 'destructive', onPress: () => Alert.alert('🚨 Emergency Alert Sent!', 'Emergency contacts notified!') }
      ]);
    }
  };

  const activateMedicalSOS = (condition) => {
    Alert.alert(`🚨 ${condition} Emergency!`, `Emergency contacts notified!\nAmbulance being called!\nYour location has been shared!`, [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Health & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabRow}>
        {[['period', 'Period Tracker', '#FF2D55'], ['medical', 'Medical SOS', '#FF3B30']].map(([key, label, color]) => (
          <TouchableOpacity key={key} style={[s.tab, activeTab === key && { backgroundColor: color }]} onPress={() => setActiveTab(key)}>
            <Text style={[s.tabText, activeTab === key && { color: 'white' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'period' && (
          <View>
            <View style={s.heroCard}>
              <View style={s.heroOrb}>
                <Ionicons name="flower-outline" size={40} color="#FF2D55" />
              </View>
              <Text style={s.heroTitle}>Period Safety Tracker</Text>
              <Text style={s.heroSub}>Track your cycle and stay safe with enhanced protection</Text>
            </View>

            {lastPeriod && (
              <View style={s.cycleCard}>
                <View style={s.cycleRow}>
                  <View style={s.cycleStat}><Text style={s.cycleStatVal}>Day {lastPeriod}</Text><Text style={s.cycleStatLabel}>Current Day</Text></View>
                  <View style={s.cycleStat}><Text style={[s.cycleStatVal, { color: '#FF2D55' }]}>{28 - lastPeriod}</Text><Text style={s.cycleStatLabel}>Days Until Next</Text></View>
                  <View style={s.cycleStat}><Text style={[s.cycleStatVal, { color: '#34C759' }]}>28</Text><Text style={s.cycleStatLabel}>Cycle Length</Text></View>
                </View>
              </View>
            )}

            <View style={s.dayPicker}>
              <Text style={s.dayPickerTitle}>LOG TODAY'S CYCLE DAY</Text>
              <View style={s.dayGrid}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <TouchableOpacity key={day} style={[s.dayBtn, lastPeriod === day && s.dayBtnActive]} onPress={() => logPeriod(day)}>
                    <Text style={[s.dayBtnText, lastPeriod === day && s.dayBtnTextActive]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.safetyCard}>
              <View style={s.safetyHeader}>
                <Ionicons name="shield-outline" size={24} color="#FF2D55" />
                <View style={{ flex:1 }}>
                  <Text style={s.safetyTitle}>Period Safety Mode</Text>
                  <Text style={s.safetySub}>Enhanced protection during your cycle</Text>
                </View>
                <Switch value={safetyMode} onValueChange={setSafetyMode} trackColor={{ false: '#333', true: '#FF2D55' }} thumbColor={safetyMode ? 'white' : '#666'} />
              </View>
            </View>
          </View>
        )}

        {activeTab === 'medical' && (
          <View>
            <View style={s.heroCard}>
              <Animated.View style={[s.heroOrb, { transform: [{ scale: heartAnim }], backgroundColor: 'rgba(255,59,48,0.15)', borderColor: 'rgba(255,59,48,0.3)' }]}>
                <Ionicons name="heart" size={40} color="#FF3B30" />
              </Animated.View>
              <Text style={s.heroTitle}>Medical Emergency Detection</Text>
              <Text style={s.heroSub}>AI detects medical emergencies and alerts help instantly</Text>
            </View>

            <TouchableOpacity style={s.heartRateCard} onPress={simulateHeartRate} activeOpacity={0.8}>
              <View style={s.heartRateLeft}>
                <Ionicons name="pulse-outline" size={28} color="#FF3B30" />
                <View>
                  <Text style={s.heartRateTitle}>Heart Rate Monitor</Text>
                  <Text style={s.heartRateSub}>Tap to check</Text>
                </View>
              </View>
              <View style={s.heartRateValue}>
                <Text style={s.heartRateBPM}>{heartRate || '--'}</Text>
                <Text style={s.heartRateBPMLabel}>BPM</Text>
              </View>
            </TouchableOpacity>

            <Text style={s.emergencyTitle}>EMERGENCY SOS BUTTONS</Text>
            {[
              { condition: 'Heart Attack', icon: 'heart-outline', color: '#FF3B30', signs: 'Chest pain, shortness of breath' },
              { condition: 'Seizure', icon: 'flash-outline', color: '#FF9500', signs: 'Convulsions, loss of consciousness' },
              { condition: 'Severe Allergy', icon: 'medical-outline', color: '#5856D6', signs: 'Swelling, difficulty breathing' },
              { condition: 'Stroke', icon: 'body-outline', color: '#FF2D55', signs: 'Face drooping, arm weakness' },
              { condition: 'Diabetic Emergency', icon: 'fitness-outline', color: '#007AFF', signs: 'Dizziness, confusion, sweating' },
              { condition: 'Severe Injury', icon: 'bandage-outline', color: '#34C759', signs: 'Heavy bleeding, broken bone' },
            ].map((emergency, i) => (
              <TouchableOpacity key={i} style={[s.emergencyCard, { borderColor: emergency.color + '44' }]} onPress={() => activateMedicalSOS(emergency.condition)} activeOpacity={0.8}>
                <View style={[s.emergencyIcon, { backgroundColor: emergency.color + '22' }]}>
                  <Ionicons name={emergency.icon as any} size={24} color={emergency.color} />
                </View>
                <View style={s.emergencyInfo}>
                  <Text style={s.emergencyName}>{emergency.condition}</Text>
                  <Text style={s.emergencySigns}>{emergency.signs}</Text>
                </View>
                <View style={[s.emergencyBtn, { backgroundColor: emergency.color }]}>
                  <Text style={s.emergencyBtnText}>SOS</Text>
                </View>
              </TouchableOpacity>
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
  tabRow: { flexDirection:'row', padding:12, gap:8 },
  tab: { flex:1, backgroundColor:'#1C1C1E', borderRadius:12, padding:12, alignItems:'center' },
  tabText: { color:'#555', fontSize:13, fontWeight:'700' },
  scroll: { padding:16, paddingBottom:100 },
  heroCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:24, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  heroOrb: { width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,45,85,0.15)', justifyContent:'center', alignItems:'center', marginBottom:14, borderWidth:2, borderColor:'rgba(255,45,85,0.3)' },
  heroTitle: { color:'white', fontSize:18, fontWeight:'900', marginBottom:6 },
  heroSub: { color:'#555', fontSize:13, textAlign:'center' },
  cycleCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:16, borderWidth:1, borderColor:'#FF2D5533' },
  cycleRow: { flexDirection:'row', justifyContent:'space-around' },
  cycleStat: { alignItems:'center' },
  cycleStatVal: { color:'#FFE033', fontSize:22, fontWeight:'900' },
  cycleStatLabel: { color:'#555', fontSize:11, marginTop:4 },
  dayPicker: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  dayPickerTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  dayGrid: { flexDirection:'row', flexWrap:'wrap', gap:8 },
  dayBtn: { width:36, height:36, borderRadius:18, backgroundColor:'#111111', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#2C2C2E' },
  dayBtnActive: { backgroundColor:'#FF2D55', borderColor:'#FF2D55' },
  dayBtnText: { color:'#555', fontSize:12, fontWeight:'600' },
  dayBtnTextActive: { color:'white' },
  safetyCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:16, borderWidth:1, borderColor:'#FF2D5533' },
  safetyHeader: { flexDirection:'row', alignItems:'center', gap:12 },
  safetyTitle: { color:'white', fontSize:15, fontWeight:'700' },
  safetySub: { color:'#555', fontSize:12, marginTop:2 },
  heartRateCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderColor:'#FF3B3044' },
  heartRateLeft: { flexDirection:'row', alignItems:'center', gap:12 },
  heartRateTitle: { color:'white', fontSize:14, fontWeight:'700' },
  heartRateSub: { color:'#555', fontSize:12, marginTop:2 },
  heartRateValue: { alignItems:'center' },
  heartRateBPM: { color:'#FF3B30', fontSize:28, fontWeight:'900' },
  heartRateBPMLabel: { color:'#555', fontSize:11 },
  emergencyTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  emergencyCard: { backgroundColor:'#1C1C1E', borderRadius:16, padding:16, marginBottom:10, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1 },
  emergencyIcon: { width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center' },
  emergencyInfo: { flex:1 },
  emergencyName: { color:'white', fontSize:14, fontWeight:'700', marginBottom:3 },
  emergencySigns: { color:'#555', fontSize:11 },
  emergencyBtn: { borderRadius:10, paddingHorizontal:14, paddingVertical:8 },
  emergencyBtnText: { color:'white', fontSize:13, fontWeight:'800' },
});
