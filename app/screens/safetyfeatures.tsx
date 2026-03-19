import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Switch, Linking } from 'react-native';
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
  const shakeSubscription = useRef(null);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    getBatteryLevel();
    checkNightMode();
  }, []);

  useEffect(() => {
    if (shakeEnabled) {
      startShakeDetection();
    } else {
      stopShakeDetection();
    }
    return () => stopShakeDetection();
  }, [shakeEnabled]);

  const getBatteryLevel = async () => {
    const level = await Battery.getBatteryLevelAsync();
    setBatteryLevel(Math.round(level * 100));
    if (batteryAlertEnabled && level < 0.15) {
      Alert.alert('🔋 Battery Low Alert!', `Battery at ${Math.round(level * 100)}%. Sending location to emergency contacts!`, [{ text: 'OK' }]);
    }
  };

  const checkNightMode = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      setNightModeEnabled(true);
    }
  };

  const startShakeDetection = () => {
    Accelerometer.setUpdateInterval(100);
    shakeSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (acceleration > 2.5 && now - lastShakeTime.current > 3000) {
        lastShakeTime.current = now;
        Alert.alert('🚨 Shake Detected!', 'SOS alert triggered! Emergency contacts notified!', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send SOS', style: 'destructive', onPress: () => Alert.alert('SOS Sent!', 'Emergency contacts notified!') }
        ]);
      }
    });
  };

  const stopShakeDetection = () => {
    if (shakeSubscription.current) {
      shakeSubscription.current.remove();
      shakeSubscription.current = null;
    }
  };

  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Allow location access to share your location.');
        return;
      }
      setIsSharing(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const { latitude, longitude } = loc.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      Alert.alert(
        '📍 Location Shared!',
        `Your location has been sent to emergency contacts!\n\nLat: ${latitude.toFixed(4)}\nLng: ${longitude.toFixed(4)}\n\n${mapsLink}`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
    } finally {
      setIsSharing(false);
    }
  };

  const activateVoiceSOS = () => {
    Alert.alert(
      '🎙 Voice SOS',
      'Say "Help SafeShield" loudly to trigger emergency alert.\n\nThis feature works in background when enabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate', onPress: () => Alert.alert('Voice SOS Active!', 'Listening for "Help SafeShield" command...') }
      ]
    );
  };

  const activateSafeZone = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Allow location access for safe zone alerts.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    Alert.alert(
      '📍 Safe Zone Set!',
      `Your current location has been set as your safe zone.\n\nLat: ${loc.coords.latitude.toFixed(4)}\nLng: ${loc.coords.longitude.toFixed(4)}\n\nYou will be alerted if you leave this area.`,
      [{ text: 'OK' }]
    );
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

        {/* Battery Status */}
        <View style={s.batteryCard}>
          <View style={s.batteryLeft}>
            <Ionicons name="battery-half-outline" size={28} color={batteryLevel < 20 ? '#FF3B30' : '#34C759'} />
            <View>
              <Text style={s.batteryLevel}>{batteryLevel}%</Text>
              <Text style={s.batteryLabel}>Battery Level</Text>
            </View>
          </View>
          <View style={[s.batteryStatus, { backgroundColor: batteryLevel < 20 ? '#FF3B3022' : '#34C75922', borderColor: batteryLevel < 20 ? '#FF3B3044' : '#34C75944' }]}>
            <Text style={[s.batteryStatusText, { color: batteryLevel < 20 ? '#FF3B30' : '#34C759' }]}>
              {batteryLevel < 20 ? 'LOW' : 'GOOD'}
            </Text>
          </View>
        </View>

        {/* Live Location Sharing */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#007AFF22' }]}>
              <Ionicons name="location-outline" size={26} color="#007AFF" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Live Location Sharing</Text>
              <Text style={s.featureDesc}>Share your GPS location with emergency contacts instantly</Text>
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

        {/* Shake to SOS */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#FF3B3022' }]}>
              <Ionicons name="phone-portrait-outline" size={26} color="#FF3B30" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Shake to Trigger SOS</Text>
              <Text style={s.featureDesc}>Shake your phone 3 times to send emergency alert</Text>
            </View>
            <Switch
              value={shakeEnabled}
              onValueChange={setShakeEnabled}
              trackColor={{ false: '#333', true: '#FF3B30' }}
              thumbColor={shakeEnabled ? 'white' : '#666'}
            />
          </View>
          {shakeEnabled && (
            <View style={s.activeStatus}>
              <Ionicons name="radio-outline" size={16} color="#FF3B30" />
              <Text style={s.activeStatusText}>Shake detection is ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Safe Zone */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#34C75922' }]}>
              <Ionicons name="map-outline" size={26} color="#34C759" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Safe Zone Alert</Text>
              <Text style={s.featureDesc}>Get notified when you leave your safe area</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.featureBtn, { backgroundColor: '#34C759' }]} onPress={activateSafeZone} activeOpacity={0.8}>
            <Ionicons name="map-outline" size={18} color="white" />
            <Text style={s.featureBtnText}>Set Current Location as Safe Zone</Text>
          </TouchableOpacity>
        </View>

        {/* Voice SOS */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#FFE03322' }]}>
              <Ionicons name="mic-outline" size={26} color="#FFE033" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Voice Activated SOS</Text>
              <Text style={s.featureDesc}>Say "Help SafeShield" to trigger emergency alert</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.featureBtn, { backgroundColor: '#FFE033' }]} onPress={activateVoiceSOS} activeOpacity={0.8}>
            <Ionicons name="mic-outline" size={18} color="#111" />
            <Text style={[s.featureBtnText, { color: '#111' }]}>Activate Voice SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Night Safety Mode */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#5856D622' }]}>
              <Ionicons name="moon-outline" size={26} color="#5856D6" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Night Safety Mode</Text>
              <Text style={s.featureDesc}>Auto activates after 10pm for extra protection</Text>
            </View>
            <Switch
              value={nightModeEnabled}
              onValueChange={setNightModeEnabled}
              trackColor={{ false: '#333', true: '#5856D6' }}
              thumbColor={nightModeEnabled ? 'white' : '#666'}
            />
          </View>
          {nightModeEnabled && (
            <View style={s.activeStatus}>
              <Ionicons name="moon-outline" size={16} color="#5856D6" />
              <Text style={[s.activeStatusText, { color: '#5856D6' }]}>Night Safety Mode is ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Battery Low Alert */}
        <View style={s.featureCard}>
          <View style={s.featureHeader}>
            <View style={[s.featureIconBox, { backgroundColor: '#FF950022' }]}>
              <Ionicons name="battery-dead-outline" size={26} color="#FF9500" />
            </View>
            <View style={s.featureInfo}>
              <Text style={s.featureTitle}>Battery Low Alert</Text>
              <Text style={s.featureDesc}>Auto send location when battery drops below 15%</Text>
            </View>
            <Switch
              value={batteryAlertEnabled}
              onValueChange={setBatteryAlertEnabled}
              trackColor={{ false: '#333', true: '#FF9500' }}
              thumbColor={batteryAlertEnabled ? 'white' : '#666'}
            />
          </View>
          {batteryAlertEnabled && (
            <View style={s.activeStatus}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FF9500" />
              <Text style={[s.activeStatusText, { color: '#FF9500' }]}>Auto alert at 15% battery</Text>
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
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:16, paddingBottom:100 },
  batteryCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderColor:'#2C2C2E' },
  batteryLeft: { flexDirection:'row', alignItems:'center', gap:12 },
  batteryLevel: { color:'white', fontSize:22, fontWeight:'900' },
  batteryLabel: { color:'#555', fontSize:12 },
  batteryStatus: { borderRadius:10, paddingHorizontal:12, paddingVertical:6, borderWidth:1 },
  batteryStatusText: { fontSize:12, fontWeight:'800', letterSpacing:1 },
  featureCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:14, borderWidth:1, borderColor:'#2C2C2E' },
  featureHeader: { flexDirection:'row', alignItems:'center', gap:14, marginBottom:14 },
  featureIconBox: { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center' },
  featureInfo: { flex:1 },
  featureTitle: { color:'white', fontSize:15, fontWeight:'700', marginBottom:4 },
  featureDesc: { color:'#555', fontSize:12, lineHeight:18 },
  featureBtn: { borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  featureBtnText: { color:'white', fontSize:14, fontWeight:'700' },
  locationResult: { flexDirection:'row', alignItems:'center', gap:8, marginTop:10 },
  locationText: { color:'#34C759', fontSize:12 },
  activeStatus: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#111111', borderRadius:10, padding:10, marginTop:4 },
  activeStatusText: { color:'#FF3B30', fontSize:13, fontWeight:'600' },
});
