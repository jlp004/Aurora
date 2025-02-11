import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyBD4OHC0ZbLyT_xf0zLcjMk3IrMGBJQwio",

  authDomain: "instagramdupe-d7c6f.firebaseapp.com",

  projectId: "instagramdupe-d7c6f",

  storageBucket: "instagramdupe-d7c6f.firebasestorage.app",

  messagingSenderId: "5788606398",

  appId: "1:5788606398:web:e68cd25516535f0060a3ef",

  measurementId: "G-5DG16T81KP"

};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider, signInWithPopup}