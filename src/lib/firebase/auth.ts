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
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { User } from "@/types";

const googleProvider = new GoogleAuthProvider();

// ユーザーデータキャッシュ（重複読み取り防止）
let userCache: { uid: string; user: User; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分

function getCachedUser(uid: string): User | null {
  if (userCache && userCache.uid === uid && Date.now() - userCache.timestamp < CACHE_TTL) {
    return userCache.user;
  }
  return null;
}

function setCachedUser(uid: string, user: User): void {
  userCache = { uid, user, timestamp: Date.now() };
}

export function clearUserCache(): void {
  userCache = null;
}

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
  const firebaseUser = userCredential.user;

  await updateProfile(firebaseUser, { displayName });

  const now = Timestamp.now();
  const newUserData = {
    email: firebaseUser.email,
    displayName,
    photoURL: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db!, "users", firebaseUser.uid), newUserData);

  // キャッシュに設定（getCurrentUserでの再読み取りを防止）
  const user = { id: firebaseUser.uid, ...newUserData, createdAt: now, updatedAt: now } as User;
  setCachedUser(firebaseUser.uid, user);

  return firebaseUser;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  checkFirebaseInit();
  const userCredential = await signInWithEmailAndPassword(auth!, email, password);
  const firebaseUser = userCredential.user;

  // ユーザードキュメントがない場合は作成し、キャッシュに設定
  const userDoc = await getDoc(doc(db!, "users", firebaseUser.uid));
  const now = Timestamp.now();

  if (userDoc.exists()) {
    // キャッシュに設定（getCurrentUserでの再読み取りを防止）
    const user = { id: firebaseUser.uid, ...userDoc.data() } as User;
    setCachedUser(firebaseUser.uid, user);
  } else {
    const newUserData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db!, "users", firebaseUser.uid), newUserData);
    // 新規ユーザーもキャッシュに設定
    const user = { id: firebaseUser.uid, ...newUserData, createdAt: now, updatedAt: now } as User;
    setCachedUser(firebaseUser.uid, user);
  }

  return firebaseUser;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  checkFirebaseInit();
  const userCredential = await signInWithPopup(auth!, googleProvider);
  const firebaseUser = userCredential.user;

  // ユーザードキュメントがない場合は作成し、キャッシュに設定
  const userDoc = await getDoc(doc(db!, "users", firebaseUser.uid));
  const now = Timestamp.now();

  if (userDoc.exists()) {
    // キャッシュに設定（getCurrentUserでの再読み取りを防止）
    const user = { id: firebaseUser.uid, ...userDoc.data() } as User;
    setCachedUser(firebaseUser.uid, user);
  } else {
    const newUserData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db!, "users", firebaseUser.uid), newUserData);
    // 新規ユーザーもキャッシュに設定
    const user = { id: firebaseUser.uid, ...newUserData, createdAt: now, updatedAt: now } as User;
    setCachedUser(firebaseUser.uid, user);
  }

  return firebaseUser;
}

export async function signOut(): Promise<void> {
  checkFirebaseInit();
  clearUserCache();
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

export async function updateUserProfile(
  displayName: string
): Promise<void> {
  checkFirebaseInit();

  const firebaseUser = auth!.currentUser;
  if (!firebaseUser) {
    throw new Error("ユーザーがログインしていません");
  }

  // Firebase Authのプロフィールを更新
  await updateProfile(firebaseUser, { displayName });

  // Firestoreのユーザードキュメントを更新
  const userRef = doc(db!, "users", firebaseUser.uid);
  await setDoc(
    userRef,
    {
      displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // キャッシュをクリア
  clearUserCache();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!auth || !db) return null;

  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  // キャッシュをチェック
  const cached = getCachedUser(firebaseUser.uid);
  if (cached) {
    return cached;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      const user = {
        id: firebaseUser.uid,
        ...userDoc.data(),
      } as User;
      setCachedUser(firebaseUser.uid, user);
      return user;
    }
  } catch (error) {
    console.error("Failed to get user document:", error);
  }

  // Firestoreからの取得に失敗した場合、Firebase Authの情報を使用
  const now = Timestamp.now();
  const fallbackUser = {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    photoURL: firebaseUser.photoURL || null,
    createdAt: now,
    updatedAt: now,
  } as User;
  setCachedUser(firebaseUser.uid, fallbackUser);
  return fallbackUser;
}
