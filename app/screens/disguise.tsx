import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SECRET_CODE = '1234';

export default function DisguiseScreen() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const router = useRouter();

  const handlePress = (val) => {
    if (val === '=') {
      if (input === SECRET_CODE) {
        Vibration.vibrate([100, 100, 100]);
        setUnlocked(true);
      } else {
        try {
          const result = eval(input.replace('×', '*').replace('÷', '/'));
          setInput(String(result));
        } catch { setInput('Error'); }
      }
      return;
    }
    if (val === 'C') { setInput(''); return; }
    if (val === '⌫') { setInput(prev => prev.slice(0, -1)); return; }
    setInput(prev => prev + val);
  };

  const buttons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '00', '='],
  ];

  if (unlocked) {
    return (
      <SafeAreaView style={s.unlockedContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#111111" />
        <View style={s.unlockedCard}>
          <Ionicons name="shield-checkmark" size={60} color="#FFE033" />
          <Text style={s.unlockedTitle}>SafeShield Unlocked!</Text>
          <Text style={s.unlockedSub}>Welcome back. You are protected.</Text>
          <View style={s.unlockedStats}>
            {[['checkmark-circle-outline', 'AI Active', '#34C759'], ['location-outline', 'GPS On', '#007AFF'], ['mail-outline', 'Alerts Ready', '#FF9500']].map(([icon, label, color], i) => (
              <View key={i} style={s.unlockedStat}>
                <Ionicons name={icon as any} size={28} color={color} />
                <Text style={s.unlockedStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.lockBtn} onPress={() => { setUnlocked(false); setInput(''); }}>
            <Ionicons name="lock-closed-outline" size={18} color="#111" />
            <Text style={s.lockBtnText}>Lock App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={s.display}>
        <Text style={s.displayHint}>Calculator</Text>
        <Text style={s.displayText} numberOfLines={1} adjustsFontSizeToFit>{input || '0'}</Text>
      </View>
      <View style={s.buttons}>
        {buttons.map((row, i) => (
          <View key={i} style={s.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[s.btn, btn === '=' && s.btnEquals, (btn === 'C' || btn === '⌫' || btn === '%') && s.btnGray, (btn === '÷' || btn === '×' || btn === '-' || btn === '+') && s.btnOrange]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={[s.btnText, (btn === 'C' || btn === '⌫' || btn === '%') && s.btnTextDark]}>{btn}</Text>
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
  hint: { color:'#333', fontSize:11, textAlign:'center', padding:8 },
  unlockedContainer: { flex:1, backgroundColor:'#111111', justifyContent:'center', padding:20 },
  unlockedCard: { backgroundColor:'#1C1C1E', borderRadius:28, padding:36, alignItems:'center', borderWidth:1, borderColor:'#FFE03344' },
  unlockedTitle: { color:'white', fontSize:24, fontWeight:'800', marginBottom:8, marginTop:16 },
  unlockedSub: { color:'#555', fontSize:14, marginBottom:28 },
  unlockedStats: { flexDirection:'row', gap:24, marginBottom:28 },
  unlockedStat: { alignItems:'center', gap:6 },
  unlockedStatLabel: { color:'#666', fontSize:12 },
  lockBtn: { backgroundColor:'#FFE033', borderRadius:14, paddingHorizontal:28, paddingVertical:14, flexDirection:'row', alignItems:'center', gap:8 },
  lockBtnText: { color:'#111', fontSize:15, fontWeight:'700' },
});
