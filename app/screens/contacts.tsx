import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '9876543210', relation: 'Family' },
    { id: 2, name: 'Dad', phone: '9876543211', relation: 'Family' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Family');

  const addContact = () => {
    if (!newName || !newPhone) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }
    setContacts(prev => [...prev, { id: Date.now(), name: newName, phone: newPhone, relation: newRelation }]);
    setNewName('');
    setNewPhone('');
    setShowAdd(false);
    Alert.alert('Contact Added', `${newName} has been added as emergency contact!`);
  };

  const deleteContact = (id, name) => {
    Alert.alert('Delete Contact', `Remove ${name} from emergency contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setContacts(prev => prev.filter(c => c.id !== id)) }
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Emergency Contacts</Text>
          <Text style={s.headerSub}>{contacts.length} contacts will be notified</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(!showAdd)}>
          <Text style={s.addBtnText}>{showAdd ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {showAdd && (
          <View style={s.addCard}>
            <Text style={s.addTitle}>ADD NEW CONTACT</Text>
            <TextInput style={s.input} value={newName} onChangeText={setNewName} placeholder="Full Name" placeholderTextColor="#444" />
            <TextInput style={s.input} value={newPhone} onChangeText={setNewPhone} placeholder="Phone Number" placeholderTextColor="#444" keyboardType="phone-pad" />
            <View style={s.relationRow}>
              {['Family', 'Friend', 'Other'].map(r => (
                <TouchableOpacity key={r} style={[s.relationBtn, newRelation === r && s.relationBtnActive]} onPress={() => setNewRelation(r)}>
                  <Text style={[s.relationBtnText, newRelation === r && s.relationBtnTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.saveBtn} onPress={addContact}>
              <Text style={s.saveBtnText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {contacts.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>No Contacts Yet</Text>
            <Text style={s.emptySub}>Add emergency contacts who will be notified when distress is detected</Text>
          </View>
        )}

        {contacts.map((contact) => (
          <View key={contact.id} style={s.contactCard}>
            <View style={s.contactAvatar}>
              <Text style={s.contactAvatarText}>{contact.name[0]}</Text>
            </View>
            <View style={s.contactInfo}>
              <Text style={s.contactName}>{contact.name}</Text>
              <Text style={s.contactPhone}>{contact.phone}</Text>
              <View style={s.contactRelationBadge}>
                <Text style={s.contactRelation}>{contact.relation}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.deleteBtn} onPress={() => deleteContact(contact.id, contact.name)}>
              <Text style={s.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>ABOUT EMERGENCY CONTACTS</Text>
          <Text style={s.infoText}>These contacts will receive an immediate alert with your location when distress is detected or SOS is triggered.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#060612' },
  header: { padding:20, borderBottomWidth:1, borderBottomColor:'#12122a', flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle: { color:'white', fontSize:22, fontWeight:'800' },
  headerSub: { color:'#444', fontSize:13, marginTop:4 },
  addBtn: { width:44, height:44, borderRadius:22, backgroundColor:'#7c6fff', justifyContent:'center', alignItems:'center' },
  addBtnText: { color:'white', fontSize:24, fontWeight:'300' },
  scroll: { padding:20, paddingBottom:100 },
  addCard: { backgroundColor:'#0d0d1f', borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:'#7c6fff' },
  addTitle: { color:'#7c6fff', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  input: { backgroundColor:'#060612', borderRadius:12, padding:14, color:'white', fontSize:15, marginBottom:14, borderWidth:1, borderColor:'#1a1a2e' },
  relationRow: { flexDirection:'row', gap:10, marginBottom:16 },
  relationBtn: { flex:1, backgroundColor:'#060612', borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:'#1a1a2e' },
  relationBtnActive: { backgroundColor:'#7c6fff', borderColor:'#7c6fff' },
  relationBtnText: { color:'#555', fontSize:13, fontWeight:'600' },
  relationBtnTextActive: { color:'white' },
  saveBtn: { backgroundColor:'#7c6fff', borderRadius:12, padding:15, alignItems:'center' },
  saveBtnText: { color:'white', fontSize:15, fontWeight:'700' },
  emptyCard: { alignItems:'center', padding:40 },
  emptyIcon: { fontSize:60, marginBottom:16 },
  emptyTitle: { color:'white', fontSize:18, fontWeight:'700', marginBottom:8 },
  emptySub: { color:'#555', fontSize:14, textAlign:'center', lineHeight:22 },
  contactCard: { backgroundColor:'#0d0d1f', borderRadius:18, padding:18, marginBottom:14, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1, borderColor:'#12122a' },
  contactAvatar: { width:52, height:52, borderRadius:26, backgroundColor:'#7c6fff', justifyContent:'center', alignItems:'center' },
  contactAvatarText: { color:'white', fontSize:22, fontWeight:'800' },
  contactInfo: { flex:1 },
  contactName: { color:'white', fontSize:16, fontWeight:'700' },
  contactPhone: { color:'#666', fontSize:13, marginTop:3 },
  contactRelationBadge: { backgroundColor:'#12122a', borderRadius:8, paddingHorizontal:8, paddingVertical:3, alignSelf:'flex-start', marginTop:6 },
  contactRelation: { color:'#7c6fff', fontSize:11, fontWeight:'600' },
  deleteBtn: { padding:8 },
  deleteBtnText: { fontSize:20 },
  infoCard: { backgroundColor:'#0d0d1f', borderRadius:18, padding:18, borderWidth:1, borderColor:'#12122a', marginTop:6 },
  infoTitle: { color:'#444', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:10 },
  infoText: { color:'#666', fontSize:13, lineHeight:20 },
});
