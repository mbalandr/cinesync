import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { createUserWithEmailAndPassword, updateCurrentUser } from 'firebase/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { setDoc, doc } from 'firebase/firestore';
import { styles } from '../styles/SignUp.styles';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const db = FIRESTORE_DB;
  const router = useRouter();

  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        username: username.trim(),
        createdAt: new Date(),
        groups: [],
      }, { merge: true });

      await updateCurrentUser(auth, user);
      router.replace('/group');
    } catch (error: any) {
      console.error("Sign-up error:", error);
      alert('Sign up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  function login(): void {
    router.push('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an</Text>
      <Text style={styles.title}>Account</Text>

      {/* Username Field */}
      <Text style={styles.labelEmail}>Username*</Text>
      <TextInput
        value={username}
        placeholder="Username"
        placeholderTextColor="#E8EDDF"
        style={styles.inputEmail}
        autoCapitalize="none"
        onChangeText={(text) => setUsername(text)}
      />

      {/* Email Field */}
      <Text style={styles.labelEmail}>Email Address*</Text>
      <TextInput
        value={email}
        placeholder="Email"
        placeholderTextColor="#E8EDDF"
        style={styles.inputEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password Field */}
      <TextInput
        value={password}
        placeholder="Password*"
        placeholderTextColor="#E8EDDF"
        style={styles.inputPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity onPress={signUp} style={styles.signInButton}>
        <Text style={styles.signInText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginButton}>
        <Text style={styles.greyText}>Already have an account? </Text>
        <TouchableOpacity onPress={login}>
          <Text style={styles.registerLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}