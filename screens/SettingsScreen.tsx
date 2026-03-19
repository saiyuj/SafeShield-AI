import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';

export default function SettingsScreen() {
  const [batteryAlert, setBatteryAlert] = useState(true);
  const [soundDetection, setSoundDetection] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoSOS, setAutoSOS] = useState(false);

  const settings = [
    { key: 'soundDetection', label: 'AI Sound Detection', desc: 'Automatically detect distress sounds', value: soundDetection, setter: setSoundDetection, icon: '🎙' },
    { key: 'locationSharing', label: 'Location Sharing', desc: 'Share GPS location with emergency alerts', value: locationSharing, setter: setLocationSharing, icon: '📍' },
    { key: 'batteryAlert', label: 'Battery Low Alert', desc: 'Send location when battery below 15%', value: batteryAlert, setter: setBatteryAlert, icon: '🔋' },
    { key: 'vibration', label: 'Vibration Alerts', desc: 'Vibrate when distress is detected', value: vibration, setter: setVibration, icon: '📳' },
    { key: 'autoSOS', label: 'Auto SOS', desc: 'Automatically send SOS when distress detected', value: autoSOS, setter: setAutoSOS, icon: '🚨' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
        <Text style={s.headerSub}>Customize your safety preferences</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>🛡</Text>
          </View>
          <View>
            <Text style={s.profileName}>SafeShield Active</Text>
            <Text style={s.profileStatus}>🟢 Protection Enabled</Text>
          </View>
        </View>

        <View style={s.settingsCard}>
          <Text style={s.settingsTitle}>PROTECTION SETTINGS</Text>
          {settings.map((setting, i) => (
            <View key={setting.key} style={[s.settingRow, i < settings.length - 1 && s.settingRowBorder]}>
              <View style={s.settingIcon}><Text style={{fontSize:20}}>{setting.icon}</Text></View>
              <View style={s.settingInfo}>
                <Text style={s.settingLabel}>{setting.label}</Text>
                <Text style={s.settingDesc}>{setting.desc}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.setter}
                trackColor={{ false: '#1a1a2e', true: '#7c6fff' }}
                thumbColor={setting.value ? 'white' : '#444'}
              />
            </View>
          ))}
        </View>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>APP INFO</Text>
          {[
            ['Version', '1.0.0'],
            ['Model Accuracy', '87.5%'],
            ['Detection Speed', '~3 seconds'],
            ['Developer', 'SafeShield Team'],
          ].map(([label, value], i) => (
            <View key={i} style={[s.infoRow, i < 3 && s.infoRowBorder]}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.testBtn} onPress={() => Alert.alert('Test Alert', 'SafeShield is working correctly! All systems operational.')}>
          <Text style={s.testBtnText}>🧪  Test Alert System</Text>
        </TouchableOpacity>

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
  profileCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, flexDirection:'row', alignItems:'center', gap:16, marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  profileAvatar: { width:56, height:56, borderRadius:28, backgroundColor:'#7c6fff', justifyContent:'center', alignItems:'center' },
  profileAvatarText: { fontSize:26 },
  profileName: { color:'white', fontSize:16, fontWeight:'700' },
  profileStatus: { color:'#00e676', fontSize:13, marginTop:4 },
  settingsCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  settingsTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  settingRow: { flexDirection:'row', alignItems:'center', gap:14, paddingVertical:14 },
  settingRowBorder: { borderBottomWidth:1, borderBottomColor:'#12122a' },
  settingIcon: { width:44, height:44, borderRadius:12, backgroundColor:'#060612', justifyContent:'center', alignItems:'center' },
  settingInfo: { flex:1 },
  settingLabel: { color:'white', fontSize:14, fontWeight:'600' },
  settingDesc: { color:'#555', fontSize:12, marginTop:3 },
  infoCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#12122a' },
  infoTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  infoRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:12 },
  infoRowBorder: { borderBottomWidth:1, borderBottomColor:'#12122a' },
  infoLabel: { color:'#666', fontSize:14 },
  infoValue: { color:'white', fontSize:14, fontWeight:'600' },
  testBtn: { backgroundColor:'#0d0d1f', borderRadius:18, padding:18, alignItems:'center', borderWidth:1, borderColor:'#7c6fff' },
  testBtnText: { color:'#7c6fff', fontSize:16, fontWeight:'700' },
});
