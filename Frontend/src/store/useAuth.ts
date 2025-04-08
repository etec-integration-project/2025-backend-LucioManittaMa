import { create } from 'zustand';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyDFXBbGHNu6IJ9h4VBXxgwh9k1IzwFTHYM",
  authDomain: "urban-sneakers-store.firebaseapp.com",
  projectId: "urban-sneakers-store",
  storageBucket: "urban-sneakers-store.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      throw error;
    }
  },
  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      throw error;
    }
  }
}));

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  useAuth.setState({ user, loading: false });
});