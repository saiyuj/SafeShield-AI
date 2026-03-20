import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(0)).current;
  const ringAnim2 = useRef(new Animated.Value(0)).current;
  const ringAnim3 = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ring animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim1, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(ringAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim2, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ringAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 600);

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim3, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ringAnim3, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 1200);

    // Logo animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Loading bar - useNativeDriver false for width
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // Navigate after 3 seconds
    setTimeout(() => {
      router.replace('/(tabs)' as any);
    }, 3200);
  }, []);

  const ringStyle = (anim) => ({
    position: 'absolute' as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#FFE033',
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.2, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
  });

  return (
    <View style={s.container}>
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      <Animated.View style={ringStyle(ringAnim1)} />
      <Animated.View style={ringStyle(ringAnim2)} />
      <Animated.View style={ringStyle(ringAnim3)} />

      <Animated.View style={[s.logoContainer, { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }]}>
        <View style={s.logoOuter}>
          <View style={s.logoMiddle}>
            <View style={s.logoInner}>
              <Ionicons name="shield-checkmark" size={52} color="#111" />
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[s.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={s.appName}>SafeShield</Text>
        <Text style={s.tagline}>Your AI Safety Guardian</Text>
        <View style={s.tagRow}>
          {['🤖 AI Powered', '🌍 10 Languages', '🔒 Private'].map((tag, i) => (
            <View key={i} style={s.tag}>
              <Text style={s.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[s.bottom, { opacity: fadeAnim }]}>
        <View style={s.loadingBar}>
          <Animated.View style={[s.loadingFill, {
            width: loadingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }]} />
        </View>
        <Text style={s.loadingText}>Initializing AI Protection...</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111', justifyContent:'center', alignItems:'center' },
  bgCircle1: { position:'absolute', width:400, height:400, borderRadius:200, backgroundColor:'rgba(255,224,51,0.03)', top:-100, right:-100 },
  bgCircle2: { position:'absolute', width:300, height:300, borderRadius:150, backgroundColor:'rgba(255,224,51,0.05)', bottom:-50, left:-50 },
  logoContainer: { marginBottom:40 },
  logoOuter: { width:160, height:160, borderRadius:80, backgroundColor:'rgba(255,224,51,0.15)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,224,51,0.3)' },
  logoMiddle: { width:120, height:120, borderRadius:60, backgroundColor:'rgba(255,224,51,0.2)', justifyContent:'center', alignItems:'center' },
  logoInner: { width:90, height:90, borderRadius:45, backgroundColor:'#FFE033', justifyContent:'center', alignItems:'center' },
  textContainer: { alignItems:'center', marginBottom:60 },
  appName: { color:'white', fontSize:42, fontWeight:'900', letterSpacing:2, marginBottom:8 },
  tagline: { color:'#666', fontSize:16, marginBottom:24 },
  tagRow: { flexDirection:'row', gap:8 },
  tag: { backgroundColor:'#1C1C1E', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#2C2C2E' },
  tagText: { color:'#aaa', fontSize:11, fontWeight:'600' },
  bottom: { position:'absolute', bottom:60, width:'80%', alignItems:'center' },
  loadingBar: { width:'100%', height:3, backgroundColor:'#1C1C1E', borderRadius:2, overflow:'hidden', marginBottom:12 },
  loadingFill: { height:'100%', backgroundColor:'#FFE033', borderRadius:2 },
  loadingText: { color:'#444', fontSize:12 },
});
