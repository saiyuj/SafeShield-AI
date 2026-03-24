import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RESPONSES = {
  sad: { msg: "I'm really sorry you're feeling sad 💛 It's okay to feel this way. Would you like to talk about what's bothering you? Remember, you're not alone.", color: '#007AFF' },
  scared: { msg: "It's okay to feel scared. You are brave for reaching out! 💪 If you're in immediate danger, please press the SOS button. Otherwise, tell me what's happening.", color: '#FF9500' },
  help: { msg: "I'm here to help you! 💛 If this is an emergency, press SOS immediately. For emotional support, I'm here to listen. What do you need?", color: '#34C759' },
  lonely: { msg: "Feeling lonely is really hard 💙 But remember - SafeShield is always here with you. Would you like me to connect you with a counselor?", color: '#5856D6' },
  bully: { msg: "Bullying is NEVER okay and it's not your fault! 🛡 You can anonymously report it in our SafeShield Junior section. Would you like me to take you there?", color: '#FF3B30' },
  unsafe: { msg: "Your safety is the priority! 🚨 If you feel unsafe right now, press the red SOS button immediately. I can also share your location with emergency contacts.", color: '#FF3B30' },
  stress: { msg: "Feeling stressed is normal but it shouldn't overwhelm you 💛 Try taking 5 deep breaths. In through nose for 4 counts, hold for 4, out for 4. Feel better?", color: '#FFE033' },
  abuse: { msg: "I believe you and I'm so sorry this is happening 💔 This is NOT your fault. Please know you can report this anonymously. Do you want me to help you report it?", color: '#FF2D55' },
  danger: { msg: "🚨 If you are in immediate danger, call 112 (Emergency) or 1091 (Women Helpline) RIGHT NOW. Stay calm. Go to a crowded place. Help is coming.", color: '#FF3B30' },
  default: { msg: "I'm SafeShield AI, your emotional support companion 💛 I'm here 24/7 to listen and help. You can tell me anything — I won't judge you. What's on your mind?", color: '#FFE033' },
};

const getResponse = (input) => {
  const lower = input.toLowerCase();
  if (lower.includes('danger') || lower.includes('attack') || lower.includes('kidnap')) return RESPONSES.danger;
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('upset') || lower.includes('depressed')) return RESPONSES.sad;
  if (lower.includes('scared') || lower.includes('fear') || lower.includes('afraid') || lower.includes('terrified')) return RESPONSES.scared;
  if (lower.includes('help') || lower.includes('please') || lower.includes('emergency')) return RESPONSES.help;
  if (lower.includes('lone') || lower.includes('alone') || lower.includes('nobody') || lower.includes('isolated')) return RESPONSES.lonely;
  if (lower.includes('bully') || lower.includes('hit') || lower.includes('tease') || lower.includes('harass')) return RESPONSES.bully;
  if (lower.includes('unsafe') || lower.includes('threat') || lower.includes('follow')) return RESPONSES.unsafe;
  if (lower.includes('stress') || lower.includes('anxious') || lower.includes('worried') || lower.includes('panic')) return RESPONSES.stress;
  if (lower.includes('abuse') || lower.includes('touch') || lower.includes('hurt') || lower.includes('molest')) return RESPONSES.abuse;
  return RESPONSES.default;
};

const quickReplies = ['I feel sad 😢', 'I need help 🆘', 'I am scared 😰', 'I am being bullied 😡', 'I feel unsafe ⚠️', 'I am stressed 😓', 'I am in danger 🚨'];

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm SafeShield AI 💛 I'm here to support you anytime, day or night. How are you feeling right now?", sender: 'ai', color: '#FFE033' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(Animated.sequence([
        Animated.timing(typingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])).start();
    } else {
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = (text = input) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), text, sender: 'user', color: '' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(text);
      const aiMsg = { id: Date.now() + 1, text: response.msg, sender: 'ai', color: response.color };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1200);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.aiAvatar}><Ionicons name="shield-checkmark" size={18} color="#111" /></View>
          <View>
            <Text style={s.headerTitle}>SafeShield AI</Text>
            <Text style={s.headerSub}>Always here for you 💛</Text>
          </View>
        </View>
        <View style={s.onlineDot} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={s.messages} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <View key={msg.id} style={[s.messageBubble, msg.sender === 'user' ? s.userBubble : s.aiBubble]}>
              {msg.sender === 'ai' && (
                <View style={[s.aiAvatarSmall, { backgroundColor: (msg.color || '#FFE033') + '33' }]}>
                  <Ionicons name="shield-checkmark" size={14} color={msg.color || '#FFE033'} />
                </View>
              )}
              <View style={[s.bubble, msg.sender === 'user' ? s.userBubbleInner : [s.aiBubbleInner, { borderColor: (msg.color || '#FFE033') + '55' }]]}>
                <Text style={[s.messageText, msg.sender === 'user' && s.userMessageText]}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[s.messageBubble, s.aiBubble]}>
              <View style={s.aiAvatarSmall}>
                <Ionicons name="shield-checkmark" size={14} color="#FFE033" />
              </View>
              <View style={s.typingBubble}>
                {[0,1,2].map(i => (
                  <Animated.View key={i} style={[s.typingDot, { opacity: typingAnim }]} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickReplies} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {quickReplies.map((reply, i) => (
            <TouchableOpacity key={i} style={s.quickReply} onPress={() => sendMessage(reply)}>
              <Text style={s.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Talk to me... I'm listening 💛"
            placeholderTextColor="#444"
            multiline
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]} onPress={() => sendMessage()} activeOpacity={0.8}>
            <Ionicons name="send" size={20} color={input.trim() ? '#111' : '#555'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', padding:16, borderBottomWidth:1, borderBottomColor:'#222', gap:12 },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerCenter: { flex:1, flexDirection:'row', alignItems:'center', gap:10 },
  aiAvatar: { width:38, height:38, borderRadius:19, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:15, fontWeight:'800' },
  headerSub: { color:'#555', fontSize:11 },
  onlineDot: { width:10, height:10, borderRadius:5, backgroundColor:'#34C759' },
  messages: { padding:16, paddingBottom:8 },
  messageBubble: { flexDirection:'row', alignItems:'flex-end', gap:8, marginBottom:12 },
  userBubble: { justifyContent:'flex-end' },
  aiBubble: { justifyContent:'flex-start' },
  aiAvatarSmall: { width:28, height:28, borderRadius:14, justifyContent:'center', alignItems:'center' },
  bubble: { maxWidth:'78%', borderRadius:18, padding:13 },
  userBubbleInner: { backgroundColor:'#FFE033', borderBottomRightRadius:4 },
  aiBubbleInner: { backgroundColor:'#1C1C1E', borderBottomLeftRadius:4, borderWidth:1 },
  messageText: { color:'#aaa', fontSize:14, lineHeight:20 },
  userMessageText: { color:'#111', fontWeight:'600' },
  typingBubble: { backgroundColor:'#1C1C1E', borderRadius:18, padding:14, flexDirection:'row', gap:5, borderWidth:1, borderColor:'#FFE03355' },
  typingDot: { width:8, height:8, borderRadius:4, backgroundColor:'#FFE033' },
  quickReplies: { borderTopWidth:1, borderTopColor:'#222', paddingVertical:8 },
  quickReply: { backgroundColor:'#1C1C1E', borderRadius:20, paddingHorizontal:14, paddingVertical:8, marginRight:8, borderWidth:1, borderColor:'#FFE03333' },
  quickReplyText: { color:'#FFE033', fontSize:11.5, fontWeight:'600' },
  inputRow: { flexDirection:'row', padding:12, gap:10, borderTopWidth:1, borderTopColor:'#222', alignItems:'flex-end' },
  input: { flex:1, backgroundColor:'#1C1C1E', borderRadius:22, paddingHorizontal:16, paddingVertical:10, color:'white', fontSize:14, borderWidth:1, borderColor:'#2C2C2E', maxHeight:100 },
  sendBtn: { width:46, height:46, borderRadius:23, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  sendBtnDisabled: { backgroundColor:'#1C1C1E' },
});
