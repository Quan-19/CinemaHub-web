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

  // ================= LOGIN =================
  // const loginWithEmail = async (email, password, remember) => {
  //   try {
  //     const persistence = remember
  //       ? browserLocalPersistence
  //       : browserSessionPersistence;

  //     await setPersistence(auth, persistence);

  //     const credential = await signInWithEmailAndPassword(
  //       auth,
  //       email,
  //       password,
  //     );

  //     await reload(credential.user);

  //     const token = await credential.user.getIdToken();

  //     // 🔥 LẤY ROLE TỪ BACKEND
  //     const res = await fetch("http://localhost:5000/api/users/me", {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!res.ok) {
  //       throw new Error("Không lấy được thông tin user từ backend");
  //     }

  //     let data = {};

  //     try {
  //       const text = await res.text();
  //       console.log("RAW RESPONSE:", text);

  //       data = text ? JSON.parse(text) : {};
  //     } catch (e) {
  //       console.error("❌ JSON parse error:", e);
  //     }

  //     console.log("USER DATA:", data);

  //     const role = data?.role;

  //     if (!role) {
  //       throw new Error("Không lấy được role từ backend");
  //     }

  //     // lưu role
  //     localStorage.setItem("role", role);

  //     // 🔥 ADMIN BYPASS VERIFY
  //     if (!credential.user.emailVerified && role !== "admin") {
  //       await signOut(auth);
  //       throw createAuthError(
  //         "auth/email-not-verified",
  //         "Email chưa được xác minh.",
  //       );
  //     }

  //     // 🔥 SYNC MYSQL
  //     await fetch("http://localhost:5000/api/auth/sync-user", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: credential.user.displayName,
  //         avatar: credential.user.photoURL,
  //       }),
  //     });

  //     await upsertUserDocument(credential.user);

  //     return {
  //       ...credential,
  //       role,
  //     };
  //   } catch (err) {
  //     console.error("LOGIN ERROR:", err);
  //     throw err;
  //   }
  // };
  const loginWithEmail = async (email, password, remember) => {
    try {
      const persistence = remember
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const token = await credential.user.getIdToken();

      // ✅ 1. SYNC TRƯỚC
      await fetch("http://localhost:5000/api/auth/sync-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credential.user.displayName,
          avatar: credential.user.photoURL,
        }),
      });

      // ✅ 2. LẤY ROLE SAU
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const role = data.role;

      localStorage.setItem("role", role);
      localStorage.setItem("token", token); // 🔥 lưu token

      return {
        ...credential,
        role,
      };
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      throw err;
    }
  };
  // ================= REGISTER =================
  const registerWithEmail = async (
    email,
    password,
    displayName,
    phone,
    dob,
  ) => {
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

    const token = await credential.user.getIdToken();

    // 🔥 LUÔN LÀ USER (KHÔNG SET ADMIN Ở FRONTEND)
    await fetch("http://localhost:5000/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: displayName,
        phone: phone,
        avatar: randomAvatar,
        dob: dob,
        role: "user",
      }),
    });

    await signOut(auth);

    return credential;
  };

  // ================= RESEND VERIFY =================
  const resendEmailVerification = async (email, password, remember = false) => {
    if (!email || !password) {
      throw createAuthError(
        "auth/missing-email-for-verification",
        "Vui lòng nhập email và mật khẩu.",
      );
    }

    const persistence = remember
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);

    await reload(credential.user);

    if (credential.user.emailVerified) {
      await upsertUserDocument(credential.user, {
        emailVerified: true,
      });
      return { alreadyVerified: true };
    }

    await sendEmailVerification(credential.user);
    await signOut(auth);

    return { verificationSent: true };
  };

  // ================= GOOGLE LOGIN =================
  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);

    const token = await credential.user.getIdToken();

    await fetch("http://localhost:5000/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: credential.user.displayName,
        avatar: credential.user.photoURL,
      }),
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
