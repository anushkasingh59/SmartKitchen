import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

export const SavedRecipesScreen = ({ navigation }) => {
  const { currentUser, loadUserData, removeRecipe } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved recipes when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const loadSavedRecipes = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        const { savedRecipes } = await loadUserData(currentUser.uid);
        setSavedRecipes(savedRecipes || []);
      } else {
        setSavedRecipes([]);
      }
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (idMeal) => {
    try {
      await removeRecipe(idMeal);
      // Update the local state to reflect the change immediately
      setSavedRecipes(prev => prev.filter(recipe => recipe.idMeal !== idMeal));
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.messageText}>Please log in to save your favorite recipes.</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FF8A5C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Saved Recipes</Text>
      
      {savedRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved recipes yet.</Text>
          <Text style={styles.emptySubtext}>
            Explore recipes and save your favorites!
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <TouchableOpacity 
                onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
              >
                <Text style={styles.recipeTitle}>{item.strMeal}</Text>
                <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveRecipe(item.idMeal)}
              >
                <Text style={styles.removeButtonText}>Remove from Saved</Text>
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fcf1ef", 
    padding: 20 
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#fcf1ef",
  },
  heading: { 
    fontSize: 26, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20,
    color: "#333"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { 
    textAlign: "center", 
    fontSize: 18, 
    color: "#555", 
    marginBottom: 10,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: "center", 
    fontSize: 16, 
    color: "#777",
  },
  recipesList: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 10,
    color: "#333"
  },
  recipeImage: { 
    width: "100%", 
    height: 160, 
    borderRadius: 10,
    marginBottom: 10,
  },
  removeButton: { 
    backgroundColor: "#c0392b", 
    padding: 10, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  removeButtonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#FF8A5C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SavedRecipesScreen;