import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SelfieScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);
  const router = useRouter();

  const takeSecretPhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString();
      setCapturedPhotos(prev => [{ uri: photo.uri, time, date }, ...prev.slice(0, 9)]);
      setCameraVisible(false);
      Alert.alert('Evidence Captured!', `Photo saved at ${time}\nThis can be used as evidence.`, [{ text: 'OK' }]);
    } catch (e) { Alert.alert('Error', 'Could not capture photo'); }
  };

  const startCapture = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) { Alert.alert('Permission Required', 'Camera access needed.'); return; }
    }
    setCameraVisible(true);
  };

  if (cameraVisible) {
    return (
      <SafeAreaView style={s.cameraContainer}>
        <CameraView style={s.camera} facing={facing as any} ref={cameraRef}>
          <View style={s.cameraOverlay}>
            <View style={s.cameraTop}>
              <TouchableOpacity style={s.cameraBtn} onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}>
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={s.cameraBtn} onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={s.cameraBottom}>
              <Text style={s.cameraHint}>Position camera toward threat</Text>
              <TouchableOpacity style={s.captureBtn} onPress={takeSecretPhoto}>
                <View style={s.captureBtnInner} />
              </TouchableOpacity>
              <Text style={s.cameraHint}>Tap to capture evidence</Text>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Evidence Capture</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.mainCard}>
          <Ionicons name="camera-outline" size={60} color="#007AFF" />
          <Text style={s.mainTitle}>Secret Evidence Camera</Text>
          <Text style={s.mainSub}>Discreetly capture photos of threats or attackers as evidence.</Text>
        </View>

        <TouchableOpacity style={s.captureStartBtn} onPress={startCapture} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={22} color="#111" />
          <Text style={s.captureStartBtnText}>Capture Evidence Photo</Text>
        </TouchableOpacity>

        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={s.statVal}>{capturedPhotos.length}</Text><Text style={s.statLabel}>Photos</Text></View>
          <View style={s.statBox}><Ionicons name="lock-closed-outline" size={22} color="#FFE033" /><Text style={s.statLabel}>Secured</Text></View>
          <View style={s.statBox}><Ionicons name="location-outline" size={22} color="#FFE033" /><Text style={s.statLabel}>Geotagged</Text></View>
        </View>

        {capturedPhotos.length > 0 && (
          <View style={s.photosCard}>
            <Text style={s.photosTitle}>CAPTURED EVIDENCE</Text>
            {capturedPhotos.map((photo, i) => (
              <View key={i} style={s.photoRow}>
                <Image source={{ uri: photo.uri }} style={s.photoThumb} />
                <View style={s.photoInfo}>
                  <Text style={s.photoTime}>{photo.time}</Text>
                  <Text style={s.photoDate}>{photo.date}</Text>
                  <View style={s.photoBadge}>
                    <Text style={s.photoBadgeText}>Evidence #{capturedPhotos.length - i}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>HOW TO USE</Text>
          {[
            ['phone-portrait-outline', 'Open this screen discreetly'],
            ['camera-outline', 'Tap Capture to open camera'],
            ['locate-outline', 'Point toward the threat'],
            ['save-outline', 'Photo saved as evidence'],
            ['share-outline', 'Share with police if needed'],
          ].map(([icon, text], i) => (
            <View key={i} style={s.infoRow}>
              <Ionicons name={icon as any} size={22} color="#FFE033" />
              <Text style={s.infoText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={s.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#FF3B30" />
          <Text style={s.warningText}>Use only in genuine emergency situations. Always prioritize your safety over capturing evidence.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  cameraContainer: { flex:1, backgroundColor:'black' },
  camera: { flex:1 },
  cameraOverlay: { flex:1, justifyContent:'space-between' },
  cameraTop: { flexDirection:'row', justifyContent:'space-between', padding:20, paddingTop:40 },
  cameraBtn: { backgroundColor:'rgba(0,0,0,0.5)', borderRadius:20, padding:10 },
  cameraBottom: { alignItems:'center', paddingBottom:60, gap:12 },
  cameraHint: { color:'rgba(255,255,255,0.7)', fontSize:13 },
  captureBtn: { width:80, height:80, borderRadius:40, backgroundColor:'white', justifyContent:'center', alignItems:'center', borderWidth:4, borderColor:'rgba(255,255,255,0.5)' },
  captureBtnInner: { width:64, height:64, borderRadius:32, backgroundColor:'white' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerTitle: { color:'white', fontSize:18, fontWeight:'800' },
  scroll: { padding:20, paddingBottom:100 },
  mainCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:30, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  mainTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:8, marginTop:12 },
  mainSub: { color:'#555', fontSize:13, textAlign:'center', lineHeight:20 },
  captureStartBtn: { backgroundColor:'#FFE033', borderRadius:18, padding:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 },
  captureStartBtnText: { color:'#111', fontSize:17, fontWeight:'800' },
  statsRow: { flexDirection:'row', gap:12, marginBottom:20 },
  statBox: { flex:1, backgroundColor:'#1C1C1E', borderRadius:16, padding:18, alignItems:'center', gap:6, borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { color:'#FFE033', fontSize:22, fontWeight:'800' },
  statLabel: { color:'#444', fontSize:11, marginTop:4 },
  photosCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  photosTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  photoRow: { flexDirection:'row', gap:14, marginBottom:14, alignItems:'center' },
  photoThumb: { width:70, height:70, borderRadius:12 },
  photoInfo: { flex:1 },
  photoTime: { color:'white', fontSize:14, fontWeight:'600' },
  photoDate: { color:'#555', fontSize:12, marginTop:2 },
  photoBadge: { backgroundColor:'rgba(255,224,51,0.15)', borderRadius:8, paddingHorizontal:8, paddingVertical:3, alignSelf:'flex-start', marginTop:6 },
  photoBadgeText: { color:'#FFE033', fontSize:11, fontWeight:'600' },
  infoCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#2C2C2E' },
  infoTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  infoRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  infoText: { color:'#888', fontSize:14, flex:1 },
  warningCard: { backgroundColor:'rgba(255,59,48,0.08)', borderRadius:18, padding:18, borderWidth:1, borderColor:'rgba(255,59,48,0.25)', flexDirection:'row', gap:12, alignItems:'flex-start' },
  warningText: { color:'#888', fontSize:13, lineHeight:20, flex:1 },
});
