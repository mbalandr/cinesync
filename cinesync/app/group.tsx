import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc,query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/Group.styles';
import { useFocusEffect } from '@react-navigation/native';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<number>(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const toggleEdit = () => setIsEditing(!isEditing);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 🚀 Optimized fetchUserGroups
  const fetchUserGroups = async () => {
    if (!user) return;
    try {
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userGroupsIds = userSnap.data()?.groups || [];

      if (userGroupsIds.length === 0) {
        setGroups([]);
        return;
      }

      const groupPromises = userGroupsIds.map((groupId: string) =>
        getDoc(doc(FIRESTORE_DB, 'groups', groupId))
      );

      const groupDocs = await Promise.all(groupPromises);

      const userGroups = groupDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      setGroups(userGroups);
    } catch (err) {
      console.error('Error loading user groups:', err);
      Alert.alert('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  //fetching Pending Invites
  const fetchPendingInvites = async () => {
    if (!user) return;
  
    try {
      const q = query(
        collection(FIRESTORE_DB, 'invites'),
        where('email', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const inviteCount = snapshot.size;
      setPendingInvites(inviteCount);
    } catch (err) {
      console.error('Error fetching invites:', err);
    }
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) return;
      try {
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        setAvatarUri(userSnap.data()?.avatarUri || null);
      } catch (error) {
        console.error('Failed to fetch avatar:', error);
      }
    };

    if (authChecked) {
      fetchAvatar();
    }
  }, [authChecked]);


  useFocusEffect(
    useCallback(() => {
      if (authChecked) {
        fetchUserGroups();
        fetchPendingInvites();
      }
    }, [authChecked])
  );

  if (!authChecked) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => router.replace('/login')}>
          {/* <MaterialCommunityIcons name="chevron-left" size={24} color="#F6C343" /> */}
          <Text style={{ fontSize: 16, color:"#F6C343" }}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {"Who's watching?"}
          </Text>
        </View>
      </View>

      {/* Groups Grid */}
      <ScrollView contentContainerStyle={styles.groupContainer}>
        <View style={styles.groupGrid}>
          {loading ? (
            <Text style={{ color: '#aaa' }}>Loading...</Text>
          ) : groups.length === 0 ? (
            <Text style={{ color: '#aaa' }}></Text>
          ) : (
            groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                style={styles.groupWrapper}
                onPress={() => !isEditing && router.push({ pathname: '/homescreen', params: { groupId: group.id } })}
              >
                <View style={[styles.avatarCircleLarge, { backgroundColor: group.color || '#F6C343', overflow: 'hidden' }]}>
                  {group.profilePicture ? (
                    <Image source={{ uri: group.profilePicture }} style={{ width: '100%', height: '100%' }} resizeMode="cover"  />
                  ) : (
                  <MaterialCommunityIcons name="account" size={64} color="#000" />

                  )} 
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={() => router.push(`/InviteUser?groupId=${group.id}`)}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.groupLabel}>{group.name}</Text>
              </TouchableOpacity>
            ))
          )}

          {/* Add Group Button */}
          {!isEditing && (
            <TouchableOpacity style={styles.groupWrapper} onPress={() => router.push('/addgroup')}>
              <View style={styles.avatarCircleLarge}>
                <MaterialCommunityIcons name="plus" size={48} color="#ccc" />
              </View>
              <Text style={styles.addGroupText}>Add Group</Text>
            </TouchableOpacity>
          )}

          {/* Make grid even */}
          {(groups.length + (!isEditing ? 1 : 0)) % 2 !== 0 && (
            <View style={[styles.groupWrapper, { opacity: 0 }]} />
          )}
        </View>
      </ScrollView>
      
      {/* Profile */}
      {!isEditing && (
        <TouchableOpacity style={styles.userProfile} onPress={() => router.push('/user')}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
              onError={() => setAvatarUri(null)} // fallback to icon if image fails
            />
          ) : (
            <MaterialCommunityIcons name="account" size={32} color="#000" style={{padding: 9,}} />
          )}
        </TouchableOpacity>  
      )}
      
      {/* Invite Notification Function - Bottom Right */}
      {!isEditing && (
        <TouchableOpacity style={styles.mail} onPress={() => router.push('/PendingInvites')}>
          {pendingInvites > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {pendingInvites > 9 ? '9+' : pendingInvites}
              </Text>
            </View>
          )}
          <MaterialCommunityIcons name="email" size={32} color="#000" />
        </TouchableOpacity>      
      )}
    </SafeAreaView>
  );
}