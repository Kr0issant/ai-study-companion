import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [user]);

  const checkUsernameUnique = async (username) => {
    if (!username) return false;
    const docRef = doc(db, 'usernames', username);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, username) => {
    const isUnique = await checkUsernameUnique(username);
    if (!isUnique) {
      throw new Error("That username is already taken. Please choose another.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    const capitalized = username.replace(/\b\w/g, char => char.toUpperCase());

    const newData = {
      uid: newUser.uid,
      email: newUser.email,
      username: username,
      settings: {
        displayName: capitalized,
        aiProvider: 'gemini',
        openaiApiKey: '',
        geminiApiKey: ''
      },
      focusStats: {
        focusBlocksToday: 0,
        lastFocusDate: new Date().toDateString()
      }
    };

    await setDoc(doc(db, 'users', newUser.uid), newData);
    await setDoc(doc(db, 'usernames', username), { uid: newUser.uid });
    setUserData(newData);

    return userCredential;
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      const docRef = doc(db, 'users', loggedUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const baseName = loggedUser.displayName || loggedUser.email.split('@')[0];

        // Ensure Google generated usernames are unique
        let strippedName = baseName.replaceAll(' ', '');
        if (strippedName == "") strippedName = "unknown";
        let finalUsername = strippedName;
        let isUnique = await checkUsernameUnique(finalUsername);
        while (!isUnique) {
          finalUsername = `${strippedName}${Math.floor(Math.random() * 100000)}`;
          isUnique = await checkUsernameUnique(finalUsername);
        }

        const newData = {
          uid: loggedUser.uid,
          email: loggedUser.email,
          username: finalUsername,
          settings: {
            displayName: baseName,
            aiProvider: 'gemini',
            openaiApiKey: '',
            geminiApiKey: ''
          },
          focusStats: {
            focusBlocksToday: 0,
            lastFocusDate: new Date().toDateString()
          }
        };
        await setDoc(docRef, newData);
        await setDoc(doc(db, 'usernames', finalUsername), { uid: loggedUser.uid });
        setUserData(newData);
      } else {
        setUserData(docSnap.data());
      }
      return result;
    } catch (error) {
      console.error("Google Auth Setup Error:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUsername = async (newUsername) => {
    if (!user || !userData) throw new Error("Not logged in.");
    if (newUsername === userData.username) return;

    const isUnique = await checkUsernameUnique(newUsername);
    if (!isUnique) throw new Error("Username is already taken.");

    // Delete old username lock
    if (userData.username) {
      await deleteDoc(doc(db, 'usernames', userData.username));
    }

    // Set new username lock
    await setDoc(doc(db, 'usernames', newUsername), { uid: user.uid });

    // Update main users doc
    await setDoc(doc(db, 'users', user.uid), { username: newUsername }, { merge: true });

    // Update local context manually
    setUserData(prev => ({ ...prev, username: newUsername }));
  };

  const value = {
    user,
    userData,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    checkUsernameUnique,
    updateUsername
  };

  // Wait for initial Firebase auth check before rendering app
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
