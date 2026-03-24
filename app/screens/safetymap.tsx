import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const DANGER_ZONES = [
  { id:1, name:'Dark Alley - MG Road', type:'Poorly Lit Area', reports:12, color:'#FF3B30', icon:'moon-outline' },
  { id:2, name:'Deserted Park - Anna Nagar', type:'Isolated Area', reports:8, color:'#FF9500', icon:'leaf-outline' },
  { id:3, name:'Bus Stop - T Nagar', type:'Harassment Reported', reports:15, color:'#FF3B30', icon:'bus-outline' },
  { id:4, name:'Parking Lot - Phoenix Mall', type:'No CCTV', reports:6, color:'#FFE033', icon:'car-outline' },
];

const SAFE_ZONES = [
  { id:1, name:'Police Station - Anna Nagar', type:'Police', icon:'shield-outline', color:'#34C759' },
  { id:2, name:'Apollo Hospital', type:'Hospital', icon:'medkit-outline', color:'#007AFF' },
  { id:3, name:'Metro Station - CMBT', type:'Public Transport', icon:'train-outline', color:'#5856D6' },
  { id:4, name:'Spencer Plaza Mall', type:'Crowded Area', icon:'storefront-outline', color:'#34C759' },
];

const dangerTypes = ['Poorly Lit Area','No CCTV','Harassment Reported','Isolated Location','Suspicious Activity','Eve Teasing','Drug Activity','Other'];

export default function SafetyMapScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('danger');
  const [reportType, setReportType] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  const reportDangerZone = async () => {
    if (!reportType) { Alert.alert('Please select a danger type'); return; }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      Alert.alert('✅ Danger Zone Reported!', `Type: ${reportType}\nLocation: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}\n\nThank you for keeping the community safe!\nOther SafeShield users will be warned.`, [{ text: 'OK', onPress: () => setReportType('') }]);
    } else {
      Alert.alert('✅ Report Submitted!', `Type: ${reportType}\nYour report has been added to the community safety map.`, [{ text: 'OK', onPress: () => setReportType('') }]);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Community Safety Map</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabRow}>
        {[['danger','Danger Zones','#FF3B30'],['safe','Safe Zones','#34C759'],['report','Report','#FFE033']].map(([key,label,color]) => (
          <TouchableOpacity key={key} style={[s.tab, activeTab===key && { backgroundColor: color as string }]} onPress={() => setActiveTab(key as string)}>
            <Text style={[s.tabText, activeTab===key && { color:'#111' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'danger' && (
          <View>
            <View style={s.alertBanner}>
              <Ionicons name="warning-outline" size={20} color="#FF3B30" />
              <Text style={s.alertBannerText}>{DANGER_ZONES.length} danger zones reported near Chennai</Text>
            </View>
            {DANGER_ZONES.map(zone => (
              <View key={zone.id} style={[s.zoneCard, { borderColor: zone.color+'44' }]}>
                <View style={[s.zoneIcon, { backgroundColor: zone.color+'22' }]}>
                  <Ionicons name={zone.icon as any} size={24} color={zone.color} />
                </View>
                <View style={s.zoneInfo}>
                  <Text style={s.zoneName}>{zone.name}</Text>
                  <Text style={[s.zoneType, { color: zone.color }]}>{zone.type}</Text>
                  <Text style={s.zoneReports}>{zone.reports} community reports</Text>
                </View>
                <Ionicons name="alert-circle-outline" size={22} color={zone.color} />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'safe' && (
          <View>
            <View style={s.safeBanner}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
              <Text style={s.safeBannerText}>{SAFE_ZONES.length} verified safe zones near you</Text>
            </View>
            {SAFE_ZONES.map(zone => (
              <View key={zone.id} style={[s.zoneCard, { borderColor: zone.color+'44' }]}>
                <View style={[s.zoneIcon, { backgroundColor: zone.color+'22' }]}>
                  <Ionicons name={zone.icon as any} size={24} color={zone.color} />
                </View>
                <View style={s.zoneInfo}>
                  <Text style={s.zoneName}>{zone.name}</Text>
                  <Text style={[s.zoneType, { color: zone.color }]}>{zone.type}</Text>
                  <Text style={s.zoneReports}>Verified safe location</Text>
                </View>
                <TouchableOpacity style={[s.navBtn, { backgroundColor: zone.color }]} onPress={() => Alert.alert('Navigate', `Opening directions to ${zone.name}`)}>
                  <Ionicons name="navigate-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'report' && (
          <View>
            <View style={s.reportHero}>
              <Animated.View style={[s.reportOrb, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="flag" size={36} color="#FFE033" />
              </Animated.View>
              <Text style={s.reportTitle}>Report a Danger Zone</Text>
              <Text style={s.reportSub}>Help protect your community by marking unsafe areas anonymously</Text>
            </View>
            <View style={s.reportCard}>
              <Text style={s.reportLabel}>SELECT DANGER TYPE</Text>
              <View style={s.dangerGrid}>
                {dangerTypes.map((type, i) => (
                  <TouchableOpacity key={i} style={[s.dangerBtn, reportType===type && s.dangerBtnActive]} onPress={() => setReportType(type)}>
                    <Text style={[s.dangerBtnText, reportType===type && s.dangerBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[s.submitBtn, !reportType && { opacity: 0.5 }]} onPress={reportDangerZone} activeOpacity={0.8}>
                <Ionicons name="location-outline" size={20} color="#111" />
                <Text style={s.submitBtnText}>Report My Current Location</Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: { color:'white', fontSize:17, fontWeight:'800' },
  tabRow: { flexDirection:'row', padding:12, gap:8 },
  tab: { flex:1, backgroundColor:'#1C1C1E', borderRadius:12, padding:10, alignItems:'center' },
  tabText: { color:'#555', fontSize:13, fontWeight:'700' },
  scroll: { padding:16, paddingBottom:100 },
  alertBanner: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(255,59,48,0.1)', borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:'rgba(255,59,48,0.3)' },
  alertBannerText: { color:'#FF3B30', fontSize:13, fontWeight:'700' },
  safeBanner: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(52,199,89,0.1)', borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:'rgba(52,199,89,0.3)' },
  safeBannerText: { color:'#34C759', fontSize:13, fontWeight:'700' },
  zoneCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:16, marginBottom:12, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1 },
  zoneIcon: { width:52, height:52, borderRadius:14, justifyContent:'center', alignItems:'center' },
  zoneInfo: { flex:1 },
  zoneName: { color:'white', fontSize:14, fontWeight:'700', marginBottom:3 },
  zoneType: { fontSize:12, fontWeight:'600', marginBottom:3 },
  zoneReports: { color:'#555', fontSize:11 },
  navBtn: { width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center' },
  reportHero: { backgroundColor:'#1C1C1E', borderRadius:24, padding:28, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  reportOrb: { width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,224,51,0.15)', justifyContent:'center', alignItems:'center', marginBottom:14, borderWidth:2, borderColor:'rgba(255,224,51,0.3)' },
  reportTitle: { color:'white', fontSize:18, fontWeight:'900', marginBottom:6 },
  reportSub: { color:'#555', fontSize:12, textAlign:'center', lineHeight:18 },
  reportCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  reportLabel: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  dangerGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:20 },
  dangerBtn: { backgroundColor:'#111111', borderRadius:10, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:'#2C2C2E' },
  dangerBtnActive: { backgroundColor:'#FF3B30', borderColor:'#FF3B30' },
  dangerBtnText: { color:'#555', fontSize:12, fontWeight:'600' },
  dangerBtnTextActive: { color:'white' },
  submitBtn: { backgroundColor:'#FFE033', borderRadius:14, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  submitBtnText: { color:'#111', fontSize:15, fontWeight:'800' },
});
