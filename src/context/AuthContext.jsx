// contexts/AuthContext.jsx
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
import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
    targetStorage.setItem("role", role);
  }

  secondaryStorage.removeItem(TOKEN_STORAGE_KEY);
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

function clearStoredAuthState() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_META_STORAGE_KEY);
  sessionStorage.removeItem(USER_META_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_LOGIN_KEY);
  localStorage.removeItem("role");
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
  const [require2FA, setRequire2FA] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${API_URL}/users/me`, {
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
              two_factor_enabled: data.two_factor_enabled,
            };

            // Nếu là admin/staff và chưa bật 2FA, yêu cầu setup
            if (data.role === "admin" && !data.two_factor_enabled) {
              setRequire2FA(true);
              setPending2FAUser({ email: data.email });
              setUser(null);
              setLoading(false);
              return;
            }
            if (data.role === "staff") {
              console.log("🔵 Staff logged in - no 2FA required");
              // Set user normally
              setUser({
                uid: firebaseUser.uid,
                user_id: data.user_id,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: data.role,
                cinema_id: data.cinema_id,
                cinema_name: data.cinema_name,
                two_factor_enabled: data.two_factor_enabled,
              });

              storeAuthState({
                token,
                role: data.role,
                remember,
              });
              persistUserMeta(meta, remember);
              setLoading(false);
              return;
            }

            setUser({
              uid: firebaseUser.uid,
              user_id: data.user_id,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: data.role,
              cinema_id: data.cinema_id,
              cinema_name: data.cinema_name,
              two_factor_enabled: data.two_factor_enabled,
            });

            storeAuthState({
              token,
              role: data.role,
              remember,
            });
            persistUserMeta(meta, remember);
          } else if (res.status === 401 || res.status === 403) {
            await signOut(auth);
            clearStoredAuthState();
            setUser(null);
          } else {
            const meta = getStoredUserMeta();
            if (meta?.role) {
              setUser({
                uid: firebaseUser.uid,
                user_id: meta.user_id,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: meta.role,
                cinema_id: meta.cinema_id,
                cinema_name: meta.cinema_name,
              });
            } else {
              setUser(firebaseUser);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          const meta = getStoredUserMeta();
          if (meta?.role) {
            setUser({
              uid: firebaseUser.uid,
              user_id: meta.user_id,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: meta.role,
              cinema_id: meta.cinema_id,
              cinema_name: meta.cinema_name,
            });
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

  const verify2FALogin = async (email, token, backupCode = null) => {
    try {
      console.log("🔵 Sending verify request for:", email);

      const response = await axios.post(`${API_URL}/2fa/verify-login`, {
        email,
        token,
        backupCode,
      });

      console.log("🔵 Response:", response.data);

      if (response.data.success) {
        const firebaseToken = response.data.token;
        const userData = response.data.user;

        // 🔥 LƯU TOKEN VÀO CẢ HAI NƠI
        localStorage.setItem("token", firebaseToken);
        sessionStorage.setItem("token", firebaseToken);

        // 🔥 LƯU TRẠNG THÁI ĐÃ VERIFY 2FA - DÙNG localStorage LÀ CHÍNH
        localStorage.setItem("twoFactorVerified", "true");
        localStorage.setItem("twoFactorVerifiedTime", Date.now().toString());
        sessionStorage.setItem("twoFactorVerified", "true");

        console.log("✅ 2FA Verified successfully!");
        console.log(
          "twoFactorVerified (localStorage):",
          localStorage.getItem("twoFactorVerified"),
        );
        console.log(
          "twoFactorVerified (sessionStorage):",
          sessionStorage.getItem("twoFactorVerified"),
        );

        // 🔥 QUAN TRỌNG: Cập nhật user state với đầy đủ thông tin
        setUser({
          uid: userData.uid || email,
          user_id: userData.user_id,
          email: userData.email,
          displayName: userData.name || userData.displayName,
          photoURL: userData.photoURL || null,
          role: userData.role,
          cinema_id: userData.cinema_id,
          cinema_name: userData.cinema_name,
          two_factor_enabled: true,
        });

        setRequire2FA(false);
        setPending2FAUser(null);

        return userData;
      }
      throw new Error("Xác thực thất bại");
    } catch (error) {
      console.error("2FA verification error:", error);
      throw new Error(
        error.response?.data?.message || "Mã xác thực không đúng",
      );
    }
  };
  // Login with Email
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
        password,
      );
      const token = await credential.user.getIdToken();

      // Sync user với backend
      await fetch(`${API_URL}/auth/sync-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Lấy thông tin user từ backend (có role)
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Không lấy được thông tin user từ backend");
      }

      const data = await res.json();
      const role = data?.role; // 🔥 KHAI BÁO role TRƯỚC KHI DÙNG
      const twoFactorEnabled = data?.two_factor_enabled;

      if (!role) {
        throw new Error("Không lấy được role từ backend");
      }

      // Kiểm tra 2FA cho admin/staff
      if (role === "admin" && twoFactorEnabled) {
        // Cần 2FA, chưa set user ngay
        console.log("🔵 2FA REQUIRED for:", email);
        setRequire2FA(true);
        setPending2FAUser({ email, password, remember: rememberLogin });
        storeAuthState({ token, role, remember: rememberLogin });
        window.location.href = `/auth?require2fa=true&email=${encodeURIComponent(email)}`;

        return null;
      }

      // Login bình thường
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
          two_factor_enabled: twoFactorEnabled,
        },
        rememberLogin,
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
        two_factor_enabled: twoFactorEnabled,
      };

      setUser(userData);
      return userData;
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      throw err;
    }
  };

  // Register
  const registerWithEmail = async (
    email,
    password,
    displayName,
    phone = "",
    dob = "",
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

    await fetch(`${API_URL}/auth/sync-user`, {
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
      }),
    });

    await signOut(auth);

    return credential;
  };

  // Login with Google
  // Login with Google
  const loginWithGoogle = async (remember = true) => {
    try {
      const rememberLogin = Boolean(remember);
      const persistence = rememberLogin
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const credential = await signInWithPopup(auth, googleProvider);
      const token = await credential.user.getIdToken();

      await fetch(`${API_URL}/auth/sync-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Không lấy được thông tin user từ backend");
      }

      const data = await res.json();
      const role = data?.role; // 🔥 KHAI BÁO TRƯỚC KHI DÙNG
      const twoFactorEnabled = data?.two_factor_enabled;

      if (!role) {
        throw new Error("Không lấy được role từ backend");
      }

      // Kiểm tra 2FA cho admin/staff
      if (role === "admin" && twoFactorEnabled) {
        console.log("🔵 2FA REQUIRED for Google login:", data.email);
        setRequire2FA(true);
        setPending2FAUser({ email: data.email, remember: rememberLogin });
        storeAuthState({ token, role, remember: rememberLogin });
        window.location.href = `/auth?require2fa=true&email=${encodeURIComponent(email)}`;

        return null;
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
          two_factor_enabled: twoFactorEnabled,
        },
        rememberLogin,
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
        two_factor_enabled: twoFactorEnabled,
      };

      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      clearStoredAuthState(); // Hàm này đã được cập nhật
      setUser(null);
      setRequire2FA(false);
      setPending2FAUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        require2FA,
        pending2FAUser,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        verify2FALogin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
