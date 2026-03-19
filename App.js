import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

// Replace with your Mac's IP address
const API_URL = "http://192.168.29.145:5000";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const recordingRef = useRef(null);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 9)]);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setResult(null);
      addLog('Recording started...');
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopAndAnalyze = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      addLog('Recording stopped. Analyzing...');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      });

      const data = response.data;
      setResult(data);
      addLog(`Result: ${data.prediction.toUpperCase()} (${data.confidence.distress}% distress)`);

      if (data.is_distress) {
        Alert.alert(
          '🚨 DISTRESS DETECTED!',
          `Confidence: ${data.confidence.distress}%\nEmergency contacts have been notified!`,
          [{ text: 'OK' }]
        );
      }

    } catch (e) {
      addLog('Error: Could not analyze audio');
      Alert.alert('Error', 'Could not connect to SafeShield server. Make sure Flask is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ SafeShield AI</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Safety System</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status Card */}
        <View style={[styles.statusCard, isRecording && styles.statusCardRecording]}>
          <Text style={styles.statusIcon}>{isRecording ? '🔴' : '🎤'}</Text>
          <Text style={styles.statusText}>
            {isRecording ? 'Recording...' : isAnalyzing ? 'Analyzing...' : 'Ready to detect'}
          </Text>
        </View>

        {/* Record Button */}
        {!isRecording && !isAnalyzing && (
          <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
            <Text style={styles.recordBtnText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        )}

        {/* Stop Button */}
        {isRecording && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopAndAnalyze}>
            <Text style={styles.stopBtnText}>⏹ Stop & Analyze</Text>
          </TouchableOpacity>
        )}

        {/* Loading */}
cat > App.js << 'EOF'
import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

// Replace with your Mac's IP address
const API_URL = "http://192.168.29.145:5000";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const recordingRef = useRef(null);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 9)]);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setResult(null);
      addLog('Recording started...');
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopAndAnalyze = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      addLog('Recording stopped. Analyzing...');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      });

      const data = response.data;
      setResult(data);
      addLog(`Result: ${data.prediction.toUpperCase()} (${data.confidence.distress}% distress)`);

      if (data.is_distress) {
        Alert.alert(
          '🚨 DISTRESS DETECTED!',
          `Confidence: ${data.confidence.distress}%\nEmergency contacts have been notified!`,
          [{ text: 'OK' }]
        );
      }

    } catch (e) {
      addLog('Error: Could not analyze audio');
      Alert.alert('Error', 'Could not connect to SafeShield server. Make sure Flask is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ SafeShield AI</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Safety System</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status Card */}
        <View style={[styles.statusCard, isRecording && styles.statusCardRecording]}>
          <Text style={styles.statusIcon}>{isRecording ? '🔴' : '🎤'}</Text>
          <Text style={styles.statusText}>
            {isRecording ? 'Recording...' : isAnalyzing ? 'Analyzing...' : 'Ready to detect'}
          </Text>
        </View>

        {/* Record Button */}
        {!isRecording && !isAnalyzing && (
          <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
            <Text style={styles.recordBtnText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        )}

        {/* Stop Button */}
        {isRecording && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopAndAnalyze}>
            <Text style={styles.stopBtnText}>⏹ Stop & Analyze</Text>
          </TouchableOpacity>
        )}

        {/* Loading */}
        {isAnalyzing && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#ff4444" />
            <Text style={styles.loadingText}>Analyzing with AI...</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, result.is_distress ? styles.resultDistress : styles.resultNormal]}>
            <Text style={styles.resultIcon}>{result.is_distress ? '🚨' : '✅'}</Text>
            <Text style={styles.resultTitle}>
              {result.is_distress ? 'DISTRESS DETECTED' : 'NORMAL SOUND'}
            </Text>

            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>🔴 Distress</Text>
              <Text style={styles.confidenceValue}>{result.confidence.distress}%</Text>
            </View>
            <View style={styles.confidenceBarBg}>
              <View style={[styles.confidenceBarFill, { width: `${result.confidence.distress}%`, backgroundColor: '#ff4444' }]} />
            </View>

            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>🟢 Normal</Text>
              <Text style={styles.confidenceValue}>{result.confidence.normal}%</Text>
            </View>
            <View style={styles.confidenceBarBg}>
              <View style={[styles.confidenceBarFill, { width: `${result.confidence.normal}%`, backgroundColor: '#44ff44' }]} />
            </View>
          </View>
        )}

        {/* Logs */}
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>📋 Activity Log</Text>
          {logs.length === 0 && <Text style={styles.logEmpty}>No activity yet</Text>}
          {logs.map((log, i) => (
            <Text key={i} style={styles.logItem}>{log}</Text>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    backgroundColor: '#111',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: { color: '#ff4444', fontSize: 26, fontWeight: 'bold' },
  headerSubtitle: { color: '#aaa', fontSize: 13, marginTop: 4 },
  content: { padding: 20 },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusCardRecording: { borderColor: '#ff4444', backgroundColor: '#1a0000' },
  statusIcon: { fontSize: 50, marginBottom: 10 },
  statusText: { color: '#aaa', fontSize: 16 },
  recordBtn: {
    backgroundColor: '#ff4444',
    borderRadius: 50,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  recordBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  stopBtn: {
    backgroundColor: '#333',
    borderRadius: 50,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  stopBtnText: { color: '#ff4444', fontSize: 18, fontWeight: 'bold' },
  loadingCard: { alignItems: 'center', padding: 20, marginBottom: 20 },
  loadingText: { color: '#aaa', marginTop: 10, fontSize: 16 },
  resultCard: {
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
  },
  resultDistress: { backgroundColor: 'rgba(255,68,68,0.15)', borderColor: '#ff4444' },
  resultNormal: { backgroundColor: 'rgba(68,255,68,0.15)', borderColor: '#44ff44' },
  resultIcon: { fontSize: 50, textAlign: 'center', marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: 20 },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  confidenceLabel: { color: '#aaa', fontSize: 14 },
  confidenceValue: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  confidenceBarBg: { backgroundColor: '#333', borderRadius: 10, height: 10, marginBottom: 15, overflow: 'hidden' },
  confidenceBarFill: { height: '100%', borderRadius: 10 },
  logCard: { backgroundColor: '#1a1a1a', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#333' },
  logTitle: { color: '#ff4444', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  logEmpty: { color: '#555', fontSize: 14 },
  logItem: { color: '#aaa', fontSize: 12, marginBottom: 5 },
});
