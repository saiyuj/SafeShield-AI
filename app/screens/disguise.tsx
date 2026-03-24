import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Vibration, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SECRET_CODE = '1234';

export default function DisguiseScreen() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const router = useRouter();

  const handlePress = (val: string) => {
    if (val === '=') {
      if (input === SECRET_CODE) {
        Vibration.vibrate([100, 100, 100]);
        setUnlocked(true);
      } else {
        try {
          const result = eval(input.replace('×','*').replace('÷','/'));
          setInput(String(isNaN(result) ? 'Error' : result));
        } catch { setInput('Error'); }
      }
      return;
    }
    if (val === 'C') { setInput(''); return; }
    if (val === '⌫') { setInput(prev => prev.slice(0,-1)); return; }
    if (input === 'Error') { setInput(val); return; }
    setInput(prev => prev + val);
  };

  const buttons = [
    ['C','⌫','%','÷'],
    ['7','8','9','×'],
    ['4','5','6','-'],
    ['1','2','3','+'],
    ['0','.','00','='],
  ];

  if (unlocked) {
    return (
      <SafeAreaView style={u.container}>
        <View style={u.header}>
          <Ionicons name="shield-checkmark" size={32} color="#FFE033" />
          <Text style={u.headerTitle}>SafeShield Active</Text>
          <TouchableOpacity onPress={() => { setUnlocked(false); setInput(''); }}>
            <Ionicons name="lock-closed-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={u.sosBtn} onPress={() => Alert.alert('🚨 SOS SENT!', 'Emergency contacts notified with your location!\nHelp is on the way. Stay calm.', [{ text: 'OK' }])} activeOpacity={0.85}>
          <Text style={u.sosBtnText}>SOS</Text>
          <Text style={u.sosBtnSub}>Tap to send emergency alert</Text>
        </TouchableOpacity>

        <View style={u.actionsGrid}>
          {[
            { icon:'call-outline', title:'Call 112', desc:'National Emergency', color:'#FF3B30', action: () => Linking.openURL('tel:112') },
            { icon:'woman-outline', title:'Call 1091', desc:'Women Helpline', color:'#FF9500', action: () => Linking.openURL('tel:1091') },
            { icon:'mic-outline', title:'AI Detect', desc:'Analyze sounds', color:'#FFE033', action: () => { setUnlocked(false); router.push('screens/stress' as any); } },
            { icon:'camera-outline', title:'Evidence', desc:'Capture photo', color:'#007AFF', action: () => { setUnlocked(false); router.push('screens/selfie' as any); } },
          ].map((item,i) => (
            <TouchableOpacity key={i} style={[u.actionCard, { borderColor: item.color+'44' }]} onPress={item.action} activeOpacity={0.8}>
              <View style={[u.actionIcon, { backgroundColor: item.color+'22' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={u.actionTitle}>{item.title}</Text>
              <Text style={u.actionDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={u.statusCard}>
          <Text style={u.statusTitle}>SYSTEM STATUS</Text>
          {[
            ['shield-checkmark-outline','AI Protection','Active','#34C759'],
            ['location-outline','GPS Tracking','Ready','#007AFF'],
            ['mail-outline','Email Alerts','Ready','#FF9500'],
          ].map(([icon,label,status,color],i) => (
            <View key={i} style={u.statusRow}>
              <Ionicons name={icon as any} size={20} color={color} />
              <Text style={u.statusLabel}>{label}</Text>
              <Text style={[u.statusValue, { color }]}>{status}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.display}>
        <Text style={s.displayHint}>Calculator</Text>
        <Text style={s.displayText} numberOfLines={1} adjustsFontSizeToFit>{input || '0'}</Text>
      </View>
      <View style={s.buttons}>
        {buttons.map((row, i) => (
          <View key={i} style={s.row}>
            {row.map(btn => (
              <TouchableOpacity
                key={btn}
                style={[s.btn,
                  btn==='=' && s.btnEquals,
                  (btn==='C'||btn==='⌫'||btn==='%') && s.btnGray,
                  (btn==='÷'||btn==='×'||btn==='-'||btn==='+') && s.btnOrange,
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={[s.btnText, (btn==='C'||btn==='⌫'||btn==='%') && s.btnTextDark]}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <Text style={s.hint}>Type 1234= to unlock SafeShield</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#1a1a1a' },
  display: { flex:1, justifyContent:'flex-end', padding:24, paddingBottom:16 },
  displayHint: { color:'#555', fontSize:14, marginBottom:8 },
  displayText: { color:'white', fontSize:64, fontWeight:'300', textAlign:'right' },
  buttons: { padding:12, gap:10 },
  row: { flexDirection:'row', gap:10 },
  btn: { flex:1, aspectRatio:1, borderRadius:999, backgroundColor:'#333', justifyContent:'center', alignItems:'center' },
  btnEquals: { backgroundColor:'#FFE033' },
  btnGray: { backgroundColor:'#a5a5a5' },
  btnOrange: { backgroundColor:'#FF9500' },
  btnText: { color:'white', fontSize:28, fontWeight:'400' },
  btnTextDark: { color:'black' },
  hint: { color:'#333', fontSize:11, textAlign:'center', padding:8, paddingBottom:16 },
});

const u = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:20, borderBottomWidth:1, borderBottomColor:'#222' },
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  sosBtn: { margin:20, backgroundColor:'#FF3B30', borderRadius:24, padding:28, alignItems:'center', borderWidth:3, borderColor:'#FF6B6B' },
  sosBtnText: { color:'white', fontSize:52, fontWeight:'900', letterSpacing:4 },
  sosBtnSub: { color:'rgba(255,255,255,0.7)', fontSize:13, marginTop:6 },
  actionsGrid: { flexDirection:'row', flexWrap:'wrap', gap:12, paddingHorizontal:20, marginBottom:20 },
  actionCard: { width:'47%', backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1 },
  actionIcon: { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center', marginBottom:12 },
  actionTitle: { color:'white', fontSize:14, fontWeight:'800', marginBottom:4 },
  actionDesc: { color:'#555', fontSize:12 },
  statusCard: { marginHorizontal:20, backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  statusTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  statusRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  statusLabel: { color:'#888', fontSize:14, flex:1 },
  statusValue: { fontSize:13, fontWeight:'700' },
});
