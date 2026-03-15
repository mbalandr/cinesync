import { createGroupDoc, addGroupMember } from '../data/groups';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc,setDoc, updateDoc, arrayUnion, collection, addDoc, getDoc } from 'firebase/firestore';

export const createGroup = async (name: string, userId: string, profilePicture: null | string, fairnessFilter: boolean, sortBy: string): Promise<string> => {
  const groupRef = await createGroupDoc(name, userId);

  await addGroupMember(groupRef.id, userId, 'admin');

  const userRef = doc(FIRESTORE_DB, 'users', userId);
  const newListRef = await addDoc(collection(FIRESTORE_DB, 'movieLists'), {
    groupId: groupRef.id,
    createdAt: new Date(),
    movies: [],
  });

  const newListId = newListRef.id;

  await setDoc(groupRef, {
    groupList: newListId,
    profilePicture: profilePicture,
    fairnessFilter: fairnessFilter,
    sortBy: sortBy,
  }, { merge: true });
  await updateDoc(userRef, {
    groups: arrayUnion(groupRef.id),
  });

  return groupRef.id;
};

export const addUserToGroup = async (groupId: string, userId: string): Promise<void> => {
  const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${userId}`);
  await setDoc(memberRef, {
    joinedAt: new Date(),
    role: 'member',
  }, { merge: true });

  const userRef = doc(FIRESTORE_DB, 'users', userId);
  await setDoc(userRef, {
    groups: arrayUnion(groupId),
  }, { merge: true });
};

export async function getGroupMembersCount(groupId: string): Promise<number> {
  const snap = await getDoc(doc(FIRESTORE_DB, 'groups', groupId));
  return snap.exists() ? (snap.data().members?.length ?? 0) : 0;
};