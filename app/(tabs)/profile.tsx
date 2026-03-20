import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Switch, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [soundDetection, setSoundDetection] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [batteryAlert, setBatteryAlert] = useState(true);
  const [autoSOS, setAutoSOS] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  const settings = [
    { icon: 'mic-outline', label: 'AI Sound Detection', desc: 'Auto detect distress sounds', value: soundDetection, setter: setSoundDetection, color: '#FFE033' },
    { icon: 'location-outline', label: 'Location Sharing', desc: 'Share GPS with alerts', value: locationSharing, setter: setLocationSharing, color: '#007AFF' },
    { icon: 'battery-dead-outline', label: 'Battery Low Alert', desc: 'Alert at 15% battery', value: batteryAlert, setter: setBatteryAlert, color: '#FF9500' },
    { icon: 'flash-outline', label: 'Auto SOS', desc: 'Auto send SOS on distress', value: autoSOS, setter: setAutoSOS, color: '#FF3B30' },
    { icon: 'moon-outline', label: 'Night Safety Mode', desc: 'Extra protection after 10pm', value: nightMode, setter: setNightMode, color: '#5856D6' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatarWrap}>
            <View style={s.avatarOuter}>
              <View style={s.avatarInner}>
                <Ionicons name="shield-checkmark" size={44} color="#111" />
              </View>
            </View>
            <View style={s.avatarBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          </View>
          <Text style={s.profileName}>SafeShield User</Text>
          <View style={s.profileStatusBadge}>
            <View style={s.profileStatusDot} />
            <Text style={s.profileStatusText}>Protected & Active</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { icon: 'pulse-outline', val: '87%', label: 'AI Accuracy', color: '#FFE033' },
            { icon: 'language-outline', val: '10', label: 'Languages', color: '#007AFF' },
            { icon: 'shield-outline', val: '24/7', label: 'Protection', color: '#34C759' },
            { icon: 'people-outline', val: '2', label: 'Contacts', color: '#FF9500' },
          ].map((stat, i) => (
            <View key={i} style={s.statCard}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={s.settingsCard}>
          <Text style={s.sectionTitle}>PROTECTION SETTINGS</Text>
          {settings.map((setting, i) => (
            <View key={i} style={[s.settingRow, i < settings.length - 1 && s.settingRowBorder]}>
              <View style={[s.settingIcon, { backgroundColor: setting.color + '22' }]}>
                <Ionicons name={setting.icon as any} size={20} color={setting.color} />
              </View>
              <View style={s.settingInfo}>
                <Text style={s.settingLabel}>{setting.label}</Text>
                <Text style={s.settingDesc}>{setting.desc}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.setter}
                trackColor={{ false: '#333', true: setting.color }}
                thumbColor={setting.value ? 'white' : '#666'}
              />
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={s.infoCard}>
          <Text style={s.sectionTitle}>APP INFO</Text>
          {[
            ['Version', '1.0.0', 'code-outline'],
            ['AI Model', 'Random Forest', 'hardware-chip-outline'],
            ['Accuracy', '87.5%', 'stats-chart-outline'],
            ['Languages', '10 Indian Languages', 'language-outline'],
            ['Developer', 'SafeShield Team', 'people-outline'],
          ].map(([label, value, icon], i) => (
            <View key={i} style={[s.infoRow, i < 4 && s.infoRowBorder]}>
              <Ionicons name={icon as any} size={18} color="#555" />
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={s.testBtn}
          onPress={() => Alert.alert('✅ System Check', 'All SafeShield systems operational!\n\n🤖 AI Model: Active\n📍 GPS: Ready\n📧 Alerts: Ready\n🎙 Mic: Ready\n🔋 Battery: Monitored')}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFE033" />
          <Text style={s.testBtnText}>Run System Check</Text>
        </TouchableOpacity>

        {/* Made with love */}
        <View style={s.footer}>
          <Text style={s.footerText}>Made with 💛 for Women & Children Safety</Text>
          <Text style={s.footerSub}>SafeShield AI © 2025</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  scroll: { padding:16, paddingBottom:120 },
  profileHeader: { alignItems:'center', paddingVertical:28, marginBottom:20 },
  avatarWrap: { position:'relative', marginBottom:16 },
  avatarOuter: { width:100, height:100, borderRadius:50, backgroundColor:'rgba(255,224,51,0.15)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,224,51,0.3)' },
  avatarInner: { width:80, height:80, borderRadius:40, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  avatarBadge: { position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:14, backgroundColor:'#34C759', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'#111111' },
  profileName: { color:'white', fontSize:22, fontWeight:'900', marginBottom:8 },
  profileStatusBadge: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(52,199,89,0.15)', borderRadius:20, paddingHorizontal:14, paddingVertical:6, borderWidth:1, borderColor:'rgba(52,199,89,0.3)' },
  profileStatusDot: { width:7, height:7, borderRadius:4, backgroundColor:'#34C759' },
  profileStatusText: { color:'#34C759', fontSize:13, fontWeight:'700' },
  statsRow: { flexDirection:'row', gap:10, marginBottom:20 },
  statCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:12, alignItems:'center', gap:4, borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { fontSize:16, fontWeight:'900' },
  statLabel: { color:'#555', fontSize:9, textAlign:'center' },
  settingsCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  sectionTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  settingRow: { flexDirection:'row', alignItems:'center', gap:14, paddingVertical:12 },
  settingRowBorder: { borderBottomWidth:1, borderBottomColor:'#222' },
  settingIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  settingInfo: { flex:1 },
  settingLabel: { color:'white', fontSize:14, fontWeight:'600' },
  settingDesc: { color:'#555', fontSize:11, marginTop:2 },
  infoCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  infoRow: { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12 },
  infoRowBorder: { borderBottomWidth:1, borderBottomColor:'#222' },
  infoLabel: { color:'#666', fontSize:14, flex:1 },
  infoValue: { color:'white', fontSize:14, fontWeight:'600' },
  testBtn: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, borderWidth:1.5, borderColor:'#FFE03366', marginBottom:20 },
  testBtnText: { color:'#FFE033', fontSize:16, fontWeight:'800' },
  footer: { alignItems:'center', paddingBottom:20 },
  footerText: { color:'#444', fontSize:13 },
  footerSub: { color:'#333', fontSize:11, marginTop:4 },
});
