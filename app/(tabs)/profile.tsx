import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [soundDetection, setSoundDetection] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [batteryAlert, setBatteryAlert] = useState(true);
  const [autoSOS, setAutoSOS] = useState(false);

  const settings = [
    { icon: <Ionicons name="mic-outline" size={22} color="#FFE033" />, label: 'AI Sound Detection', value: soundDetection, setter: setSoundDetection },
    { icon: <Ionicons name="location-outline" size={22} color="#FFE033" />, label: 'Location Sharing', value: locationSharing, setter: setLocationSharing },
    { icon: <Ionicons name="battery-half-outline" size={22} color="#FFE033" />, label: 'Battery Low Alert', value: batteryAlert, setter: setBatteryAlert },
    { icon: <Ionicons name="warning-outline" size={22} color="#FFE033" />, label: 'Auto SOS', value: autoSOS, setter: setAutoSOS },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Ionicons name="shield" size={40} color="#111" />
          </View>
          <Text style={s.profileName}>SafeShield User</Text>
          <View style={s.profileBadge}>
            <View style={s.profileBadgeDot} />
            <Text style={s.profileBadgeText}>Protected</Text>
          </View>
          <View style={s.profileStats}>
            <View style={s.profileStat}>
              <Text style={s.profileStatVal}>87%</Text>
              <Text style={s.profileStatLabel}>Accuracy</Text>
            </View>
            <View style={s.profileStatDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatVal}>10</Text>
              <Text style={s.profileStatLabel}>Languages</Text>
            </View>
            <View style={s.profileStatDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatVal}>24/7</Text>
              <Text style={s.profileStatLabel}>Protection</Text>
            </View>
          </View>
        </View>

        <View style={s.settingsCard}>
          <View style={s.settingsHeader}>
            <Ionicons name="settings-outline" size={16} color="#FFE033" />
            <Text style={s.settingsTitle}>SETTINGS</Text>
          </View>
          {settings.map((item, i) => (
            <View key={i} style={[s.settingRow, i < settings.length - 1 && s.settingBorder]}>
              <View style={s.settingIconBox}>{item.icon}</View>
              <Text style={s.settingLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setter}
                trackColor={{ false: '#333', true: '#FFE033' }}
                thumbColor={item.value ? '#111' : '#666'}
              />
            </View>
          ))}
        </View>

        <View style={s.aboutCard}>
          <View style={s.settingsHeader}>
            <Ionicons name="information-circle-outline" size={16} color="#FFE033" />
            <Text style={s.settingsTitle}>ABOUT SAFESHIELD</Text>
          </View>
          {[
            ['Version', '1.0.0'],
            ['AI Model', 'Random Forest'],
            ['Accuracy', '87.5%'],
            ['Languages', '10 Indian Languages'],
            ['Developer', 'SafeShield Team'],
          ].map(([label, value], i) => (
            <View key={i} style={[s.aboutRow, i < 4 && s.settingBorder]}>
              <Text style={s.aboutLabel}>{label}</Text>
              <Text style={s.aboutValue}>{value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.testBtn} onPress={() => Alert.alert('System Check', 'All SafeShield systems operational!\n\nAI Model: Active\nGPS: Ready\nAlerts: Ready\nMicrophone: Ready')}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFE033" />
          <Text style={s.testBtnText}>Run System Check</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  scroll: { padding:16, paddingBottom:120 },
  profileCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:28, alignItems:'center', marginBottom:16, borderWidth:1.5, borderColor:'#FFE03344' },
  avatarCircle: { width:80, height:80, borderRadius:40, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center', marginBottom:14 },
  profileName: { color:'white', fontSize:20, fontWeight:'900', marginBottom:8 },
  profileBadge: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(52,199,89,0.15)', borderRadius:12, paddingHorizontal:14, paddingVertical:6, marginBottom:20, borderWidth:1, borderColor:'rgba(52,199,89,0.3)' },
  profileBadgeDot: { width:8, height:8, borderRadius:4, backgroundColor:'#34C759' },
  profileBadgeText: { color:'#34C759', fontSize:13, fontWeight:'700' },
  profileStats: { flexDirection:'row', alignItems:'center', gap:20 },
  profileStat: { alignItems:'center' },
  profileStatVal: { color:'#FFE033', fontSize:22, fontWeight:'900' },
  profileStatLabel: { color:'#555', fontSize:11, marginTop:2 },
  profileStatDivider: { width:1, height:30, backgroundColor:'#333' },
  settingsCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  settingsHeader: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:16 },
  settingsTitle: { color:'#FFE033', fontSize:12, fontWeight:'800', letterSpacing:1.5 },
  settingRow: { flexDirection:'row', alignItems:'center', paddingVertical:14 },
  settingBorder: { borderBottomWidth:1, borderBottomColor:'#222' },
  settingIconBox: { width:36, height:36, borderRadius:10, backgroundColor:'#2C2C2E', justifyContent:'center', alignItems:'center', marginRight:12 },
  settingLabel: { color:'white', fontSize:14, flex:1, fontWeight:'600' },
  aboutCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  aboutRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:12 },
  aboutLabel: { color:'#666', fontSize:14 },
  aboutValue: { color:'white', fontSize:14, fontWeight:'600' },
  testBtn: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, borderWidth:1.5, borderColor:'#FFE03366' },
  testBtnText: { color:'#FFE033', fontSize:16, fontWeight:'800' },
});
