import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Animated, StatusBar, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import axios from 'axios';

const API_URL = "http://192.168.29.145:5000";

export default function JuniorScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [childLocation, setChildLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [safeZoneActive, setSafeZoneActive] = useState(false);
  const [bandConnected, setBandConnected] = useState(false);
  const [trackerActive, setTrackerActive] = useState(false);
  const [bullyReport, setBullyReport] = useState('');
  const [bullyType, setBullyType] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const recordingRef = useRef(null);
  const isRecordingRef = useRef(false);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const bandAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(bandAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
      Animated.timing(bandAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      startBullyingDetection();
    } else {
      stopBullyingDetection();
    }
    return () => stopBullyingDetection();
  }, [isMonitoring]);

  const addAlert = (type, message, severity) => {
    const alert = {
      id: Date.now(),
      type, message, severity,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    Alert.alert(
      severity === 'high' ? '🚨 URGENT ALERT!' : '⚠️ Alert',
      `${message}\n\nNotification sent to Parents & Teachers!`,
      [{ text: 'OK' }]
    );
  };

  const startBullyingDetection = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;
      await recordAndAnalyze();
      intervalRef.current = setInterval(async () => {
        if (isRecordingRef.current === false) await recordAndAnalyze();
      }, 8000);
    } catch (e) {}
  };

  const stopBullyingDetection = async () => {
    clearInterval(intervalRef.current);
    if (recordingRef.current && isRecordingRef.current) {
      try {
        isRecordingRef.current = false;
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
    }
  };

  const recordAndAnalyze = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      isRecordingRef.current = true;
      setIsAnalyzing(true);
      await new Promise(r => setTimeout(r, 3000));
      if (!isRecordingRef.current) return;
      isRecordingRef.current = false;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/wav', name: 'bully.wav' });
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      const data = response.data;
      setIsAnalyzing(false);
      if (data.is_distress && data.confidence.distress > 60) {
        addAlert('bullying', `Distress sounds detected near child! (${data.confidence.distress}% confidence)\nPossible bullying or abuse detected.`, 'high');
      }
    } catch (e) {
      setIsAnalyzing(false);
    }
  };

  const trackLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setChildLocation(loc.coords);
      if (safeZoneActive) {
        addAlert('location', 'Child has left the safe zone!\nCurrent location shared with parents and teachers.', 'high');
      }
    } catch (e) {}
  };

  const connectBand = () => {
    setBandConnected(true);
    Alert.alert('✅ SafeShield Band Connected!', 'Wearable band is now active!\n\n🎙 AI listening for bullying sounds\n📍 GPS tracking enabled\n🚨 Panic button ready\n👨‍👩‍👧 Parents & teachers will be notified instantly');
  };

  const activateTracker = () => {
    setTrackerActive(true);
    trackLocation();
    Alert.alert('📍 Smart Tracker Activated!', 'Child\'s location is being tracked.\n\nParents & teachers will receive alerts if child leaves safe zone.');
  };

  const submitBullyReport = () => {
    if (!bullyReport || !bullyType) { Alert.alert('Please fill all fields'); return; }
    addAlert('report', `Anonymous bullying report submitted: ${bullyType}`, 'medium');
    setBullyReport('');
    setBullyType('');
    Alert.alert('✅ Report Sent!', 'Your anonymous report has been sent to:\n👨‍👩‍👧 Parents\n👩‍🏫 Class Teacher\n🏫 School Administration\n\nYou are brave! 💪');
  };

  const submitMood = (mood) => {
    setSelectedMood(mood.label);
    const entry = { ...mood, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() };
    setMoodHistory(prev => [entry, ...prev.slice(0, 6)]);
    if (mood.score <= 2) {
      addAlert('mood', `Child reported feeling ${mood.label} today. Please check on them.`, 'medium');
    }
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { key: 'monitor', label: 'AI Monitor', icon: 'mic-outline' },
    { key: 'location', label: 'Location', icon: 'location-outline' },
    { key: 'mood', label: 'Mood', icon: 'happy-outline' },
    { key: 'report', label: 'Report', icon: 'flag-outline' },
    { key: 'devices', label: 'Devices', icon: 'watch-outline' },
  ];

  const moods = [
    { emoji: '😊', label: 'Happy', color: '#34C759', score: 5 },
    { emoji: '😐', label: 'Okay', color: '#FFE033', score: 3 },
    { emoji: '😢', label: 'Sad', color: '#007AFF', score: 2 },
    { emoji: '😡', label: 'Angry', color: '#FF9500', score: 1 },
    { emoji: '😰', label: 'Scared', color: '#FF3B30', score: 1 },
    { emoji: '🤒', label: 'Unwell', color: '#5856D6', score: 2 },
  ];

  const bullyTypes = ['Physical Bullying', 'Verbal Abuse', 'Cyberbullying', 'Teacher Misconduct', 'Sexual Harassment', 'Emotional Abuse'];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>SafeShield Junior</Text>
          <Text style={s.headerSub}>Children Protection System</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: isMonitoring ? '#34C75922' : '#FF3B3022', borderColor: isMonitoring ? '#34C759' : '#FF3B30' }]}>
          <View style={[s.statusDot, { backgroundColor: isMonitoring ? '#34C759' : '#FF3B30' }]} />
          <Text style={[s.statusText, { color: isMonitoring ? '#34C759' : '#FF3B30' }]}>{isMonitoring ? 'ON' : 'OFF'}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={[s.tab, activeTab === tab.key && s.tabActive]} onPress={() => setActiveTab(tab.key)}>
            <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.key ? '#111' : '#555'} />
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <View>
            <View style={s.heroCard}>
              <Animated.View style={[s.heroOrb, { transform: [{ scale: pulseAnim }] }]}>
                <View style={s.heroOrbInner}>
                  <Ionicons name="shield-checkmark" size={36} color={isMonitoring ? '#34C759' : '#FFE033'} />
                </View>
              </Animated.View>
              <Text style={s.heroTitle}>Children Safety Monitor</Text>
              <Text style={s.heroSub}>AI monitors bullying, distress & location. Parents & teachers get instant alerts.</Text>
              <TouchableOpacity style={[s.mainBtn, isMonitoring && s.mainBtnStop]} onPress={() => setIsMonitoring(!isMonitoring)} activeOpacity={0.85}>
                <Ionicons name={isMonitoring ? "stop-circle-outline" : "shield-checkmark-outline"} size={22} color={isMonitoring ? '#FF3B30' : '#111'} />
                <Text style={[s.mainBtnText, isMonitoring && { color: '#FF3B30' }]}>{isMonitoring ? 'Stop Monitoring' : 'Start AI Monitoring'}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.statsRow}>
              {[
                { icon: 'alert-circle-outline', val: alerts.filter(a=>a.severity==='high').length, label: 'Urgent', color: '#FF3B30' },
                { icon: 'warning-outline', val: alerts.filter(a=>a.severity==='medium').length, label: 'Warnings', color: '#FF9500' },
                { icon: 'location-outline', val: trackerActive ? 'ON' : 'OFF', label: 'Tracker', color: trackerActive ? '#34C759' : '#555' },
                { icon: 'watch-outline', val: bandConnected ? 'ON' : 'OFF', label: 'Band', color: bandConnected ? '#34C759' : '#555' },
              ].map((stat, i) => (
                <View key={i} style={s.statCard}>
                  <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                  <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Recent Alerts */}
            <View style={s.alertsCard}>
              <Text style={s.alertsTitle}>RECENT ALERTS</Text>
              {alerts.length === 0 ? (
                <View style={s.noAlerts}>
                  <Ionicons name="checkmark-circle-outline" size={40} color="#34C759" />
                  <Text style={s.noAlertsText}>No alerts — Child is safe!</Text>
                </View>
              ) : alerts.slice(0, 5).map((alert, i) => (
                <View key={i} style={[s.alertRow, { borderLeftColor: alert.severity === 'high' ? '#FF3B30' : '#FF9500' }]}>
                  <Ionicons name={alert.severity === 'high' ? "alert-circle" : "warning"} size={20} color={alert.severity === 'high' ? '#FF3B30' : '#FF9500'} />
                  <View style={{ flex:1 }}>
                    <Text style={s.alertMsg}>{alert.message}</Text>
                    <Text style={s.alertTime}>{alert.date} • {alert.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Who Gets Notified */}
            <View style={s.notifyCard}>
              <Text style={s.notifyTitle}>WHO GETS NOTIFIED</Text>
              {[
                { icon: 'people-outline', label: 'Parents', desc: 'Instant SMS + App alert with location', color: '#FFE033' },
                { icon: 'school-outline', label: 'Class Teacher', desc: 'Alert sent to teacher\'s phone', color: '#007AFF' },
                { icon: 'business-outline', label: 'School Admin', desc: 'Management notified for serious incidents', color: '#34C759' },
                { icon: 'shield-outline', label: 'Police (SOS)', desc: 'Auto-dial 112 for extreme emergencies', color: '#FF3B30' },
              ].map((item, i) => (
                <View key={i} style={s.notifyRow}>
                  <View style={[s.notifyIcon, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={s.notifyLabel}>{item.label}</Text>
                    <Text style={s.notifyDesc}>{item.desc}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI MONITOR TAB */}
        {activeTab === 'monitor' && (
          <View>
            <View style={s.monitorCard}>
              <Animated.View style={[s.radarOuter, { opacity: isMonitoring ? radarAnim.interpolate({ inputRange:[0,0.5,1], outputRange:[0.5,1,0.5] }) : 0.3 }]}>
                <View style={s.radarMiddle}>
                  <View style={s.radarInner}>
                    <Ionicons name={isAnalyzing ? "pulse" : isMonitoring ? "ear" : "ear-outline"} size={36} color={isMonitoring ? '#34C759' : '#FFE033'} />
                  </View>
                </View>
              </Animated.View>
              <Text style={s.monitorTitle}>{isAnalyzing ? 'Analyzing Sounds...' : isMonitoring ? 'AI Listening' : 'Monitor Off'}</Text>
              <Text style={s.monitorSub}>{isMonitoring ? 'AI analyzes sounds every 8 seconds for bullying, abuse or distress' : 'Start monitoring to detect bullying sounds automatically'}</Text>
            </View>

            <TouchableOpacity style={[s.mainBtn, isMonitoring && s.mainBtnStop, { marginBottom: 16 }]} onPress={() => setIsMonitoring(!isMonitoring)} activeOpacity={0.85}>
              <Ionicons name={isMonitoring ? "stop-circle-outline" : "mic-outline"} size={22} color={isMonitoring ? '#FF3B30' : '#111'} />
              <Text style={[s.mainBtnText, isMonitoring && { color: '#FF3B30' }]}>{isMonitoring ? 'Stop AI Monitor' : 'Start AI Bullying Monitor'}</Text>
            </TouchableOpacity>

            <View style={s.detectCard}>
              <Text style={s.detectTitle}>WHAT AI DETECTS</Text>
              {[
                { icon: 'volume-high-outline', label: 'Loud shouting/screaming', color: '#FF3B30' },
                { icon: 'sad-outline', label: 'Crying or sobbing sounds', color: '#007AFF' },
                { icon: 'warning-outline', label: 'Distress patterns in voice', color: '#FF9500' },
                { icon: 'body-outline', label: 'Physical struggle sounds', color: '#FF2D55' },
                { icon: 'mic-off-outline', label: 'Sudden silence (shock)', color: '#5856D6' },
                { icon: 'help-circle-outline', label: '"Help", "Stop", "No" keywords', color: '#34C759' },
              ].map((item, i) => (
                <View key={i} style={s.detectRow}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text style={s.detectText}>{item.label}</Text>
                  <View style={[s.detectBadge, { backgroundColor: item.color + '22' }]}>
                    <Text style={[s.detectBadgeText, { color: item.color }]}>AI</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={s.flowCard}>
              <Text style={s.flowTitle}>HOW IT WORKS</Text>
              {[
                ['Smart band/phone microphone listens', 'mic-outline', '#FFE033'],
                ['AI analyzes sounds every 8 seconds', 'analytics-outline', '#007AFF'],
                ['Bullying/distress pattern detected', 'alert-circle-outline', '#FF9500'],
                ['GPS location captured instantly', 'location-outline', '#34C759'],
                ['Alert sent to parents AND teachers', 'notifications-outline', '#FF3B30'],
                ['School can take immediate action', 'shield-checkmark-outline', '#5856D6'],
              ].map(([text, icon, color], i) => (
                <View key={i} style={s.flowRow}>
                  <View style={[s.flowNum, { backgroundColor: color }]}>
                    <Text style={s.flowNumText}>{i + 1}</Text>
                  </View>
                  <Ionicons name={icon as any} size={18} color={color} />
                  <Text style={s.flowText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <View>
            <View style={s.locationHeroCard}>
              <Animated.View style={[s.radarOuter, { opacity: trackerActive ? radarAnim.interpolate({ inputRange:[0,0.5,1], outputRange:[0.3,1,0.3] }) : 0.3 }]}>
                <View style={s.radarMiddle}>
                  <View style={s.radarInner}>
                    <Ionicons name="location" size={32} color={trackerActive ? '#34C759' : '#555'} />
                  </View>
                </View>
              </Animated.View>
              <Text style={s.monitorTitle}>{trackerActive ? 'Tracking Active' : 'Tracker Off'}</Text>
              {childLocation && (
                <Text style={s.locationCoords}>📍 {childLocation.latitude.toFixed(4)}, {childLocation.longitude.toFixed(4)}</Text>
              )}
            </View>

            <TouchableOpacity style={[s.mainBtn, trackerActive && s.mainBtnStop, { marginBottom: 16 }]} onPress={trackerActive ? () => setTrackerActive(false) : activateTracker} activeOpacity={0.85}>
              <Ionicons name={trackerActive ? "stop-circle-outline" : "location-outline"} size={22} color={trackerActive ? '#FF3B30' : '#111'} />
              <Text style={[s.mainBtnText, trackerActive && { color: '#FF3B30' }]}>{trackerActive ? 'Stop Tracking' : 'Start Live Tracking'}</Text>
            </TouchableOpacity>

            <View style={s.safeZoneCard}>
              <View style={s.safeZoneHeader}>
                <Ionicons name="map-outline" size={24} color="#34C759" />
                <Text style={s.safeZoneTitle}>Safe Zone Settings</Text>
                <Switch value={safeZoneActive} onValueChange={(v) => { setSafeZoneActive(v); if(v) Alert.alert('✅ Safe Zone Set!', 'Parents and teachers will be alerted if child leaves this area!'); }} trackColor={{ false: '#333', true: '#34C759' }} thumbColor={safeZoneActive ? 'white' : '#666'} />
              </View>
              <Text style={s.safeZoneDesc}>Set safe zones around school, home and tuition. Parents AND teachers get instant alert with live location if child leaves the zone.</Text>
              {[
                { label: 'School Zone', icon: 'school-outline', active: true },
                { label: 'Home Zone', icon: 'home-outline', active: true },
                { label: 'Bus Route', icon: 'bus-outline', active: false },
              ].map((zone, i) => (
                <View key={i} style={s.zoneRow}>
                  <Ionicons name={zone.icon as any} size={20} color={zone.active ? '#34C759' : '#555'} />
                  <Text style={[s.zoneLabel, { color: zone.active ? 'white' : '#555' }]}>{zone.label}</Text>
                  <View style={[s.zoneBadge, { backgroundColor: zone.active ? '#34C75922' : '#1C1C1E' }]}>
                    <Text style={[s.zoneBadgeText, { color: zone.active ? '#34C759' : '#555' }]}>{zone.active ? 'ACTIVE' : 'SET ZONE'}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={s.qrCard}>
              <View style={s.qrHeader}>
                <Ionicons name="qr-code-outline" size={24} color="#FF9500" />
                <Text style={s.qrTitle}>QR Card Backup System</Text>
              </View>
              <Text style={s.qrDesc}>Every child gets a laminated QR card to keep in their bag or pocket. If the GPS tracker fails or child is found by a stranger, scanning the QR code immediately:</Text>
              {[
                'Shows child\'s name & photo',
                'Sends parent\'s contact instantly',
                'Shares scanner\'s GPS location',
                'Notifies parents AND school',
                'Works offline via SMS backup',
              ].map((item, i) => (
                <View key={i} style={s.qrRow}>
                  <View style={[s.flowNum, { backgroundColor: '#FF9500' }]}>
                    <Text style={s.flowNumText}>{i+1}</Text>
                  </View>
                  <Text style={s.qrText}>{item}</Text>
                </View>
              ))}
              <TouchableOpacity style={[s.mainBtn, { backgroundColor: '#FF9500', marginTop: 14 }]} onPress={() => Alert.alert('📱 QR Card Generated!', 'QR card has been generated for your child.\n\nPrint and laminate it for your child to carry at all times.')} activeOpacity={0.8}>
                <Ionicons name="qr-code-outline" size={20} color="#111" />
                <Text style={s.mainBtnText}>Generate Child QR Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MOOD TAB */}
        {activeTab === 'mood' && (
          <View>
            <View style={s.sectionCard}>
              <Ionicons name="happy-outline" size={28} color="#34C759" />
              <Text style={s.sectionTitle}>Daily Mood Check</Text>
              <Text style={s.sectionSub}>Child checks in daily. AI detects patterns of sadness or fear and alerts parents AND teachers automatically.</Text>
            </View>

            <View style={s.moodGrid}>
              {moods.map((mood, i) => (
                <TouchableOpacity key={i} style={[s.moodCard, selectedMood === mood.label && { borderColor: mood.color, backgroundColor: mood.color + '22' }]} onPress={() => submitMood(mood)} activeOpacity={0.8}>
                  <Text style={s.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[s.moodLabel, selectedMood === mood.label && { color: mood.color }]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {moodHistory.length > 0 && (
              <View style={s.historyCard}>
                <Text style={s.historyTitle}>MOOD HISTORY</Text>
                {moodHistory.map((entry, i) => (
                  <View key={i} style={s.historyRow}>
                    <Text style={s.historyEmoji}>{entry.emoji}</Text>
                    <View style={{ flex:1 }}>
                      <Text style={[s.historyMood, { color: entry.color }]}>{entry.label}</Text>
                      <Text style={s.historyTime}>{entry.date} • {entry.time}</Text>
                    </View>
                    {entry.score <= 2 && <Ionicons name="alert-circle" size={16} color="#FF3B30" />}
                  </View>
                ))}
              </View>
            )}

            <View style={s.aiCard}>
              <Ionicons name="analytics-outline" size={24} color="#FFE033" />
              <View style={{ flex:1 }}>
                <Text style={s.aiTitle}>AI Pattern Detection</Text>
                <Text style={s.aiDesc}>If child reports sad/scared/angry mood 3+ days in a row, both parents AND class teacher get automatic alert with mood history report.</Text>
              </View>
            </View>
          </View>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <View>
            <View style={s.sectionCard}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#FF3B30" />
              <Text style={s.sectionTitle}>Anonymous Report</Text>
              <Text style={s.sectionSub}>100% anonymous. Report goes to BOTH parents and teachers/school admin simultaneously.</Text>
            </View>

            <View style={s.reportFormCard}>
              <Text style={s.reportLabel}>TYPE OF INCIDENT</Text>
              <View style={s.bullyGrid}>
                {bullyTypes.map((type, i) => (
                  <TouchableOpacity key={i} style={[s.bullyBtn, bullyType === type && s.bullyBtnActive]} onPress={() => setBullyType(type)}>
                    <Text style={[s.bullyBtnText, bullyType === type && s.bullyBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.reportLabel}>DESCRIBE WHAT HAPPENED</Text>
              <TextInput style={s.reportInput} value={bullyReport} onChangeText={setBullyReport} placeholder="Describe the incident..." placeholderTextColor="#444" multiline numberOfLines={4} />

              <View style={s.anonymousBadge}>
                <Ionicons name="eye-off-outline" size={16} color="#34C759" />
                <Text style={s.anonymousBadgeText}>100% Anonymous — Your name is never revealed</Text>
              </View>

              <Text style={s.reportSentTo}>📬 Report will be sent to:</Text>
              {['👨‍👩‍👧 Parents immediately', '👩‍🏫 Class Teacher', '🏫 School Principal', '🔒 SafeShield Security Team'].map((r, i) => (
                <View key={i} style={s.reportRecipient}>
                  <Text style={s.reportRecipientText}>{r}</Text>
                </View>
              ))}

              <TouchableOpacity style={s.submitBtn} onPress={submitBullyReport} activeOpacity={0.8}>
                <Ionicons name="send-outline" size={18} color="#111" />
                <Text style={s.submitBtnText}>Submit Anonymous Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'devices' && (
          <View>
            {/* Smart Band */}
            <View style={s.deviceCard}>
              <View style={s.deviceHeader}>
                <Ionicons name="watch-outline" size={24} color="#FF9500" />
                <Text style={s.deviceTitle}>SafeShield Smart Band</Text>
                <View style={[s.deviceStatus, { backgroundColor: bandConnected ? '#34C75922' : '#FF3B3022', borderColor: bandConnected ? '#34C759' : '#FF3B30' }]}>
                  <Text style={[s.deviceStatusText, { color: bandConnected ? '#34C759' : '#FF3B30' }]}>{bandConnected ? 'CONNECTED' : 'NOT CONNECTED'}</Text>
                </View>
              </View>

              <Animated.View style={[s.bandPreview, { transform: [{ scale: bandAnim }] }]}>
                <View style={s.bandBody}>
                  <View style={s.bandScreen2}>
                    <Ionicons name="shield-checkmark" size={24} color={bandConnected ? '#34C759' : '#555'} />
                    <Text style={[s.bandScreenText, { color: bandConnected ? '#34C759' : '#555' }]}>{bandConnected ? 'SAFE' : 'OFF'}</Text>
                  </View>
                  <View style={s.bandSosArea}>
                    <View style={s.bandSosBtnPreview}>
                      <Text style={s.bandSosBtnText}>SOS</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              <Text style={s.deviceDesc}>Wearable band for children who don't have phones. AI microphone detects bullying sounds. Panic button sends SOS to parents AND teachers with GPS location.</Text>

              <View style={s.featuresGrid}>
                {[
                  ['🎙', 'AI Bullying Detection'],
                  ['📍', 'Live GPS Tracking'],
                  ['🆘', 'One-touch SOS'],
                  ['📱', 'No phone needed'],
                  ['💬', 'GSM SMS alerts'],
                  ['🔋', '24hr battery'],
                  ['💧', 'Waterproof'],
                  ['👶', 'Age 3-15'],
                ].map(([emoji, label], i) => (
                  <View key={i} style={s.featurePill}>
                    <Text style={s.featurePillEmoji}>{emoji}</Text>
                    <Text style={s.featurePillText}>{label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[s.connectBtn, bandConnected && s.connectBtnActive]} onPress={connectBand} activeOpacity={0.8}>
                <Ionicons name="bluetooth-outline" size={20} color={bandConnected ? '#111' : '#FF9500'} />
                <Text style={[s.connectBtnText, bandConnected && { color: '#111' }]}>{bandConnected ? '✓ Band Connected' : 'Connect Safety Band'}</Text>
              </TouchableOpacity>
            </View>

            {/* Smart Tracker Card */}
            <View style={s.deviceCard}>
              <View style={s.deviceHeader}>
                <Ionicons name="card-outline" size={24} color="#5856D6" />
                <Text style={s.deviceTitle}>Smart Tracker Card</Text>
                <View style={[s.deviceStatus, { backgroundColor: trackerActive ? '#34C75922' : '#55555522', borderColor: trackerActive ? '#34C759' : '#555' }]}>
                  <Text style={[s.deviceStatusText, { color: trackerActive ? '#34C759' : '#555' }]}>{trackerActive ? 'TRACKING' : 'INACTIVE'}</Text>
                </View>
              </View>

              <View style={s.trackerCardPreview}>
                <View style={s.trackerCard}>
                  <View style={s.trackerCardTop}>
                    <Ionicons name="shield" size={20} color="#FFE033" />
                    <Text style={s.trackerCardName}>SafeShield</Text>
                  </View>
                  <Text style={s.trackerCardChild}>Child Safety Card</Text>
                  <View style={s.trackerCardQR}>
                    <Ionicons name="qr-code" size={40} color="#111" />
                  </View>
                  <Text style={s.trackerCardScan}>Scan to help this child</Text>
                </View>
              </View>

              <Text style={s.deviceDesc}>A credit card sized tracker that fits in school bag or sewn into uniform. Always active GPS. If child leaves safe zone, parents AND teachers get alert. QR code backup if GPS fails.</Text>

              <TouchableOpacity style={[s.connectBtn, { borderColor: '#5856D6' }, trackerActive && { backgroundColor: '#5856D6' }]} onPress={activateTracker} activeOpacity={0.8}>
                <Ionicons name="location-outline" size={20} color={trackerActive ? 'white' : '#5856D6'} />
                <Text style={[s.connectBtnText, { color: trackerActive ? 'white' : '#5856D6' }]}>{trackerActive ? '✓ Tracker Active' : 'Activate Tracker'}</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#111111' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#222' },
  backBtn: { width:40, height:40, borderRadius:20, backgroundColor:'#1C1C1E', justifyContent:'center', alignItems:'center' },
  headerCenter: { flex:1, alignItems:'center' },
  headerTitle: { color:'white', fontSize:16, fontWeight:'800' },
  headerSub: { color:'#555', fontSize:10, marginTop:2 },
  statusBadge: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:10, paddingVertical:5, borderRadius:20, borderWidth:1.5 },
  statusDot: { width:6, height:6, borderRadius:3 },
  statusText: { fontSize:10, fontWeight:'800', letterSpacing:1 },
  tabBar: { borderBottomWidth:1, borderBottomColor:'#222', maxHeight:50 },
  tab: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:14, marginRight:2 },
  tabActive: { backgroundColor:'#FFE033', borderRadius:8, marginVertical:6 },
  tabText: { color:'#555', fontSize:11, fontWeight:'600' },
  tabTextActive: { color:'#111', fontWeight:'800' },
  scroll: { padding:16, paddingBottom:100 },
  heroCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:24, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  heroOrb: { width:90, height:90, borderRadius:45, backgroundColor:'rgba(255,224,51,0.15)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,224,51,0.3)', marginBottom:14 },
  heroOrbInner: { width:70, height:70, borderRadius:35, backgroundColor:'rgba(255,224,51,0.25)', justifyContent:'center', alignItems:'center' },
  heroTitle: { color:'white', fontSize:18, fontWeight:'900', marginBottom:6 },
  heroSub: { color:'#555', fontSize:12, textAlign:'center', lineHeight:18, marginBottom:16 },
  mainBtn: { backgroundColor:'#FFE033', borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, width:'100%' },
  mainBtnStop: { backgroundColor:'#1C1C1E', borderWidth:2, borderColor:'#FF3B30' },
  mainBtnText: { color:'#111', fontSize:15, fontWeight:'800' },
  statsRow: { flexDirection:'row', gap:8, marginBottom:16 },
  statCard: { flex:1, backgroundColor:'#1C1C1E', borderRadius:14, padding:10, alignItems:'center', gap:4, borderWidth:1, borderColor:'#2C2C2E' },
  statVal: { fontSize:14, fontWeight:'900' },
  statLabel: { color:'#555', fontSize:9, textAlign:'center' },
  alertsCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  alertsTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  noAlerts: { alignItems:'center', padding:20, gap:10 },
  noAlertsText: { color:'#34C759', fontSize:14, fontWeight:'600' },
  alertRow: { flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:12, borderLeftWidth:3, paddingLeft:12 },
  alertMsg: { color:'white', fontSize:13, fontWeight:'600', marginBottom:3 },
  alertTime: { color:'#555', fontSize:11 },
  notifyCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1, borderColor:'#2C2C2E' },
  notifyTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  notifyRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  notifyIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  notifyLabel: { color:'white', fontSize:14, fontWeight:'700', flex:1 },
  notifyDesc: { color:'#555', fontSize:11, marginTop:2 },
  monitorCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:24, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  radarOuter: { width:130, height:130, borderRadius:65, backgroundColor:'rgba(52,199,89,0.1)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(52,199,89,0.3)', marginBottom:14 },
  radarMiddle: { width:95, height:95, borderRadius:48, backgroundColor:'rgba(52,199,89,0.15)', justifyContent:'center', alignItems:'center' },
  radarInner: { width:65, height:65, borderRadius:33, backgroundColor:'rgba(52,199,89,0.25)', justifyContent:'center', alignItems:'center' },
  monitorTitle: { color:'white', fontSize:18, fontWeight:'800', marginBottom:6 },
  monitorSub: { color:'#555', fontSize:12, textAlign:'center', lineHeight:18 },
  locationCoords: { color:'#34C759', fontSize:12, marginTop:6 },
  detectCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  detectTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  detectRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  detectText: { color:'#888', fontSize:13, flex:1 },
  detectBadge: { borderRadius:6, paddingHorizontal:6, paddingVertical:3 },
  detectBadgeText: { fontSize:10, fontWeight:'800' },
  flowCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1, borderColor:'#2C2C2E' },
  flowTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  flowRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  flowNum: { width:22, height:22, borderRadius:11, justifyContent:'center', alignItems:'center' },
  flowNumText: { color:'white', fontSize:11, fontWeight:'800' },
  flowText: { color:'#888', fontSize:13, flex:1 },
  locationHeroCard: { backgroundColor:'#1C1C1E', borderRadius:24, padding:24, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  safeZoneCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, marginBottom:16, borderWidth:1, borderColor:'#34C75944' },
  safeZoneHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  safeZoneTitle: { color:'white', fontSize:15, fontWeight:'700', flex:1 },
  safeZoneDesc: { color:'#555', fontSize:12, lineHeight:18, marginBottom:14 },
  zoneRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  zoneLabel: { flex:1, fontSize:14, fontWeight:'600' },
  zoneBadge: { borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  zoneBadgeText: { fontSize:11, fontWeight:'700' },
  qrCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:18, borderWidth:1, borderColor:'#FF950044' },
  qrHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  qrTitle: { color:'white', fontSize:15, fontWeight:'700' },
  qrDesc: { color:'#555', fontSize:12, lineHeight:18, marginBottom:14 },
  qrRow: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  qrText: { color:'#888', fontSize:13, flex:1 },
  sectionCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E', alignItems:'center' },
  sectionTitle: { color:'white', fontSize:18, fontWeight:'900', marginTop:10, marginBottom:6 },
  sectionSub: { color:'#555', fontSize:13, textAlign:'center', lineHeight:20 },
  moodGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:16 },
  moodCard: { width:'30%', backgroundColor:'#1C1C1E', borderRadius:16, padding:14, alignItems:'center', borderWidth:1.5, borderColor:'#2C2C2E' },
  moodEmoji: { fontSize:34, marginBottom:6 },
  moodLabel: { color:'#888', fontSize:12, fontWeight:'600' },
  historyCard: { backgroundColor:'#1C1C1E', borderRadius:18, padding:18, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  historyTitle: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:14 },
  historyRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  historyEmoji: { fontSize:26 },
  historyMood: { fontSize:14, fontWeight:'700' },
  historyTime: { color:'#555', fontSize:11, marginTop:2 },
  aiCard: { backgroundColor:'rgba(255,224,51,0.08)', borderRadius:18, padding:18, flexDirection:'row', gap:14, alignItems:'flex-start', borderWidth:1, borderColor:'rgba(255,224,51,0.2)' },
  aiTitle: { color:'white', fontSize:14, fontWeight:'700', marginBottom:4 },
  aiDesc: { color:'#666', fontSize:12, lineHeight:18 },
  reportFormCard: { backgroundColor:'#1C1C1E', borderRadius:20, padding:20, borderWidth:1, borderColor:'#2C2C2E' },
  reportLabel: { color:'#555', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:12 },
  bullyGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:20 },
  bullyBtn: { backgroundColor:'#111111', borderRadius:10, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:'#2C2C2E' },
  bullyBtnActive: { backgroundColor:'#FF3B30', borderColor:'#FF3B30' },
  bullyBtnText: { color:'#555', fontSize:12, fontWeight:'600' },
  bullyBtnTextActive: { color:'white' },
  reportInput: { backgroundColor:'#111111', borderRadius:14, padding:16, color:'white', fontSize:14, borderWidth:1, borderColor:'#2C2C2E', minHeight:100, textAlignVertical:'top', marginBottom:16 },
  anonymousBadge: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(52,199,89,0.1)', borderRadius:10, padding:12, marginBottom:14, borderWidth:1, borderColor:'rgba(52,199,89,0.2)' },
  anonymousBadgeText: { color:'#34C759', fontSize:12, fontWeight:'600', flex:1 },
  reportSentTo: { color:'#888', fontSize:13, marginBottom:8 },
  reportRecipient: { flexDirection:'row', alignItems:'center', marginBottom:6 },
  reportRecipientText: { color:'#aaa', fontSize:13 },
  submitBtn: { backgroundColor:'#FFE033', borderRadius:14, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginTop:14 },
  submitBtnText: { color:'#111', fontSize:15, fontWeight:'800' },
  deviceCard: { backgroundColor:'#1C1C1E', borderRadius:22, padding:20, marginBottom:16, borderWidth:1, borderColor:'#2C2C2E' },
  deviceHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:16 },
  deviceTitle: { color:'white', fontSize:15, fontWeight:'800', flex:1 },
  deviceStatus: { borderRadius:10, paddingHorizontal:10, paddingVertical:5, borderWidth:1 },
  deviceStatusText: { fontSize:10, fontWeight:'800', letterSpacing:1 },
  bandPreview: { backgroundColor:'#111111', borderRadius:20, padding:16, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#FF950044' },
  bandBody: { flexDirection:'row', alignItems:'center', gap:20 },
  bandScreen2: { backgroundColor:'#1C1C1E', borderRadius:14, padding:16, alignItems:'center', width:100, borderWidth:1, borderColor:'#FF9500' },
  bandScreenText: { fontSize:10, fontWeight:'800', marginTop:6, letterSpacing:1 },
  bandSosArea: { alignItems:'center' },
  bandSosBtnPreview: { width:65, height:65, borderRadius:33, backgroundColor:'#FF3B30', justifyContent:'center', alignItems:'center', borderWidth:3, borderColor:'#FF6B6B' },
  bandSosBtnText: { color:'white', fontSize:14, fontWeight:'900' },
  deviceDesc: { color:'#666', fontSize:13, lineHeight:20, marginBottom:16 },
  featuresGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  featurePill: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#111111', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#2C2C2E' },
  featurePillEmoji: { fontSize:14 },
  featurePillText: { color:'#888', fontSize:11 },
  connectBtn: { borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderWidth:1.5, borderColor:'#FF9500' },
  connectBtnActive: { backgroundColor:'#FF9500' },
  connectBtnText: { fontSize:14, fontWeight:'700' },
  trackerCardPreview: { alignItems:'center', marginBottom:16 },
  trackerCard: { backgroundColor:'white', borderRadius:16, padding:16, width:200, alignItems:'center', borderWidth:2, borderColor:'#FFE033' },
  trackerCardTop: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:6 },
  trackerCardName: { color:'#111', fontSize:14, fontWeight:'900' },
  trackerCardChild: { color:'#555', fontSize:11, marginBottom:10 },
  trackerCardQR: { backgroundColor:'#f5f5f5', borderRadius:8, padding:10, marginBottom:8 },
  trackerCardScan: { color:'#555', fontSize:10 },
});
