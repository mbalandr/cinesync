// app/homescreen.tsx

import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import MovieSearch from './MovieSearch';
import MovieList from './movieList';
import GroupDropdownBar from './components/GroupDropdownBar';
import GenreFilter from './components/GenreFilter';

export default function Homescreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(groupId as string);
  const [genre, setGenre] = useState('');
  const user = FIREBASE_AUTH.currentUser;
  const [avatarUri, setAvatarUri] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchGroupsAndAvatar = async () => {
      if (!user) return;
      try {
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const groupIds = userData?.groups || [];
        setAvatarUri(userData?.avatarUri || null);

        const groupDocs = await Promise.all(
          groupIds.map((id: string) => getDoc(doc(FIRESTORE_DB, 'groups', id)))
        );

        const fetchedGroups = groupDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            name: doc.data()?.name || 'Unnamed Group',
          }));

        setGroups(fetchedGroups);

        if (!currentGroupId && fetchedGroups.length > 0) {
          setCurrentGroupId(fetchedGroups[0].id);
        }
      } catch (error) {
        console.error('Error fetching groups or avatar:', error);
      }
    };

    fetchGroupsAndAvatar();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!authChecked || (groups.length > 0 && !currentGroupId)) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  const currentGroup = groups.find((g) => g.id === currentGroupId);
  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GroupDropdownBar
        groups={groups.filter(Boolean)}
        currentGroup={currentGroup}
        onGroupSelect={(newGroupId) => {
          setCurrentGroupId(newGroupId);
          router.push({ pathname: '/homescreen', params: { groupId: newGroupId } });
        }}
      />


      <GenreFilter genre={genre} onGenreChange={setGenre} />
      <MovieList groupId={currentGroupId!} genreFilter={genre} />


      <View style={styles.floatingIconsContainer}>

        <TouchableOpacity style={styles.person} onPress={() => router.push('/user')}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
              onError={() => setAvatarUri(null)} // fallback to icon if image fails
            />
          ) : (
            <MaterialCommunityIcons name="account" size={32} color="black" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.add}
          onPress={() => router.push({ pathname: '/MovieSearch', params: { groupId: currentGroupId! } })}
        >
          <MaterialCommunityIcons name="plus" size={40} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    paddingHorizontal: 20,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#DD775C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingIconsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  person: {
    backgroundColor: '#D9B24C',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  add: {
    backgroundColor: '#D9B24C',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});