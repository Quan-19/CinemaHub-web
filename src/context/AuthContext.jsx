import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  reload,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { auth, db, googleProvider } from "../../firebase/firebaseConfig";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const RANDOM_AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema1",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema2",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema3",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema4",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema5",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema6",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema7",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cinema8",
];

const AuthContext = createContext(null);

function createAuthError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function upsertUserDocument(user, extra = {}) {
  if (!user?.uid) return;
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const baseData = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    provider: user.providerData?.[0]?.providerId ?? "password",
    lastLoginAt: serverTimestamp(),
    ...extra,
  };

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...baseData,
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, baseData, { merge: true });
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = async (email, password, remember) => {

  const persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistence);

  const credential = await signInWithEmailAndPassword(auth, email, password);

  await reload(credential.user);

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw createAuthError(
      "auth/email-not-verified",
      "Email chưa được xác minh."
    );
  }

  // sync MySQL
  const token = await credential.user.getIdToken();

  await fetch("http://localhost:5000/api/auth/sync-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await upsertUserDocument(credential.user);

  return credential;
};
  const registerWithEmail = async (email, password, displayName, phone) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const randomAvatar =
      RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
    await updateProfile(credential.user, {
      displayName,
      photoURL: randomAvatar,
    });
    await sendEmailVerification(credential.user);
    await upsertUserDocument(credential.user, {
      displayName,
      photoURL: randomAvatar,
      phone: phone ?? "",
      provider: "password",
      emailVerified: false,
    });
    await signOut(auth);
    return credential;
  };

  const resendEmailVerification = async (email, password, remember = false) => {
    if (!email || !password) {
      throw createAuthError(
        "auth/missing-email-for-verification",
        "Vui lòng nhập email và mật khẩu để gửi lại xác minh.",
      );
    }

    const persistence = remember
      ? browserLocalPersistence
      : browserSessionPersistence;
    await setPersistence(auth, persistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await reload(credential.user);

    if (credential.user.emailVerified) {
      await upsertUserDocument(credential.user, { emailVerified: true });
      return { alreadyVerified: true };
    }

    await sendEmailVerification(credential.user);
    await signOut(auth);
    return { verificationSent: true, email: credential.user.email ?? email };
  };

  const loginWithGoogle = async () => {

  const credential = await signInWithPopup(auth, googleProvider);

  const token = await credential.user.getIdToken();

  await fetch("http://localhost:5000/api/auth/sync-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await upsertUserDocument(credential.user);

  return credential;

};

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        resendEmailVerification,
        loginWithGoogle,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
