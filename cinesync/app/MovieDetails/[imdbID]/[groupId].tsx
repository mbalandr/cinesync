import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  SafeAreaView,
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getMovieDetails,
  getPosterUrl,
  MovieDetails as MD,
} from '../../../services/MoviesService';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { getAuth } from 'firebase/auth';

const SOURCE_LABELS: Record<string, string> = {
  'Internet Movie Database': 'IMDb',
  'Rotten Tomatoes': 'Rotten Tomatoes',
  'Metacritic': 'Metacritic',
};

export default function MovieDetailsScreen() {
  const { imdbID, groupId } = useLocalSearchParams<{ imdbID: string; groupId: string }>();
  const [movie, setMovie] = useState<MD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const db = FIRESTORE_DB;
  const router = useRouter();

  async function toggleWatchlistStatus() {
    const user = getAuth().currentUser;
    if (!user || !imdbID) return;

    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        console.error('group document not found');
        return;
      }

      const listId = groupSnap.data()?.groupList;
      if (!listId) {
        console.error('No list ID found for this group');
        return;
      }

      const movieListRef = doc(db, 'movieLists', listId);
      const listSnap = await getDoc(movieListRef);

      const newMovieEntry = { imdbID, addedBy: user.uid };

      let currentMovies: any[] = [];
      if (listSnap.exists()) {
        currentMovies = listSnap.data()?.movies || [];
      }

      const alreadyInList = currentMovies.some((m) => m.imdbID === imdbID);

      let updatedMovies;
      if (alreadyInList) {
        updatedMovies = currentMovies.filter((m) => m.imdbID !== imdbID);
      } else {
        updatedMovies = [...currentMovies, newMovieEntry];
      }

      await setDoc(movieListRef, {
        groupId,
        createdAt: listSnap.exists() ? listSnap.data()?.createdAt : new Date(),
        movies: updatedMovies,
      });

      setIsInWatchlist(!alreadyInList);
    } catch (err) {
      console.error('Error updating watchlist:', err);
    }
  }

  async function checkIfInWatchlist() {
    const user = getAuth().currentUser;
    if (!user || !imdbID) return;

    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) return;

      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(db, 'movieLists', listId);
      const listSnap = await getDoc(movieListRef);

      if (!listSnap.exists()) return;

      const currentMovies: any[] = listSnap.data()?.movies || [];
      setIsInWatchlist(currentMovies.some((m) => m.imdbID === imdbID));
    } catch (err) {
      console.error('Error checking watchlist:', err);
    }
  }

  async function loadUserRating() {
    const user = getAuth().currentUser;
    if (!user || !imdbID) return;

    try {
      const ratingRef = doc(db, 'userRatings', `${user.uid}_${imdbID}`);
      const ratingSnap = await getDoc(ratingRef);
      if (ratingSnap.exists()) {
        setUserRating(ratingSnap.data()?.rating || 0);
      }
    } catch (err) {
      console.error('Failed to load rating:', err);
    }
  }

  async function saveUserRating(rating: number) {
    const user = getAuth().currentUser;
    if (!user || !imdbID) return;

    try {
      const ratingRef = doc(db, 'userRatings', `${user.uid}_${imdbID}`);
      await setDoc(ratingRef, {
        imdbID,
        userId: user.uid,
        movieId: imdbID, 
        rating,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to save rating:', err);
    }
  }

  useEffect(() => {
    if (!imdbID) return;
    getMovieDetails(imdbID)
      .then((m) => setMovie(m))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    checkIfInWatchlist();
    loadUserRating();
  }, [imdbID]);

  if (loading) {
    return <ActivityIndicator style={styles.centered} color="#F7EEDB" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Movie not found.</Text>
      </View>
    );
  }

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            onRate(star);
            saveUserRating(star);
          }}
        >
          <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={24} color="#FFD700" />
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: getPosterUrl(movie.imdbID) }}
          style={styles.poster}
          resizeMode="contain"
        />
        <Text style={styles.title}>{movie.Title}</Text>
        <Text style={styles.info}>Year: {movie.Year}</Text>
        <Text style={styles.info}>Genre: {movie.Genre}</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            toggleWatchlistStatus();
            router.replace('/homescreen');
          }}
        >
          <Text style={styles.addButtonText}>
            {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Your Rating</Text>
        <StarRating rating={userRating} onRate={setUserRating} />

        {movie.Ratings && movie.Ratings.length > 0 && (
          <View style={styles.ratingsContainer}>
            <Text style={styles.sectionHeading}>Ratings</Text>
            {movie.Ratings.map((r) => (
              <Text key={r.Source} style={styles.ratingText}>
                {SOURCE_LABELS[r.Source] ?? r.Source}: {r.Value}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.plot}>{movie.Plot}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#242423',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2B2C5A',
  },
  content: {
    padding: 16,
  },
  poster: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F7EEDB',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#F7EEDB',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7EEDB',
    marginTop: 16,
    marginBottom: 4,
  },
  ratingsContainer: {
    marginTop: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#F7EEDB',
    marginBottom: 2,
  },
  plot: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 12,
    textAlign: 'justify',
  },
  errorText: {
    color: '#FF5555',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#F6C343',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  star: {
    fontSize: 28,
    marginHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#F6C343',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
