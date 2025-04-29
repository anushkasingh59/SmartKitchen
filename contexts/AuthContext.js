import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config - Replace with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyBo_Z08xOWfmLr6naTqE-ycVXNqcNA9bbw",
    authDomain: "smartkitchen-d6664.firebaseapp.com",
    projectId: "smartkitchen-d6664",
    storageBucket: "smartkitchen-d6664.firebasestorage.app",
    messagingSenderId: "996318878404",
    appId: "1:996318878404:web:2d660ff21b29b6f1528791",
    measurementId: "G-NLGSK8N5HT"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register with email/password
  async function register(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store username
      await AsyncStorage.setItem(`user_${userCredential.user.uid}_username`, username);
      return userCredential;
    } catch (error) {
      Alert.alert('Registration Error', error.message);
      throw error;
    }
  }

  // Login with email/password
  async function login(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
      throw error;
    }
  }

  // Sign in with Google
  async function loginWithGoogle(idToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      return await signInWithCredential(auth, credential);
    } catch (error) {
      Alert.alert('Google Login Error', error.message);
      throw error;
    }
  }

  // Logout
  async function logout() {
    return signOut(auth);
  }

  // Load user's saved recipes
  async function loadUserData(userId) {
    try {
      const username = await AsyncStorage.getItem(`user_${userId}_username`);
      const savedRecipes = JSON.parse(await AsyncStorage.getItem(`user_${userId}_savedRecipes`)) || [];
      return { username, savedRecipes };
    } catch (error) {
      console.error('Error loading user data:', error);
      return { username: '', savedRecipes: [] };
    }
  }

  // Enhanced saveRecipe function for AuthContext.js

// Save a recipe for the current user
async function saveRecipe(recipe) {
    if (!currentUser) return;
    
    try {
      const userId = currentUser.uid;
      const savedRecipes = JSON.parse(await AsyncStorage.getItem(`user_${userId}_savedRecipes`)) || [];
      
      // Check if recipe already exists (using idMeal for comparison)
      if (!savedRecipes.some(r => r.idMeal === recipe.idMeal)) {
        // For custom recipes, ensure they have all required fields
        if (recipe.isCustomRecipe) {
          const customRecipe = {
            idMeal: recipe.idMeal || "custom_" + new Date().getTime(),
            strMeal: recipe.strMeal || "Custom Recipe",
            strMealThumb: recipe.strMealThumb || "https://via.placeholder.com/300/fcf1ef/333333?text=Custom+Recipe",
            strInstructions: recipe.strInstructions || "",
            strIngredient1: recipe.strIngredient1 || "",
            strCategory: recipe.strCategory || "Custom",
            strArea: recipe.strArea || "Custom",
            isCustomRecipe: true,
            savedAt: new Date().toISOString()
          };
          savedRecipes.push(customRecipe);
        } else {
          // For regular recipes from external APIs
          savedRecipes.push({
            ...recipe,
            savedAt: new Date().toISOString()
          });
        }
        
        await AsyncStorage.setItem(`user_${userId}_savedRecipes`, JSON.stringify(savedRecipes));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  }

  // Remove a saved recipe
  async function removeRecipe(recipeId) {
    if (!currentUser) return;
    
    try {
      const userId = currentUser.uid;
      const savedRecipes = JSON.parse(await AsyncStorage.getItem(`user_${userId}_savedRecipes`)) || [];
      const newRecipes = savedRecipes.filter(r => r.idMeal !== recipeId);
      await AsyncStorage.setItem(`user_${userId}_savedRecipes`, JSON.stringify(newRecipes));
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    loginWithGoogle,
    logout,
    loadUserData,
    saveRecipe,
    removeRecipe
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}