import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProtectScreen() {
  const router = useRouter();

  const features = [
    { icon: 'walk-outline', title: 'Safe Walk', desc: 'Continuous monitoring while walking', color: '#34C759', screen: 'screens/safewalk' },
    { icon: 'ear-outline', title: 'Voice Keywords', desc: 'Detects distress in 10 languages', color: '#FF9500', screen: 'screens/keywords' },
    { icon: 'mic-outline', title: 'Voice Stress', desc: 'Detects fear in your voice', color: '#FF2D55', screen: 'screens/stress' },
    { icon: 'people-outline', title: 'Crowd Safety', desc: 'Analyzes surrounding sounds', color: '#5856D6', screen: 'screens/crowd' },
    { icon: 'camera-outline', title: 'Evidence Capture', desc: 'Secretly capture photo evidence', color: '#007AFF', screen: 'screens/selfie' },
    { icon: 'call-outline', title: 'Fake Call', desc: 'Escape danger with fake call', color: '#30B0C7', screen: 'screens/fakecall' },
    { icon: 'calculator-outline', title: 'Disguise Mode', desc: 'App looks like calculator', color: '#FFE033', screen: 'screens/disguise' },
    { icon: 'flash-outline', title: 'Safety Features', desc: 'Shake SOS, location, night mode', color: '#FF3B30', screen: 'screens/safetyfeatures' },
    { icon: 'happy-outline', title: 'SafeShield Junior', desc: 'Children safety system', color: '#FF2D55', screen: 'screens/junior' },
    { icon: 'chatbubble-ellipses-outline', title: 'AI Support Chat', desc: 'Emotional support 24/7', color: '#34C759', screen: 'screens/aichat' },
    { icon: 'map-outline', title: 'Safety Map', desc: 'Community danger zones', color: '#FF9500', screen: 'screens/safetymap' },
    { icon: 'heart-outline', title: 'Health & Safety', desc: 'Period tracker & medical SOS', color: '#FF2D55', screen: 'screens/health' },
    { icon: 'person-outline', title: 'Fake Detector', desc: 'Detect fake social profiles', color: '#5856D6', screen: 'screens/fakedetector' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Protection Suite</Text>
        <Text style={s.headerSub}>All your safety tools in one place</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.grid}>
          {features.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[s.featureCard, { borderColor: f.color + '44' }]}
              onPress={() => router.push(f.screen as any)}
              activeOpacity={0.8}
            >
              <View style={[s.featureIconBox, { backgroundColor: f.color + '22' }]}>
                <Ionicons name={f.icon as any} size={26} color={f.color} />
              </View>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureSub}>{f.desc}</Text>
              <View style={[s.arrow, { backgroundColor: f.color }]}>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </View>
            </TouchableOpacity>
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
  grid: { flexDirection:'row', flexWrap:'wrap', gap:12 },
  featureCard: { width:'47%', backgroundColor:'#1C1C1E', borderRadius:22, padding:18, borderWidth:1.5 },
  featureIconBox: { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center', marginBottom:12 },
  featureTitle: { color:'white', fontSize:14, fontWeight:'800', marginBottom:4 },
  featureSub: { color:'#555', fontSize:11, lineHeight:16, marginBottom:12 },
  arrow: { width:28, height:28, borderRadius:14, justifyContent:'center', alignItems:'center', alignSelf:'flex-end' },
});
