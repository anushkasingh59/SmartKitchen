import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const RecipeDetailScreen = ({ route }) => {
  const recipe = route?.params?.recipe;
  const [healthyRecipe, setHealthyRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { currentUser, saveRecipe, removeRecipe, loadUserData } = useAuth();

  useEffect(() => {
    setHealthyRecipe(null);
  }, [recipe]);

  // Check if recipe is saved when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkIfSaved();
    }, [recipe])
  );
  
  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No recipe found. Please try again.</Text>
      </View>
    );
  }

  // Check if the recipe is already saved
  const checkIfSaved = async () => {
    if (!currentUser) return;
    
    try {
      const { savedRecipes } = await loadUserData(currentUser.uid);
      const alreadySaved = savedRecipes.some((r) => r.idMeal === recipe.idMeal);
      setIsSaved(alreadySaved);
    } catch (error) {
      console.error("Error checking saved recipe:", error);
    }
  };

  // Handle saving/removing a recipe
  const handleSaveRecipe = async () => {
    if (!currentUser) {
      Alert.alert(
        "Login Required", 
        "Please login to save recipes",
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      if (isSaved) {
        await removeRecipe(recipe.idMeal);
        setIsSaved(false);
      } else {
        await saveRecipe(recipe);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving/removing recipe:", error);
    }
  };

  const fetchHealthyRecipe = async () => {
    setLoading(true);
    try {
      const apiKey = "AIzaSyBaz8vOQknd48Q5AnwH-sbp-GXjja1n_v0"; // Replace with a valid key
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Convert this recipe into a healthy version and it should be tasty as well. The recipe should include: A creative and appealing recipe name, Total cooking time, Serving size, A beautifully formatted layout with bold headlines (Ingredients, Instructions, etc.), Clear bullet points for steps and ingredients, mark bold points with different font:\n\nName: ${recipe.strMeal}\nIngredients: ${Object.keys(recipe)
                    .filter((key) => key.startsWith("strIngredient") && recipe[key])
                    .map((key) => recipe[key])
                    .join(", ")}\nInstructions: ${recipe.strInstructions}`,
                },
              ],
            },
          ],
        }
      );

      if (response.data?.candidates?.length > 0) {
        let cleanText = response.data.candidates[0].content.parts[0].text;
        cleanText = cleanText.replace(/\*\*/g, "").replace(/\*/g, "");
        cleanText = cleanText.replace(/\#\#/g, "").replace(/\#/g, "");
        setHealthyRecipe(cleanText);
      } else {
        setHealthyRecipe("No healthy version found.");
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch healthy recipe. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{recipe.strMeal}</Text>
        <Image source={{ uri: recipe.strMealThumb }} style={styles.image} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {Object.keys(recipe)
            .filter((key) => key.startsWith("strIngredient") && recipe[key])
            .map((key, index) => (
              <Text key={index} style={styles.ingredient}>{recipe[key]}</Text>
            ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{recipe.strInstructions}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : {}]}
          onPress={fetchHealthyRecipe}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Get Healthy Version</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, isSaved ? styles.savedButton : {}]} onPress={handleSaveRecipe}>
          <Text style={styles.buttonText}>{isSaved ? "Remove from Saved" : "Save Recipe"}</Text>
        </TouchableOpacity>
        
        {healthyRecipe && (
          <View style={styles.healthyContainer}>
            <Text style={styles.sectionTitle}>Healthy Version:</Text>
            <Text style={styles.healthyText}>{healthyRecipe}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fcf1ef",
    paddingTop: 35,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
    textAlign: "center",
  },
  image: {
    width: "90%",
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007074",
  },
  instructions: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 22,
    textAlign: "justify",
  },
  ingredient: {
    fontSize: 16,
    color: "#34495e",
    backgroundColor: "#ecf0f1",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  healthyContainer: {
    backgroundColor: "#FFF7F3",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    borderWidth: 2.5,
    borderColor: "#D5E5D5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  healthyText: {
    fontSize: 17,
    color: "#2c3e50",
    lineHeight: 24,
    textAlign: "left",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#436e6f",
    paddingVertical: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  savedButton: {
    backgroundColor: "#c0392b"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    marginBottom: 15,
  },
});