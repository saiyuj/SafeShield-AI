import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ToolsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Safety Tools</Text>
        <Text style={s.headerSub}>Smart tools to keep you safe</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {[
          { icon: 'calculator-outline', title: 'Disguise Mode', desc: 'App looks like a calculator. Type 1234= to unlock SafeShield secretly.', badge: 'UNIQUE FEATURE', color: '#FFE033', screen: 'screens/disguise' },
          { icon: 'call-outline', title: 'Fake Call', desc: 'Get a fake incoming call to escape uncomfortable or dangerous situations.', badge: 'ESCAPE TOOL', color: '#30B0C7', screen: 'screens/fakecall' },
          { icon: 'camera-outline', title: 'Evidence Capture', desc: 'Secretly capture photos of threats as evidence for police reports.', badge: 'EVIDENCE TOOL', color: '#007AFF', screen: 'screens/selfie' },
        ].map((tool, i) => (
          <TouchableOpacity key={i} style={[s.toolCard, { borderColor: tool.color + '44' }]} onPress={() => router.push(tool.screen as any)} activeOpacity={0.8}>
            <View style={[s.toolIcon, { backgroundColor: tool.color + '22' }]}>
              <Ionicons name={tool.icon as any} size={36} color={tool.color} />
            </View>
            <View style={s.toolInfo}>
              <Text style={s.toolTitle}>{tool.title}</Text>
              <Text style={s.toolDesc}>{tool.desc}</Text>
              <View style={[s.toolBadge, { backgroundColor: tool.color + '22', borderColor: tool.color + '44' }]}>
                <Text style={[s.toolBadgeText, { color: tool.color }]}>{tool.badge}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={s.emergencyCard}>
          <Text style={s.emergencyTitle}>Emergency Numbers</Text>
          {[
            ['shield-outline', 'Police', '100'],
            ['medkit-outline', 'Ambulance', '108'],
            ['woman-outline', 'Women Helpline', '1091'],
            ['alert-circle-outline', 'National Emergency', '112'],
            ['happy-outline', 'Child Helpline', '1098'],
          ].map(([icon, label, number], i) => (
            <View key={i} style={s.emergencyRow}>
              <Ionicons name={icon as any} size={22} color="#FFE033" />
              <Text style={s.emergencyLabel}>{label}</Text>
              <View style={s.emergencyNumberBadge}>
                <Text style={s.emergencyNumber}>{number}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#222' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'900' },
  headerSub: { color:'#555', fontSize:13, marginTop:4 },
  scroll: { padding:16, paddingBottom:120 },
  toolCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:14, flexDirection:'row', gap:16, borderWidth:1.5 },
  toolIcon: { width:70, height:70, borderRadius:20, justifyContent:'center', alignItems:'center' },
  toolInfo: { flex:1 },
  toolTitle: { color:'white', fontSize:16, fontWeight:'800', marginBottom:6 },
  toolDesc: { color:'#666', fontSize:13, lineHeight:18, marginBottom:10 },
  toolBadge: { borderRadius:8, paddingHorizontal:10, paddingVertical:4, alignSelf:'flex-start', borderWidth:1 },
  toolBadgeText: { fontSize:10, fontWeight:'800', letterSpacing:1 },
  emergencyCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, borderWidth:1.5, borderColor:'#FF3B3044' },
  emergencyTitle: { color:'white', fontSize:16, fontWeight:'800', marginBottom:16 },
  emergencyRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  emergencyLabel: { color:'#aaa', fontSize:14, flex:1 },
  emergencyNumberBadge: { backgroundColor:'#FF3B3022', borderRadius:10, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#FF3B3044' },
  emergencyNumber: { color:'#FF3B30', fontSize:16, fontWeight:'900' },
});
