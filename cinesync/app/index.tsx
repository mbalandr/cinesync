// app/index.tsx
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  if (loggedIn === null) return null; // or loading spinner

  return <Redirect href={loggedIn ? '/group' : '/login'} />;
}
