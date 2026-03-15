import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/User.styles';

const genreOptions = [
  'Fantasy', 'Sci-fi', 'Comedy', 'Drama', 'Horror',
  'Romance', 'Action', 'Mystery', 'Documentary',
];

const User = () => {
  const [username, setUsername] = useState('User');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const auth = getAuth();
  const router = useRouter();

  const user = auth.currentUser;
  const isDarkMode = theme === 'dark';

  const themeStyles = {
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
    textColor: isDarkMode ? '#ffffff' : '#000000',
    inputBackground: isDarkMode ? '#1e1e1e' : '#f0f0f0',
    inputBorderColor: isDarkMode ? '#444' : '#ccc',
    highlightColor: '#f0c94d',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setAuthChecked(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authChecked || !user) return;

    const fetchUserInfo = async () => {
      try {
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        if (data) {
          setUsername(data.username || 'User');
          setBio(data.bio || '');
          setAvatarUri(data.avatarUri || null);
          setTheme(data.theme || 'dark');
          setFavoriteGenres(data.genres || []);
        }
      } catch (err) {
        console.error('Error loading user info:', err);
      }
    };

    fetchUserInfo();
  }, [authChecked]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);  
    }
  };

  const toggleGenre = async (genre: string) => {
    if (!user) return;

    const updatedGenres = favoriteGenres.includes(genre)
      ? favoriteGenres.filter((g) => g !== genre)
      : [...favoriteGenres, genre];

    setFavoriteGenres(updatedGenres);

    await updateDoc(doc(FIRESTORE_DB, 'users', user.uid), {
      genres: updatedGenres,
    });
  };
  
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const saveUserInfo = async () => {
    if (!user) return;

    await updateDoc(doc(FIRESTORE_DB, 'users', user.uid), {
      username,
      bio,
      avatarUri,
      theme,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container2}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle]}>Profile</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }} >
            <MaterialCommunityIcons name="chevron-left" size={24} color='#F5CB5C' />
            <Text style={[styles.backText]}>{'Back'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveUserInfo}>
            <Text style={[styles.saveButtonText]}>Save</Text>
          </TouchableOpacity>
          
        </View>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <View style={[styles.avatarContainer]}>
            <View style={[styles.avatar, { backgroundColor: themeStyles.highlightColor, overflow: 'hidden' }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color={isDarkMode ? '#121212' : '#ffffff'} />
              )}
            </View>
            <View style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil" size={32} color="#242423" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Username */}
        <TextInput
          style={[styles.usernameInput]}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#888"
          textAlign="center"
        />

        {/* Bio */}
        <View style={styles.bioContainer}>
          <TextInput
            style={[ styles.bioInput,]}
            placeholder="Write your bio..."
            placeholderTextColor="#888"
            multiline
            value={bio}
            onChangeText={setBio}
            maxLength={150}
            numberOfLines={4}
          />
          <Text style={[styles.charCount, { color: '#888' }]}>{bio.length}/150</Text>
        </View>

        {/* Favorite Genres */}
        <View style={styles.infoSection}>
          <Text style={[styles.label]}>Favorite Genres: </Text>
          <TouchableOpacity onPress={() => setShowGenreSelector(true)}>
            <Text style={styles.genres}>
              {favoriteGenres.length > 0
                ? favoriteGenres.filter((g) => g.trim()).join(', ')
                : 'Select your favorites'}
            </Text>
        </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.infoSection, { marginTop: 20 }]}>
          <Text style={[styles.label]}>Theme: </Text>
          {['dark', 'light'].map((mode) => (
            <Pressable key={mode} onPress={() => setTheme(mode as 'light' | 'dark')}>
              <Ionicons
                name={mode === 'dark' ? 'moon' : 'sunny'}
                size={30}
                color={theme === mode ? themeStyles.highlightColor : '#fff'}
                style={{ marginHorizontal: 8 }}
              />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutButton,]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText,]}>Logout</Text>
        </Pressable>

        {/* Genre Modal */}
        <Modal visible={showGenreSelector} animationType="slide" transparent>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={[styles.modalContent, { backgroundColor: themeStyles.backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: themeStyles.textColor }]}>Select Favorite Genres</Text>
              <ScrollView>
                {genreOptions.map((genre) => {
                  const selected = favoriteGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.genreOption,
                        {
                          backgroundColor: selected
                            ? themeStyles.highlightColor
                            : themeStyles.inputBackground,
                          borderColor: themeStyles.inputBorderColor,
                        },
                      ]}
                      onPress={() => toggleGenre(genre)}
                    >
                      <Text style={{ color: selected ? '#000' : themeStyles.textColor }}>{genre}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: themeStyles.highlightColor }]}
                onPress={() => setShowGenreSelector(false)}
              >
                <Text style={{ color: '#000' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default User;