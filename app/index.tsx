import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Vibration } from 'react-native';
import { useRouter } from 'expo-router';

const SECRET_CODE = '1234';

export default function AppEntry() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handlePress = (val) => {
    if (val === '=') {
      if (input === SECRET_CODE) {
        Vibration.vibrate([100, 100, 100]);
        router.replace('/(tabs)');
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

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={s.display}>
        <Text style={s.displayHint}>Calculator</Text>
        <Text style={s.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {input || '0'}
        </Text>
      </View>
      <View style={s.buttons}>
        {buttons.map((row, i) => (
          <View key={i} style={s.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  s.btn,
                  btn === '=' && s.btnEquals,
                  (btn === 'C' || btn === '⌫' || btn === '%') && s.btnGray,
                  (btn === '÷' || btn === '×' || btn === '-' || btn === '+') && s.btnOrange,
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={[
                  s.btnText,
                  (btn === 'C' || btn === '⌫' || btn === '%') && s.btnTextDark,
                  btn === '=' && s.btnTextDark,
                ]}>
                  {btn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <Text style={s.hint}>Type 1234= to unlock</Text>
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
  hint: { color:'#222', fontSize:11, textAlign:'center', padding:8 },
});
