// app/InviteUser.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InviteUser() {
  const { groupId } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleInvite = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user || !email) {
      Alert.alert('Error', 'You must be logged in and enter an email.');
      return;
    }

    try {
      await addDoc(collection(FIRESTORE_DB, 'invites'), {
        email,
        groupId,
        sentBy: user.uid,
        sentAt: serverTimestamp(),
        status: 'pending',
      });
      Alert.alert('Success', `Invite sent to ${email}`);
      setEmail('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error sending invite');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={24} color="#FFD700" />
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Invite someone to join this group</Text>
      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title="Send Invite" onPress={handleInvite} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#242423' },
  label: { textAlign: 'center', color: '#F7EEDB', fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#F5CB5C',
    color: '#F7EEDB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});