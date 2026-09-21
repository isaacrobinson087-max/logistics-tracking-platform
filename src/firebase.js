import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBvMtd7S_NVdGjyrblKL_eeS8vB-kVSTcQ',
  authDomain: 'dehub-logistics-services1.firebaseapp.com',
  projectId: 'dehub-logistics-services1',
  storageBucket: 'dehub-logistics-services1.firebasestorage.app',
  messagingSenderId: '18308452070',
  appId: '1:18308452070:web:6f8f9d40203dfabd853527',
}

const app = initializeApp(firebaseConfig)

export const isFirebaseConfigured = true
export const auth = getAuth(app)
export const db = getFirestore(app)

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Could not enable persistent Firebase Auth session:', error)
})
