import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carbon-nexus.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carbon-nexus",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carbon-nexus.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app)

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error)
})

export default app
