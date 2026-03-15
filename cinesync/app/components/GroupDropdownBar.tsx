import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

interface Group {
  id: string;
  name: string;
}

interface GroupDropdownBarProps {
  groups: Group[];
  currentGroup: Group;
  onGroupSelect: (groupId: string) => void;
}

const GroupDropdownBar: React.FC<GroupDropdownBarProps> = ({ groups, currentGroup, onGroupSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<number>(0);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleInvite = (groupId: string) => {
    router.push(`/InviteUser?groupId=${groupId}`);
    setDropdownOpen(false);
  };

  const handleEditGroup = (groupId: string) => {
    router.push(`/editgroup?groupId=${groupId}`);
    setDropdownOpen(false);
  };

  // Fetching Pending Invites
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

  // Fetch pending invites when component focuses
  useFocusEffect(
    useCallback(() => {
      fetchPendingInvites();
    }, [user])
  );

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
        onPress={() => router.replace('/group')}
        style={styles.iconLeft}
      >
        {/* Removed incite option from home button, only goes to group selection now */}
        <Ionicons name="home" size={24} color="#000" />
      </TouchableOpacity>

        <TouchableOpacity onPress={toggleDropdown}>
          <Text style={styles.groupName}>{currentGroup?.name ?? ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/PendingInvites')} style={styles.iconRight}>
          {pendingInvites > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {pendingInvites > 9 ? '9+' : pendingInvites}
              </Text>
            </View>
          )}
          <MaterialCommunityIcons name="email" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 300 }}>
            {groups.filter(Boolean).map((group) => (
              <View key={group.id} style={styles.groupRow}>
                <TouchableOpacity onPress={() => handleInvite(group.id)}>
                  <MaterialCommunityIcons name="account-multiple-plus" size={22} color="#000" style={{ marginRight: 16 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { onGroupSelect(group.id); toggleDropdown(); }} style={{ flex: 1 }}>
                  <Text style={styles.groupText}>{group?.name ?? ''}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleEditGroup(group.id)}>
                  <MaterialCommunityIcons name="cog" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default GroupDropdownBar;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6C343',
    padding: 12,
    borderRadius: 12,
    margin: 10,
    justifyContent: 'space-between',
  },
  iconLeft: {
    paddingRight: 8,
  },
  iconRight: {
    paddingLeft: 8,
    position: 'relative', // Added for notification badge positioning
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dropdown: {
    position: 'absolute',  
    top: '100%',            
    left: 10,              
    right: 10,            
    backgroundColor: '#F6C343',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    zIndex: 1001,        
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.25,   
    shadowRadius: 3.84,     
    elevation: 5,          
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  groupText: {
    fontSize: 16,
    color: '#000',
  },
  pendingButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  pendingButtonText: {
    color: '#F6C343',
    fontWeight: 'bold',
  },
  container: {
    position: 'relative',   
    zIndex: 1000,          
  },
  // Notification badge styles (copied from group.tsx)
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});