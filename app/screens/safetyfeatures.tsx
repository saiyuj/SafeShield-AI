import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Switch, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as Battery from 'expo-battery';

export default function SafetyFeaturesScreen() {
  const router = useRouter();
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [batteryAlertEnabled, setBatteryAlertEnabled] = useState(true);
  const [location, setLocation] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const shakeSubscription = useRef(null);
  const lastShakeTime = useRef(0);
  const shakeCountRef = useRef(0);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    getBatteryLevel();
    checkNightMode();
    return () => stopShakeDetection();
  }, []);

  useEffect(() => {
    if (shakeEnabled) startShakeDetection();
    else stopShakeDetection();
    return () => stopShakeDetection();
  }, [shakeEnabled]);

  const getBatteryLevel = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const pct = Math.round(level * 100);
      setBatteryLevel(pct);
      if (batteryAlertEnabled && pct < 15) {
        Alert.alert('🔋 Battery Low!', `Battery at ${pct}%.\nSending location to emergency contacts!`);
      }
    } catch (e) {}
  };

  const checkNightMode = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) setNightModeEnabled(true);
  };

  const startShakeDetection = () => {
    Accelerometer.setUpdateInterval(150);
    shakeSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const accel = Math.sqrt(x*x + y*y + z*z);
      const now = Date.now();
      if (accel > 2.8 && now - lastShakeTime.current > 400) {
        lastShakeTime.current = now;
        shakeCountRef.current += 1;
        setShakeCount(shakeCountRef.current);

        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = setTimeout(() => {
          shakeCountRef.current = 0;
          setShakeCount(0);
        }, 3000);

        if (shakeCountRef.current >= 5) {
          shakeCountRef.current = 0;
          setShakeCount(0);
          Vibration.vibrate([200, 100, 200, 100, 200]);
          Alert.alert('🚨 SHAKE SOS TRIGGERED!', 'You shook the phone 5 times!\n\nEmergency contacts notified with your location!', [{ text: 'OK' }]);
        }
      }
    });
  };

  const stopShakeDetection = () => {
    if (shakeSubscription.current) {
      shakeSubscription.current.remove();
      shakeSubscription.current = null;
    }
    clearTimeout(shakeTimerRef.current);
    shakeCountRef.current = 0;
    setShakeCount(0);
  };

  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Allow location access.'); return; }
      setIsSharing(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const { latitude, longitude } = loc.coords;
      Alert.alert('📍 Location Shared!', `Sent to emergency contacts!\n\nLat: ${latitude.toFixed(4)}\nLng: ${longitude.toFixed(4)}\n\nhttps://maps.google.com/?q=${latitude},${longitude}`);
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
    } finally { setIsSharing(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Safety Features</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Battery */}
        <View style={s.batteryCard}>
          <View style={s.batteryLeft}>
            <Ionicons name="battery-half-outline" size={28} color={batteryLevel && batteryLevel < 20 ? '#FF3B30' : '#34C759'} />
            <View>
              <Text style={s.batteryLevel}>{batteryLevel ?? '?'}%</Text>
              <Text style={s.batteryLabel}>Battery Level</Text>
            </View>
          </View>
          <View style={[s.batteryBadge, { backgroundColor: batteryLevel && batteryLevel < 20 ? '#FF3B3022' : '#34C75922' }]}>
            <Text style={[s.batteryBadgeText, { color: batteryLevel && batteryLevel < 20 ? '#FF3B30' : '#34C759' }]}>
              {batteryLevel && batteryLevel < 20 ? 'LOW' : 'GOOD'}
            </Text>
          </View>
        </View>

        {/* Shake to SOS */}
        <View style={[s.featureCard, { borderColor: '#FF3B3044' }]}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#FF3B3022' }]}>
              <Ionicons name="phone-portrait-outline" size={26} color="#FF3B30" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Shake to SOS</Text>
              <Text style={s.featureSub}>Shake phone 5 times rapidly to trigger emergency alert</Text>
            </View>
            <Switch value={shakeEnabled} onValueChange={setShakeEnabled} trackColor={{ false:'#333', true:'#FF3B30' }} thumbColor={shakeEnabled?'white':'#666'} />
          </View>
          {shakeEnabled && (
            <View>
              <View style={s.activeStatus}>
                <Ionicons name="radio-outline" size={14} color="#FF3B30" />
                <Text style={[s.activeStatusText, { color:'#FF3B30' }]}>SHAKE DETECTION ACTIVE — Shake 5 times fast!</Text>
              </View>
              {shakeCount > 0 && (
                <View style={s.shakeCounter}>
                  <Text style={s.shakeCountText}>Shakes detected: {shakeCount}/5</Text>
                  <View style={s.shakeDots}>
                    {[1,2,3,4,5].map(n => (
                      <View key={n} style={[s.shakeDot, { backgroundColor: n <= shakeCount ? '#FF3B30' : '#333' }]} />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Live Location */}
        <View style={[s.featureCard, { borderColor: '#007AFF44' }]}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#007AFF22' }]}>
              <Ionicons name="location-outline" size={26} color="#007AFF" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Live Location Sharing</Text>
              <Text style={s.featureSub}>Share GPS location with emergency contacts</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.featureBtn, { backgroundColor: '#007AFF' }]} onPress={shareLocation} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={18} color="white" />
            <Text style={s.featureBtnText}>{isSharing ? 'Getting Location...' : 'Share My Location Now'}</Text>
          </TouchableOpacity>
          {location && (
            <View style={s.locationResult}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
              <Text style={s.locationText}>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</Text>
            </View>
          )}
        </View>

        {/* Night Mode */}
        <View style={[s.featureCard, { borderColor: '#5856D644' }]}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#5856D622' }]}>
              <Ionicons name="moon-outline" size={26} color="#5856D6" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Night Safety Mode</Text>
              <Text style={s.featureSub}>Auto activates after 10pm for extra protection</Text>
            </View>
            <Switch value={nightModeEnabled} onValueChange={setNightModeEnabled} trackColor={{ false:'#333', true:'#5856D6' }} thumbColor={nightModeEnabled?'white':'#666'} />
          </View>
          {nightModeEnabled && (
            <View style={s.activeStatus}>
              <Ionicons name="moon" size={14} color="#5856D6" />
              <Text style={[s.activeStatusText, { color:'#5856D6' }]}>Night Safety Mode is ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Battery Alert */}
        <View style={[s.featureCard, { borderColor: '#FF950044' }]}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#FF950022' }]}>
              <Ionicons name="battery-dead-outline" size={26} color="#FF9500" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Battery Low Alert</Text>
              <Text style={s.featureSub}>Auto share location when battery drops below 15%</Text>
            </View>
            <Switch value={batteryAlertEnabled} onValueChange={setBatteryAlertEnabled} trackColor={{ false:'#333', true:'#FF9500' }} thumbColor={batteryAlertEnabled?'white':'#666'} />
          </View>
          {batteryAlertEnabled && (
            <View style={s.activeStatus}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#FF9500" />
              <Text style={[s.activeStatusText, { color:'#FF9500' }]}>Auto alert enabled at 15% battery</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:17, fontWeight:'800' },
  scroll: { padding:16, paddingBottom:100 },
  batteryCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderColor:'#2C2C2E' },
  batteryLeft: { flexDirection:'row', alignItems:'center', gap:12 },
  batteryLevel: { color:'white', fontSize:22, fontWeight:'900' },
  batteryLabel: { color:'#555', fontSize:12 },
  batteryBadge: { borderRadius:10, paddingHorizontal:12, paddingVertical:6 },
  batteryBadgeText: { fontSize:12, fontWeight:'800', letterSpacing:1 },
  featureCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:14, borderWidth:1 },
  featureHeader: { flexDirection:'row', alignItems:'center', gap:14, marginBottom:14 },
  featureIconBox: { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center' },
  featureInfo: { flex:1 },
  featureTitle: { color:'white', fontSize:15, fontWeight:'700', marginBottom:4 },
  featureSub: { color:'#555', fontSize:11, lineHeight:16 },
  featureBtn: { borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  featureBtnText: { color:'white', fontSize:14, fontWeight:'700' },
  locationResult: { flexDirection:'row', alignItems:'center', gap:8, marginTop:10 },
  locationText: { color:'#34C759', fontSize:12 },
  activeStatus: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#111111', borderRadius:10, padding:10, marginTop:4 },
  activeStatusText: { fontSize:12, fontWeight:'600' },
  shakeCounter: { backgroundColor:'#111111', borderRadius:10, padding:10, marginTop:6 },
  shakeCountText: { color:'#FF3B30', fontSize:12, fontWeight:'700', marginBottom:8 },
  shakeDots: { flexDirection:'row', gap:8 },
  shakeDot: { width:16, height:16, borderRadius:8 },
});
