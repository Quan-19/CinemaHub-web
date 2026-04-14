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

const TOKEN_STORAGE_KEY = "token";
const ROLE_STORAGE_KEY = "role";
const REMEMBER_LOGIN_KEY = "rememberLogin";
const USER_META_STORAGE_KEY = "authUserMeta";

function getRememberPreference() {
  const stored = localStorage.getItem(REMEMBER_LOGIN_KEY);
  if (stored === null) return true;
  return stored === "true";
}

function storeAuthState({ token, role, remember }) {
  localStorage.setItem(REMEMBER_LOGIN_KEY, String(remember));

  const targetStorage = remember ? localStorage : sessionStorage;
  const secondaryStorage = remember ? sessionStorage : localStorage;

  if (token) {
    targetStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    targetStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (role) {
    targetStorage.setItem(ROLE_STORAGE_KEY, role);
  } else {
    targetStorage.removeItem(ROLE_STORAGE_KEY);
  }

  secondaryStorage.removeItem(TOKEN_STORAGE_KEY);
  secondaryStorage.removeItem(ROLE_STORAGE_KEY);
}

function getStoredUserMeta() {
  const raw =
    sessionStorage.getItem(USER_META_STORAGE_KEY) ||
    localStorage.getItem(USER_META_STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistUserMeta(meta, remember) {
  const targetStorage = remember ? localStorage : sessionStorage;
  const secondaryStorage = remember ? sessionStorage : localStorage;

  if (meta) {
    targetStorage.setItem(USER_META_STORAGE_KEY, JSON.stringify(meta));
  } else {
    targetStorage.removeItem(USER_META_STORAGE_KEY);
  }

  secondaryStorage.removeItem(USER_META_STORAGE_KEY);
}

function buildUserWithMeta(firebaseUser, meta = {}) {
  return {
    ...firebaseUser,
    user_id: meta.user_id,
    role: meta.role,
    cinema_id: meta.cinema_id,
    cinema_name: meta.cinema_name,
  };
}

function clearStoredAuthState() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_META_STORAGE_KEY);
  sessionStorage.removeItem(USER_META_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_LOGIN_KEY);
}

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            const remember = getRememberPreference();
            const meta = {
              user_id: data.user_id,
              role: data.role,
              cinema_id: data.cinema_id,
              cinema_name: data.cinema_name,
            };
            setUser(buildUserWithMeta(firebaseUser, meta));

            storeAuthState({
              token,
              role: data.role,
              remember,
            });
            persistUserMeta(meta, remember);
          } else if (res.status === 401 || res.status === 403) {
            // Token thực sự không hợp lệ -> đăng xuất
            await signOut(auth);
            clearStoredAuthState();
            setUser(null);
          } else {
            // Backend tạm lỗi: giữ phiên Firebase và fallback dữ liệu đã cache
            const meta = getStoredUserMeta();
            if (meta?.role) {
              setUser(buildUserWithMeta(firebaseUser, meta));
            } else {
              setUser(firebaseUser);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          const meta = getStoredUserMeta();
          if (meta?.role) {
            setUser(buildUserWithMeta(firebaseUser, meta));
          } else {
            setUser(firebaseUser);
          }
        }
      } else {
        setUser(null);
      }
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
      const rememberLogin = Boolean(remember);
      const persistence = rememberLogin
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await credential.user.getIdToken();

      // Sync user với backend
      await fetch("http://localhost:5000/api/auth/sync-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Lấy thông tin user từ backend (có role)
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Không lấy được thông tin user từ backend");
      }

      const data = await res.json();
      const role = data?.role;

      if (!role) {
        throw new Error("Không lấy được role từ backend");
      }

      storeAuthState({
        token,
        role,
        remember: rememberLogin,
      });
      persistUserMeta(
        {
          user_id: data.user_id,
          role,
          cinema_id: data.cinema_id,
          cinema_name: data.cinema_name,
        },
        rememberLogin
      );

      // 🔥 Tạo user object có role và set vào context
      const userData = {
        uid: credential.user.uid,
        user_id: data.user_id,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
        role: role,
        cinema_id: data.cinema_id,
        cinema_name: data.cinema_name,
      };
      setUser(userData);

      return userData;
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
    dob
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
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
        "Vui lòng nhập email và mật khẩu."
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
  const loginWithGoogle = async (remember = true) => {
    const rememberLogin = Boolean(remember);
    const persistence = rememberLogin
      ? browserLocalPersistence
      : browserSessionPersistence;
    await setPersistence(auth, persistence);

    const credential = await signInWithPopup(auth, googleProvider);
    const token = await credential.user.getIdToken();

    await fetch("http://localhost:5000/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const res = await fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Không lấy được thông tin user từ backend");
    }

    const data = await res.json();
    const role = data?.role;

    if (!role) {
      throw new Error("Không lấy được role từ backend");
    }

    storeAuthState({
      token,
      role,
      remember: rememberLogin,
    });
    persistUserMeta(
      {
        user_id: data.user_id,
        role,
        cinema_id: data.cinema_id,
        cinema_name: data.cinema_name,
      },
      rememberLogin
    );

    const userData = {
      uid: credential.user.uid,
      user_id: data.user_id,
      email: credential.user.email,
      displayName: credential.user.displayName,
      photoURL: credential.user.photoURL,
      role: role,
      cinema_id: data.cinema_id,
      cinema_name: data.cinema_name,
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      clearStoredAuthState();
      setUser(null);
    }
  };

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
