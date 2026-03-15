import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { getMovieDetails } from '@/services/MoviesService';
import { getAuth } from 'firebase/auth';

// Import your unselected icons
const thumbsUpIcon = require('@/assets/images/icons/like.png');
const thumbsDownIcon = require('@/assets/images/icons/dislike.png');
// Import your selected (yellow) icons
const thumbsUpSelectedIcon = require('@/assets/images/icons/likeSelected.png');
const thumbsDownSelectedIcon = require('@/assets/images/icons/dislikeSelected.png');
// Import seen/not seen icons
const seenIcon = require('@/assets/images/icons/seen.png');
const notSeenIcon = require('@/assets/images/icons/notSeen.png');


type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
  rating?: number;
  watchedBy?: string[]; // Array of user IDs who have watched the movie
  watchedAt?: any;      // ← added for fairness filter
  userVote?: 'up' | 'down' | null;
  seen?: boolean;
  userHasWatched?: boolean;
  watchedCount?: number;
  groupMemberCount?: number;
};

type MovieWithDetails = MovieEntry & {
  title: string;
  poster: string;
  genre: string;
  username: string;
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
  seen: boolean;
  rottenTomatoesRating?: number;
  userRating: number;
  watchedCount: number;
  groupMemberCount: number;
  userHasWatched: boolean;
};

type Props = {
  groupId: string;
  initialType?: 'watchlist' | 'watched';
  genreFilter: string;
};

const MovieList: React.FC<Props> = ({ groupId, initialType = 'watchlist', genreFilter }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [allMovies, setAllMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>(initialType);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const router = useRouter();
  const currentUser = getAuth().currentUser;
  const insets = useSafeAreaInsets();
  const [fairnessFilter, setFairnessFilter] = useState<boolean>(false);


  // Fetch group members
  useEffect(() => {
    if (!groupId) return;
    const fetchGroupMembers = async () => {
      try {
        const membersCollectionRef = collection(FIRESTORE_DB, `groups/${groupId}/group_members`);
        const membersSnapshot = await getDocs(membersCollectionRef);
        if (!membersSnapshot.empty) {
          const memberIds = membersSnapshot.docs.map(doc => doc.data().userId);
          setGroupMembers(memberIds);
        } else {
          setGroupMembers([]);
        }
      } catch (err) {
        console.error('Error fetching group members:', err);
        setGroupMembers([]);
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    const unsub = onSnapshot(
      doc(FIRESTORE_DB, 'groups', groupId),
      snap => {
        setFairnessFilter(snap.data()?.fairnessFilter ?? false);
      }
    );
    return () => unsub();
  }, [groupId]);

  const fetchUserPreferences = async (movieEntries: MovieEntry[]) => {
    if (!currentUser) return movieEntries;
    try {
      const movieIds = movieEntries.map(entry => entry.imdbID);
      const votesMap: Record<string, 'up' | 'down' | null> = {};
      const ratingsMap: Record<string, number> = {};
      
      await Promise.all(movieIds.map(async (movieId) => {
        const voteRef = doc(FIRESTORE_DB, 'movieVotes', `${currentUser.uid}_${movieId}_${groupId}`);
        const voteSnap = await getDoc(voteRef);
        if (voteSnap.exists()) {
          votesMap[movieId] = voteSnap.data()?.vote || null;
        }
        
        const ratingRef = doc(FIRESTORE_DB, 'userRatings', `${currentUser.uid}_${movieId}`);
        const ratingSnap = await getDoc(ratingRef);
        if (ratingSnap.exists()) {
          ratingsMap[movieId] = ratingSnap.data()?.rating || 0;
        }
      }));
      
      return movieEntries.map(entry => {
        const watchedBy = entry.watchedBy || [];
        const userHasWatched = watchedBy.includes(currentUser.uid);
        return {
          ...entry,
          userVote: votesMap[entry.imdbID] || null,
          seen: watchedBy.length === groupMembers.length && groupMembers.length > 0,
          userHasWatched: userHasWatched,
          userRating: ratingsMap[entry.imdbID] || 0,
          watchedCount: watchedBy.length,
          groupMemberCount: groupMembers.length
        };
      });
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      return movieEntries;
    }
  };

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    const entriesWithPreferences = await fetchUserPreferences(movieEntries);
    const groupSnap = await getDoc(doc(FIRESTORE_DB, 'groups', groupId));
    const sortBy = groupSnap.exists() ? groupSnap.data()?.sortBy : null;
  
    const votesQuery = query(
      collection(FIRESTORE_DB, 'movieVotes'),
      where('groupId', '==', groupId)
    );
    const voteSnapshots = await getDocs(votesQuery);
  
    const voteCounts: Record<string, { up: number; down: number }> = {};
    const usernames: Record<string, string> = {};
  
    // Add this new query to get all ratings for the group's movies
    try {
      // Skip ratings query if there are no movies
      if (movieEntries.length === 0) {
        setAllMovies([]);
        setMovies([]);
        return;
      }

  
    let movieRatings: Record<string, number[]> = {};
    try {
      const ratingsQuery = query(
        collection(FIRESTORE_DB, 'userRatings'),
        where('movieId', 'in', movieEntries.map(e => e.imdbID))
      );
      const ratingsSnapshots = await getDocs(ratingsQuery);
      ratingsSnapshots.forEach(snap => {
        const { movieId, rating } = snap.data() as any;
        if (!movieRatings[movieId]) movieRatings[movieId] = [];
        movieRatings[movieId].push(rating);
      });
    } catch (err) {
      console.warn('Error fetching group ratings:', err);
    }
    
      voteSnapshots.forEach((snap) => {
        const { movieId, vote } = snap.data();
        if (!voteCounts[movieId]) voteCounts[movieId] = { up: 0, down: 0 };
        if (vote === 'up') voteCounts[movieId].up += 1;
        else if (vote === 'down') voteCounts[movieId].down += 1;
      });
    
      const detailedMovies = await Promise.all(
        entriesWithPreferences.map(async (entry) => {
          try {
            const details = await getMovieDetails(entry.imdbID);
            const voteStat = voteCounts[entry.imdbID] || { up: 0, down: 0 };
    
            let username = usernames[entry.addedBy];
            if (!username) {
              const userSnap = await getDoc(doc(FIRESTORE_DB, 'users', entry.addedBy));
              username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';
              usernames[entry.addedBy] = username;
            }
    
            const rottenTomatoesRating = details.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;
            const numericRating = rottenTomatoesRating ? parseInt(rottenTomatoesRating) : 0;
    
            // Calculate average group rating
            const ratings = movieRatings[entry.imdbID] || [];
            const averageRating = ratings.length > 0 
              ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
              : 0;
    
            return {
              ...entry,
              title: details.Title || 'Untitled',
              poster: details.Poster || '',
              genre: details.Genre || 'Unknown genre',
              username,
              thumbsUp: voteStat.up,
              thumbsDown: voteStat.down,
              userVote: (entry as any).userVote || null,
              seen: (entry as any).seen || false,
              rottenTomatoesRating: numericRating,
              userRating: averageRating, // This now represents the average group rating
              watchedCount: (entry as any).watchedCount || 0,
              groupMemberCount: (entry as any).groupMemberCount || 0,
              userHasWatched: (entry as any).userHasWatched || false
            };
          } catch (err) {
            console.warn('Error fetching details for', entry.imdbID, err);
            const watchedBy = entry.watchedBy || [];
            const userHasWatched = currentUser ? watchedBy.includes(currentUser.uid) : false;
            const allWatched = watchedBy.length === groupMembers.length && groupMembers.length > 0;
            
            return {
              ...entry,
              title: 'Unknown',
              poster: '',
              genre: 'Unknown genre',
              username: 'Unknown',
              thumbsUp: 0,
              thumbsDown: 0,
              userVote: (entry as any).userVote || null,
              seen: (entry as any).seen || false,
              rottenTomatoesRating: 0,
              userRating: 0, // No ratings available
              watchedCount: (entry as any).watchedCount || 0,
              groupMemberCount: (entry as any).groupMemberCount || 0,
              userHasWatched: (entry as any).userHasWatched || false
            };
          }
        })
      );
    
      const sortedMovies = 
        sortBy === 'Liked'
        ? detailedMovies.sort((a, b) =>
            (b.thumbsUp - b.thumbsDown) - (a.thumbsUp - a.thumbsDown)
          )
        : sortBy === 'Rotten Tomatoes Rating'
        ? detailedMovies.sort((a, b) => (b.rottenTomatoesRating || 0) - (a.rottenTomatoesRating || 0))
        : detailedMovies.sort(
            (a, b) => a.addedAt?.toDate?.() - b.addedAt?.toDate?.()
          );
    
      setAllMovies(sortedMovies);
      filterMoviesByActiveTab(sortedMovies);
    } catch (err) {
      console.error('Error fetching movie ratings:', err);
      // Set empty arrays to prevent undefined behavior
      setAllMovies([]);
      setMovies([]);
        }
  };

  const filterMoviesByActiveTab = (moviesList = allMovies) => {
    // split out watched vs. watchlist
    const watched = moviesList.filter(m => m.seen);
    let filtered = moviesList.filter(m =>
      activeTab === 'watchlist' ? !m.seen : m.seen
    );

    // fairness filter: hide culprit’s remaining movies
    if (fairnessFilter && activeTab === 'watchlist' && watched.length > 0) {
      // sort by the watchedAt timestamp, newest first
      const sorted = [...watched].sort((a, b) => {
        const aTime = a.watchedAt?.toDate
          ? a.watchedAt.toDate().getTime()
          : new Date(a.watchedAt).getTime();
        const bTime = b.watchedAt?.toDate
          ? b.watchedAt.toDate().getTime()
          : new Date(b.watchedAt).getTime();
        return bTime - aTime;
      });
      const culprit = sorted[0].addedBy;
      filtered = filtered.filter(m => m.addedBy !== culprit);
    }

    // genre filter
    if (genreFilter.trim()) {
      filtered = filtered.filter(m =>
        m.genre?.toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    setMovies(filtered);
  };


  useEffect(() => {
    filterMoviesByActiveTab();
  }, [activeTab, allMovies, fairnessFilter, genreFilter]);


  useEffect(() => {
    if (!groupId) return;
    
    let movieListUnsubscribe: () => void;
    let userPreferencesUnsubscribe: () => void;
    let currentMovieEntries: MovieEntry[] = [];
    
    const setupListeners = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        
        if (!groupSnap.exists()) return;
        
        const listId = groupSnap.data()?.groupList;
        if (!listId) return;
        
        const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
        movieListUnsubscribe = onSnapshot(movieListRef, (docSnap) => {
          if (docSnap.exists()) {
            currentMovieEntries = docSnap.data()?.movies || [];
            fetchMovieDetails(currentMovieEntries);
          } else {
            setMovies([]);
            setAllMovies([]);
          }
          setLoading(false);
        });
        
        if (currentUser) {
          const votesCollectionRef = collection(FIRESTORE_DB, 'movieVotes');
          const votesQuery = query(
            votesCollectionRef,
            where('userId', '==', currentUser.uid),
            where('groupId', '==', groupId)
          );
          
          const ratingsCollectionRef = collection(FIRESTORE_DB, 'userRatings');
          const ratingsQuery = query(
            ratingsCollectionRef,
            where('userId', '==', currentUser.uid)
          );
          
          userPreferencesUnsubscribe = onSnapshot(votesQuery, () => {
            if (currentMovieEntries.length > 0) {
              fetchMovieDetails(currentMovieEntries);
            }
          });
          
          onSnapshot(ratingsQuery, () => {
            if (currentMovieEntries.length > 0) {
              fetchMovieDetails(currentMovieEntries);
            }
          });
        }
      } catch (error) {
        console.error('Error setting up listeners:', error);
      }
    };
    
    setupListeners();
    
    return () => {
      if (movieListUnsubscribe) movieListUnsubscribe();
      if (userPreferencesUnsubscribe) userPreferencesUnsubscribe();
    };
  }, [groupId, currentUser?.uid, groupMembers.length]);

  const removeMovie = async (imdbID: string) => {
    try {
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) return;
      
      const listId = groupSnap.data()?.groupList;
      if (!listId) return;
      
      const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
      const movieDoc = await getDoc(movieListRef);
      
      if (!movieDoc.exists()) return;
      
      const currentMovies: MovieEntry[] = movieDoc.data()?.movies || [];
      const updatedMovies = currentMovies.filter((m) => m.imdbID !== imdbID);
      
      await updateDoc(movieListRef, { movies: updatedMovies });
    } catch (err) {
      console.error('Failed to remove movie', err);
      Alert.alert('Error', 'Failed to remove movie');
    }
  };

  const castVote = async (imdbID: string, vote: 'up' | 'down') => {
    if (!currentUser) return;
    
    try {
      const movieIndex = allMovies.findIndex(m => m.imdbID === imdbID);
      if (movieIndex === -1) return;
      
      const movie = allMovies[movieIndex];
      let newVote: 'up' | 'down' | null = vote;
      let thumbsUpDelta = 0;
      let thumbsDownDelta = 0;
      
      if (movie.userVote === vote) {
        newVote = null;
        if (vote === 'up') thumbsUpDelta = -1;
        if (vote === 'down') thumbsDownDelta = -1;
      } else {
        if (movie.userVote === 'up') thumbsUpDelta = -1;
        else if (movie.userVote === 'down') thumbsDownDelta = -1;
        if (vote === 'up') thumbsUpDelta += 1;
        if (vote === 'down') thumbsDownDelta += 1;
      }
      
      const updatedMovie = {
        ...movie,
        userVote: newVote,
        thumbsUp: movie.thumbsUp + thumbsUpDelta,
        thumbsDown: movie.thumbsDown + thumbsDownDelta
      }
    
      
      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      
      const filteredMovieIndex = movies.findIndex(m => m.imdbID === imdbID);
      if (filteredMovieIndex !== -1) {
        const newMovies = [...movies];
        newMovies[filteredMovieIndex] = updatedMovie;
        setMovies(newMovies);
      }
      
      const voteId = `${currentUser.uid}_${imdbID}_${groupId}`;
      const voteRef = doc(FIRESTORE_DB, 'movieVotes', voteId);
      const voteSnap = await getDoc(voteRef);
      
      if (voteSnap.exists()) {
        const currentVote = voteSnap.data()?.vote;
        if (currentVote === vote) {
          await updateDoc(voteRef, { vote: null });
        } else {
          await updateDoc(voteRef, { vote });
        }
      } else {
        await setDoc(voteRef, {
          userId: currentUser.uid,
          movieId: imdbID,
          groupId: groupId,
          vote,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Failed to cast vote', err);
      Alert.alert('Error', 'Failed to save your vote');
    }
  };

  const toggleSeen = async (imdbID: string) => {
    if (!currentUser) return;

    try {
      const movieIndex = allMovies.findIndex(
        m => m.imdbID === imdbID
      );
      if (movieIndex === -1) return;

      const movie = allMovies[movieIndex];
      const newUserHasWatched = !movie.userHasWatched;

      let watchedByUsers = movie.watchedBy || [];
      if (newUserHasWatched) {
        if (!watchedByUsers.includes(currentUser.uid)) {
          watchedByUsers = [...watchedByUsers, currentUser.uid];
        }
      } else {
        watchedByUsers = watchedByUsers.filter(
          id => id !== currentUser.uid
        );
      }

      const allWatched =
        watchedByUsers.length === groupMembers.length &&
        groupMembers.length > 0;

      // update local state
      const updatedMovie = {
        ...movie,
        watchedBy: watchedByUsers,
        userHasWatched: newUserHasWatched,
        watchedCount: watchedByUsers.length,
        seen: allWatched,
        watchedAt: allWatched ? new Date() : null
      };

      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      filterMoviesByActiveTab(newAllMovies);

      // update Firestore array
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;
      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(
        FIRESTORE_DB,
        'movieLists',
        listId
      );
      const movieListSnap = await getDoc(movieListRef);
      if (!movieListSnap.exists()) return;

      const movieListData = movieListSnap.data();
      const persisted: MovieEntry[] = movieListData.movies || [];
      const updatedMovies = persisted.map(m => {
        if (m.imdbID === imdbID) {
          const nowFully = watchedByUsers.length === groupMembers.length;
          return {
            ...m,
            watchedBy: watchedByUsers,
            seen: nowFully,
            watchedAt: nowFully ? new Date() : null,
          };
        }
        return m;
      });

      await updateDoc(movieListRef, { movies: updatedMovies });
    } catch (err) {
      console.error('Failed to toggle user watched status', err);
      Alert.alert('Error', 'Failed to update watched status');
    }
  };

  const updateRating = async (imdbID: string, rating: number) => {
    if (!currentUser) return;
    
    try {
      const movieIndex = allMovies.findIndex(m => m.imdbID === imdbID);
      if (movieIndex === -1) return;
      
      const movie = allMovies[movieIndex];
      
      const updatedMovie = {
        ...movie,
        userRating: rating
      };
      
      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      
      const filteredMovieIndex = movies.findIndex(m => m.imdbID === imdbID);
      if (filteredMovieIndex !== -1) {
        const newMovies = [...movies];
        newMovies[filteredMovieIndex] = updatedMovie;
        setMovies(newMovies);
      }
      
      const ratingId = `${currentUser.uid}_${imdbID}`;
      const ratingRef = doc(FIRESTORE_DB, 'userRatings', ratingId);
      await setDoc(ratingRef, {
        userId: currentUser.uid,
        movieId: imdbID,
        rating,
        timestamp: new Date()
      });
      
      if (!movie.userHasWatched) {
        await toggleSeen(imdbID);
      }
    } catch (err) {
      console.error('Failed to update rating', err);
      Alert.alert('Error', 'Failed to save rating');
    }
  };

  const renderStars = (rating: number) => {
    const fullStar = '★';
    const halfStar = '🟊';
    const emptyStar = '☆';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return fullStar.repeat(fullStars) + 
           (hasHalfStar ? halfStar : '') + 
           emptyStar.repeat(emptyStars);
  };

  const renderRatingSelector = (imdbID: string, currentRating: number) => {
    return (
      <View style={styles.ratingSelector}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => updateRating(imdbID, star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.starText,
              star <= currentRating && styles.selectedStar
            ]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabSelector = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'watchlist' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('watchlist')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'watchlist' && styles.activeTabText
          ]}>Watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'watched' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('watched')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'watched' && styles.activeTabText
          ]}>Watched</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} color="#F7EEDB" />;
  }

  return (
    <View style={styles.container}>
      {renderTabSelector()}
      {movies.length === 0 ? (
        <Text style={styles.emptyText}>
          {activeTab === 'watchlist' ? 'No movies added yet.' : 'No watched movies yet.'}
        </Text>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.imdbID}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
          }}
          renderItem={({ item }) => (
            <View style={styles.movieCard}>
              <TouchableOpacity onPress={() => router.push(`/MovieDetails/${item.imdbID}/${groupId}`)}>
                <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
              </TouchableOpacity>
              <View style={styles.infoContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMovie(item.imdbID)}
                    >
                      <Text style={styles.removeIcon}>−</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.genre}>{item.genre}</Text>
                <Text style={styles.user}>Added by {item.username}</Text>
                {item.rottenTomatoesRating !== undefined && item.rottenTomatoesRating > 0 && (
                  <Text style={styles.ratingText}>
                    🍅 {item.rottenTomatoesRating}%
                  </Text>
                )}
                {activeTab === 'watchlist' ? (
                  <View style={styles.votesContainer}>
                    <View style={styles.leftVoteButtons}>
                      <TouchableOpacity
                        style={styles.voteButton}
                        onPress={() => castVote(item.imdbID, 'up')}
                      >
                        <Image
                          source={item.userVote === 'up' ? thumbsUpSelectedIcon : thumbsUpIcon}
                          style={styles.voteIcon}
                        />
                        <Text style={[
                          styles.voteCount,
                          item.userVote === 'up' && styles.activeVoteCount
                        ]}>{item.thumbsUp}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.voteButton}
                        onPress={() => castVote(item.imdbID, 'down')}
                      >
                        <Image
                          source={item.userVote === 'down' ? thumbsDownSelectedIcon : thumbsDownIcon}
                          style={styles.voteIcon}
                        />
                        <Text style={[
                          styles.voteCount,
                          item.userVote === 'down' && styles.activeVoteCount
                        ]}>{item.thumbsDown}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.seenContainer}>
                      <Text style={styles.watchCountText}>
                        {item.watchedCount}/{item.groupMemberCount}
                      </Text>
                      <TouchableOpacity
                        style={styles.seenButton}
                        onPress={() => toggleSeen(item.imdbID)}
                      >
                        <Image
                          source={item.userHasWatched ? seenIcon : notSeenIcon}
                          style={styles.voteIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.ratingContainer}>
                    <View style={styles.ratingSelectorContainer}>
                      <Text style={styles.ratingLabel}>Group Rating:</Text>
                      <Text style={styles.ratingDisplay}>{renderStars(item.userRating)}</Text>
                    </View>
                    <View style={styles.seenContainer}>
                      <Text style={styles.watchCountText}>
                        {item.watchedCount}/{item.groupMemberCount}
                      </Text>
                      <TouchableOpacity
                        style={styles.seenButton}
                        onPress={() => toggleSeen(item.imdbID)}
                      >
                        <Image
                          source={item.userHasWatched ? seenIcon : notSeenIcon}
                          style={styles.voteIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
          style={{ maxHeight: 725 }}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

export default MovieList;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F7EEDB',
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7EEDB',
    marginBottom: 8,
  },
  movieCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#FF6B6B',
    fontSize: 30,
    fontWeight: 'bold',
  },
  genre: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 4,
  },
  user: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 2,
  },
  votesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftVoteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  seenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  voteIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  voteCount: {
    color: '#F7EEDB',
    fontSize: 14,
  },
  activeVoteCount: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSelectorContainer: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  ratingSelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  starButton: {
    marginRight: 8,
  },
  starText: {
    fontSize: 24,
    color: '#AAAAAA',
  },
  selectedStar: {
    color: '#FFD700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
  ratingText: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 2,
    marginBottom: 4,
  },
  seenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchCountText: {
    color: '#F7EEDB',
    fontSize: 14,
  },
  ratingDisplay: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 4,
  },
});