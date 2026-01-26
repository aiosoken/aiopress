import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { User } from "@/types";

const googleProvider = new GoogleAuthProvider();

// Firebase初期化チェック
function checkFirebaseInit() {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please check your environment variables.");
  }
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your environment variables.");
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  checkFirebaseInit();
  
  const userCredential = await createUserWithEmailAndPassword(
    auth!,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  await setDoc(doc(db!, "users", user.uid), {
    email: user.email,
    displayName,
    photoURL: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  checkFirebaseInit();
  const userCredential = await signInWithEmailAndPassword(auth!, email, password);
  const user = userCredential.user;

  // ユーザードキュメントがない場合は作成
  const userDoc = await getDoc(doc(db!, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db!, "users", user.uid), {
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return user;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  checkFirebaseInit();
  const userCredential = await signInWithPopup(auth!, googleProvider);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db!, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db!, "users", user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return user;
}

export async function signOut(): Promise<void> {
  checkFirebaseInit();
  await firebaseSignOut(auth!);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    console.error("Firebase Auth is not initialized");
    // 初期化されていない場合は、nullをコールバックして即座に返す
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser(): Promise<User | null> {
  if (!auth || !db) return null;

  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        ...userDoc.data(),
      } as User;
    }
  } catch (error) {
    console.error("Failed to get user document:", error);
  }

  // Firestoreからの取得に失敗した場合、Firebase Authの情報を使用
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    photoURL: firebaseUser.photoURL || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}
