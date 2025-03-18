import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export const SavedRecipesScreen = ({ navigation }) => {
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Load saved recipes when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const loadSavedRecipes = async () => {
    try {
      const recipes = JSON.parse(await AsyncStorage.getItem("savedRecipes")) || [];
      setSavedRecipes(recipes);
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    }
  };

  const removeRecipe = async (idMeal) => {
    try {
      const newRecipes = savedRecipes.filter((recipe) => recipe.idMeal !== idMeal);
      await AsyncStorage.setItem("savedRecipes", JSON.stringify(newRecipes));
      setSavedRecipes(newRecipes);
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  const isRecipeSaved = (idMeal) => {
    return savedRecipes.some((recipe) => recipe.idMeal === idMeal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Recipes</Text>
      {savedRecipes.length === 0 ? (
        <Text style={styles.emptyText}>No saved recipes yet.</Text>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <TouchableOpacity onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}>
                <Text style={styles.recipeTitle}>{item.strMeal}</Text>
                <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
              </TouchableOpacity>

              {isRecipeSaved(item.idMeal) && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeRecipe(item.idMeal)}
                >
                  <Text style={styles.removeButtonText}>Remove from Saved</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  heading: { 
    fontSize: 26, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 10 
  },
  emptyText: { 
    textAlign: "center", 
    fontSize: 18, 
    color: "#555", 
    marginTop: 20 
  },
  recipeCard: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  recipeTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 5 
  },
  recipeImage: { 
    width: "100%", 
    height: 140, 
    borderRadius: 10 
  },
  removeButton: { 
    backgroundColor: "#c0392b", 
    padding: 8, 
    borderRadius: 5, 
    marginTop: 5, 
    alignItems: "center" 
  },
  removeButtonText: { 
    color: "#fff", 
    fontWeight: "bold" },
});

export default SavedRecipesScreen;
