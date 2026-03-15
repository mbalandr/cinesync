import React, { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  View,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from 'lodash.debounce';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { searchMovies, MovieSummary } from '../services/MoviesService';
import { DismissKeyboardView } from '../services/DismissKeyboardView';
import { getAuth } from 'firebase/auth';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MovieSearch = () => {
  const { groupId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const router = useRouter();
  const user = getAuth().currentUser;

  const debouncedSearch = useMemo(
    () =>
      debounce(async (text: string) => {
        if (!text.trim()) {
          setResults([]);
          setError(null);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const res = await searchMovies(text);
          setResults(res);
        } catch (err: any) {
          setError(err.message || 'Error fetching movies');
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  useEffect(() => {
    if (!groupId || !user) return;
    const fetchWatchlist = async () => {
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
      const listSnap = await getDoc(movieListRef);
      if (!listSnap.exists()) return;

      const currentMovies: any[] = listSnap.data()?.movies || [];
      setWatchlist(currentMovies.map((m) => m.imdbID));
    };
    fetchWatchlist();
  }, [groupId]);

  const toggleWatchlist = async (imdbID: string) => {
    if (!groupId || !user) return;

    const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;

    const listId = groupSnap.data()?.groupList;
    if (!listId) return;

    const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
    const listSnap = await getDoc(movieListRef);

    const currentMovies: any[] = listSnap.exists() ? listSnap.data()?.movies || [] : [];
    const alreadyInList = currentMovies.some((m) => m.imdbID === imdbID);

    const updatedMovies = alreadyInList
      ? currentMovies.filter((m) => m.imdbID !== imdbID)
      : [...currentMovies, { imdbID, addedBy: user.uid, addedAt: new Date() }];

    await setDoc(movieListRef, {
      groupId,
      createdAt: listSnap.exists() ? listSnap.data()?.createdAt : new Date(),
      movies: updatedMovies,
    });

    setWatchlist(updatedMovies.map((m) => m.imdbID));
    
    router.back();
  };

  const openDetails = (imdbID: string) => {
    router.push(`/MovieDetails/${imdbID}/${groupId}`);
  };

  if (!groupId) {
    return <Text style={{ color: 'red', padding: 20 }}>Group ID is missing or invalid.</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#242423' }}>
    <DismissKeyboardView style={[styles.safe, { paddingTop: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={24} color="#FFD700" />
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Add to list</Text>
      <TextInput
        style={styles.input}
        placeholder="Start typing a movie title…"
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {loading && <ActivityIndicator style={{ marginTop: 12 }} color="#F7EEDB" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.imdbID}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openDetails(item.imdbID)}>
              <Text style={styles.title}>{item.Title} ({item.Year})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleWatchlist(item.imdbID)}>
              <Text style={styles.toggleButton}>
                {watchlist.includes(item.imdbID) ? '➖' : '➕'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      />
    </DismissKeyboardView>
    </SafeAreaView>
  );
};

export default MovieSearch;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#242423' },
  heading: {
    fontSize: 24,
    color: '#F7EEDB',
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#fff',
  },
  errorText: {
    color: '#FF5555',
    marginTop: 12,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
  },
  toggleButton: {
    fontSize: 20,
    color: '#F7EEDB',
    marginLeft: 12,
  },
});