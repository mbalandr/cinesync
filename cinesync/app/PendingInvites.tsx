import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { addUserToGroup } from '@/services/GroupService';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function PendingInvites() {
  const [invites, setInvites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    const fetchInvites = async () => {
      console.log('Fetching invites for', user.email);
      const q = query(
        collection(FIRESTORE_DB, 'invites'),
        where('email', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Found invites:', results);
      setInvites(results);
    };

    fetchInvites();
  }, [user]);

  const acceptInvite = async (invite: any) => {
    try {
      await addUserToGroup(invite.groupId, user.uid);
      await deleteDoc(doc(FIRESTORE_DB, 'invites', invite.id));
      Alert.alert('Success', 'You have joined the group!');
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not join group');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#F7EEDB" size="large" />
      </View>
    );
  }
  const declineInvite = async (invite: any) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, 'invites', invite.id));
      Alert.alert('Success', 'You have decline the invite');
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not decline group')
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={24} color="#FFD700" />
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title]}>Pending Invites</Text>

        {invites.length === 0 ? (
          <Text style={{ color: '#aaa', marginTop: 16, textAlign: 'center' }}>You have no pending invites.</Text>
        ) : (
          <FlatList
            data={invites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.inviteItem}>
                <Text style={styles.text}>Group ID: {item.groupId}</Text>
                <View style={styles.buttonRow}>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title="Accept"
                      onPress={() => acceptInvite(item)}
                      color="#007BFF" // Replace with your actual blue if different
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title="Decline"
                      onPress={() => declineInvite(item)}
                      color="#FF3B30" // Hue-shifted red from blue
                    />
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#242423', flex: 1 },
  title: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#F7EEDB', marginBottom: 20 },
  inviteItem: {
    padding: 12,
    backgroundColor: '#333',
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  text: { 
    color: '#F7EEDB',
    marginBottom: 4, 
  },
  buttonWrapper: {
    flex: 1,
  },
});