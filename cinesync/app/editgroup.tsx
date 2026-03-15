import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/AddGroup.styles';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../utils/imageUpload';

const EditGroupScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<null | 'sort' | 'fairness'>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    if (isLoading) return;

    console.log("Starting image picker...");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        try {
          // Delete old image if it exists
          if (groupImage) {
            console.log("Deleting old image:", groupImage);
            await deleteImageFromFirebase(groupImage);
          }

          // Upload new image
          const downloadURL = await uploadImageToFirebase(result.assets[0].uri, 'groupImages');
          console.log("New image uploaded:", downloadURL);

          // Update Firestore
          const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
          await updateDoc(groupRef, {
            profilePicture: downloadURL,
            updatedAt: new Date(),
            lastUpdatedBy: user!.uid,
          });

          setGroupImage(downloadURL);
          Alert.alert('Success', 'Image updated successfully!');
        } catch (uploadError) {
          console.error('Error updating image:', uploadError);
          Alert.alert('Error', 'Failed to update image. Please try again.');
        }
      }
    } catch (pickError) {
      console.error('Error picking image:', pickError);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    const fetchGroupInfo = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
        const groupSnap = await getDoc(groupRef);
        const data = groupSnap.data();
        
        if (data) {
          setGroupName(data.name || 'Group');
          setGroupImage(data.profilePicture || null);
          setSortBy(data.sortBy || 'Rotten Tomatoes Rating');
          setFairnessFilter(data.fairnessFilter ?? true);

          // Fetch user's role from group_members
          const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${user?.uid}`);
          const memberSnap = await getDoc(memberRef);
          const memberData = memberSnap.data();
          console.log('User role data:', memberData);
          setUserRole(memberData?.role || null);
        }
      } catch (err) {
        console.error('Error loading group info:', err);
      }
    };

    if (authChecked && groupId) fetchGroupInfo();
  }, [authChecked, groupId, user?.uid]);

  const updateGroup = async (
    name: string,
    userId: string,
    profilePicture: string | null,
    fairness: boolean,
    sort: string
  ) => {
    try {
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
      await updateDoc(groupRef, {
        name: name,
        profilePicture: profilePicture,
        fairnessFilter: fairness,
        sortBy: sort,
        lastUpdatedBy: userId,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error('Failed to update group: ' + error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group name required');
      return;
    }
    try {
      await updateGroup(groupName.trim(), user!.uid, groupImage, fairnessFilter, sortBy);
      router.push({ pathname: '/homescreen', params: { groupId: groupId } });
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    const groupIdString = groupId as string;
    if (!groupIdString) {
      console.error('No groupId provided');
      Alert.alert('Error', 'No group selected');
      return;
    }
    try {
      // Get all group members
      const membersRef = collection(FIRESTORE_DB, `groups/${groupIdString}/group_members`);
      const membersSnap = await getDocs(membersRef);
      const updatePromises = membersSnap.docs.map(async (memberDoc) => {
        const userId = memberDoc.id;
        const userRef = doc(FIRESTORE_DB, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        if (userData) {
          const updatedGroups = userData.groups?.filter((gId: string) => gId !== groupIdString) || [];
          await updateDoc(userRef, {
            groups: updatedGroups
          });
        }
      });
      // Wait for all user updates to complete
      await Promise.all(updatePromises);
      // Mark group as deleted
      const groupRef = doc(FIRESTORE_DB, 'groups', groupIdString);
      const groupSnap = await getDoc(groupRef);
      const groupData = groupSnap.data();
      if (groupData && groupData.groupList) {
        const movieListRef = doc(FIRESTORE_DB, 'movieLists', groupData.groupList);
        await deleteDoc(movieListRef);
      }
      await deleteDoc(groupRef);
      router.replace('/group');
    } catch (error: any) {
      console.error('Error during deletion process:', error);
      Alert.alert('Error', 'Failed to delete group: ' + (error.message || 'Unknown error'));
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.uid || !groupId) {
      Alert.alert('Error', 'User or group not found');
      return;
    }
    try {
      // Remove user from group_members subcollection (delete the doc)
      const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${user.uid}`);
      await deleteDoc(memberRef);

      // Remove group from user's groups array
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (userData) {
        const updatedGroups = (userData.groups || []).filter((gId: string) => gId !== groupId);
        await updateDoc(userRef, { groups: updatedGroups });
      }

      router.replace('/group');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to leave group: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }} >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFD700" />
          <Text style={[styles.backText, { color: "#FFD700" }]}>{'Back'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdateGroup}>
          <Text style={[styles.saveButtonText, { color: "#FFD700" }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        {/* Group Image */}
        <TouchableOpacity 
          onPress={pickImage} 
          style={styles.imageWrapper}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={[styles.defaultImage, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          ) : groupImage ? (
            <Image 
              source={{ uri: groupImage }} 
              style={styles.groupImage}
              onError={(error) => {
                console.error('Error loading image:', error);
                setGroupImage(null);
              }}
            />
          ) : (
            <View style={styles.defaultImage}>
              <MaterialCommunityIcons name="account" size={64} color="#C9A84F" />
            </View>
          )}
          {!isLoading && (
            <View style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil" size={32} color="#242423" />
            </View>
          )}
        </TouchableOpacity>

        {/* Group Name */}
        <TextInput
          style={styles.groupNameInput}
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Sort By */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sort by:</Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(dropdownOpen === 'sort' ? null : 'sort')}
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>{sortBy}</Text>
              <Ionicons
                name={dropdownOpen === 'sort' ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#FFD700"
              />
            </TouchableOpacity>
            {dropdownOpen === 'sort' && (
              <View style={styles.dropdownMenu}>
                {['Rotten Tomatoes Rating', 'Liked']
                  .filter(option => option !== sortBy)
                  .map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setSortBy(option);
                        setDropdownOpen(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>

        {/* Fairness Filter */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Fairness filter:</Text>
          <View style={styles.filterControlGroup}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(dropdownOpen === 'fairness' ? null : 'fairness')}
              style={[styles.dropdown, { width: 50 }]}
            >
              <Text style={styles.dropdownText}>{fairnessFilter ? 'On' : 'Off'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              style={styles.infoIconContainer}
            >
              <MaterialCommunityIcons name="information-outline" size={20} color="#F5CB5C" />
            </TouchableOpacity>

            {dropdownOpen === 'fairness' && (
              <View style={[styles.dropdownMenu, { width: 50, position: 'absolute', top: '100%', left: 0, zIndex: 10 }]}>
                {['On', 'Off']
                  .filter(option => option !== (fairnessFilter ? 'On' : 'Off'))
                  .map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setFairnessFilter(option === 'On');
                        setDropdownOpen(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Update/Delete/Leave Group Button */}
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          console.log('Button pressed, userRole:', userRole);
          if (userRole === 'admin') {
            setShowDeleteModal(true);
          } else {
            setShowLeaveModal(true);
          }
        }}
      >
        <Text style={styles.deleteText}>
          {userRole === 'admin' ? 'Delete Group' : 'Leave Group'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showInfoModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>Fairness Filter</Text>
            <Text style={styles.infoModalText}>
              The user whose movie was most recently watched will have all their movies removed from view in the watchlist until a different user's movie is watched.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>Delete Group</Text>
            <Text style={styles.infoModalText}>
              Are you sure you want to delete this group? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 15  }}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: '#aaa' }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: '#FF6B6B' }]}
                onPress={async () => {
                  setShowDeleteModal(false);
                  await handleDeleteGroup();
                }}
              >
                <Text style={[styles.closeButtonText, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leave Group Confirmation Modal */}
      <Modal
        visible={showLeaveModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>Leave Group</Text>
            <Text style={styles.infoModalText}>
              Are you sure you want to leave this group? You will need to be re-invited to rejoin.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 15  }}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: '#aaa' }]}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: '#FF6B6B' }]}
                onPress={async () => {
                  setShowLeaveModal(false);
                  await handleLeaveGroup();
                }}
              >
                <Text style={[styles.closeButtonText, { color: '#fff' }]}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EditGroupScreen;