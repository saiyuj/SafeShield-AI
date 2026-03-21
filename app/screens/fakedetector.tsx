import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RED_FLAGS = ['too perfect photos', 'few friends', 'new account', 'asks money', 'avoids video call', 'rushed relationship', 'different timezone', 'inconsistent stories'];

export default function FakeDetectorScreen() {
  const router = useRouter();
  const [profileName, setProfileName] = useState('');
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [result, setResult] = useState(null);

  const toggleFlag = (flag) => {
    setSelectedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  const analyzeProfile = () => {
    if (!profileName) { Alert.alert('Please enter a profile name'); return; }
    const score = selectedFlags.length;
    let risk, color, message, icon;
    if (score >= 5) {
      risk = 'HIGH RISK'; color = '#FF3B30'; icon = 'warning';
      message = 'This profile shows multiple signs of being FAKE! Do NOT share personal information. Block and report immediately.';
    } else if (score >= 3) {
      risk = 'MEDIUM RISK'; color = '#FF9500'; icon = 'alert-circle';
      message = 'This profile shows some suspicious signs. Be very careful and do not share personal details.';
    } else if (score >= 1) {
      risk = 'LOW RISK'; color = '#FFE033'; icon = 'information-circle';
      message = 'A few minor red flags. Stay cautious and verify identity through video call before trusting.';
    } else {
      risk = 'LIKELY REAL'; color = '#34C759'; icon = 'checkmark-circle';
      message = 'No major red flags detected. But always stay cautious online!';
    }
    setResult({ risk, color, message, icon, score });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fake Profile Detector</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.heroCard}>
          <Ionicons name="search-outline" size={40} color="#FFE033" />
          <Text style={s.heroTitle}>Detect Fake Profiles</Text>
          <Text style={s.heroSub}>Check if a social media profile is fake before trusting them</Text>
        </View>

        <View style={s.inputCard}>
          <Text style={s.inputLabel}>PROFILE NAME / USERNAME</Text>
          <TextInput style={s.input} value={profileName} onChangeText={setProfileName} placeholder="Enter profile name..." placeholderTextColor="#444" />
        </View>

        <View style={s.flagsCard}>
          <Text style={s.flagsTitle}>SELECT RED FLAGS YOU NOTICED</Text>
          <Text style={s.flagsSub}>Tap all that apply to this profile</Text>
          <View style={s.flagsGrid}>
            {RED_FLAGS.map((flag, i) => (
              <TouchableOpacity key={i} style={[s.flagBtn, selectedFlags.includes(flag) && s.flagBtnActive]} onPress={() => toggleFlag(flag)}>
                <Ionicons name={selectedFlags.includes(flag) ? "checkmark-circle" : "ellipse-outline"} size={16} color={selectedFlags.includes(flag) ? 'white' : '#555'} />
                <Text style={[s.flagBtnText, selectedFlags.includes(flag) && s.flagBtnTextActive]}>{flag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.analyzeBtn} onPress={analyzeProfile} activeOpacity={0.8}>
          <Ionicons name="analytics-outline" size={20} color="#111" />
          <Text style={s.analyzeBtnText}>Analyze Profile</Text>
        </TouchableOpacity>

        {result && (
          <View style={[s.resultCard, { borderColor: result.color + '44' }]}>
            <Ionicons name={result.icon as any} size={48} color={result.color} />
            <Text style={[s.resultRisk, { color: result.color }]}>{result.risk}</Text>
            <Text style={s.resultScore}>{result.score} red flags detected</Text>
            <Text style={s.resultMessage}>{result.message}</Text>
            {result.score >= 3 && (
              <TouchableOpacity style={[s.reportBtn, { backgroundColor: result.color }]} onPress={() => Alert.alert('Report Submitted!', 'This profile has been reported to platform moderators.')}>
                <Text style={s.reportBtnText}>Report This Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>ONLINE SAFETY TIPS</Text>
          {['Never share your address with strangers online', 'Always verify identity via video call', 'Don\'t send money to people you haven\'t met', 'Trust your gut — if something feels wrong, it is', 'Report suspicious profiles immediately'].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#FFE033" />
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
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:16, paddingBottom:100 },
  heroCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:24, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  heroTitle: { color:'white', fontSize:18, fontWeight:'900', marginBottom:6, marginTop:12 },
  heroSub: { color:'#555', fontSize:13, textAlign:'center' },
  inputCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  inputLabel: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  input: { backgroundColor:'#111111', borderRadius:12, padding:14, color:'white', fontSize:14, borderWidth:1, borderColor:'#2C2C2E' },
  flagsCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  flagsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:6 },
  flagsSub: { color:'#444', fontSize:12, marginBottom:14 },
  flagsGrid: { gap:8 },
  flagBtn: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#111111', borderRadius:12, padding:14, borderWidth:1, borderColor:'#2C2C2E' },
  flagBtnActive: { backgroundColor:'#FF3B30', borderColor:'#FF3B30' },
  flagBtnText: { color:'#555', fontSize:13, flex:1 },
  flagBtnTextActive: { color:'white' },
  analyzeBtn: { backgroundColor:'#FFE033', borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 },
  analyzeBtnText: { color:'#111', fontSize:16, fontWeight:'800' },
  resultCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:24, marginBottom:16, alignItems:'center', borderWidth:1.5 },
  resultRisk: { fontSize:22, fontWeight:'900', letterSpacing:1, marginTop:12, marginBottom:6 },
  resultScore: { color:'#666', fontSize:13, marginBottom:12 },
  resultMessage: { color:'#888', fontSize:13, textAlign:'center', lineHeight:20, marginBottom:16 },
  reportBtn: { borderRadius:12, paddingHorizontal:20, paddingVertical:12 },
  reportBtnText: { color:'white', fontSize:14, fontWeight:'700' },
  tipsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  tipsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  tipRow: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
  tipText: { color:'#888', fontSize:13, flex:1, lineHeight:18 },
});
