import React, { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    StyleSheet, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform,
    FlatList,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const IngredientsFinderScreen = () => {
    const [desiredDish, setDesiredDish] = useState("");
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [ingredientInput, setIngredientInput] = useState("");
    const [servings, setServings] = useState("2");
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [recipeSaved, setRecipeSaved] = useState(false);
    const { currentUser, saveRecipe } = useAuth();

    // Add an ingredient to the list
    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setAvailableIngredients([...availableIngredients, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    // Remove an ingredient from the list
    const removeIngredient = (index) => {
        setAvailableIngredients(availableIngredients.filter((_, i) => i !== index));
    };

    // Generate the recipe
    const generateRecipe = async () => {
        if (!desiredDish.trim()) {
            setErrorMessage("Please enter a dish you want to cook");
            return;
        }
        
        if (availableIngredients.length === 0) {
            setErrorMessage("Please add at least one available ingredient");
            return;
        }
        
        setErrorMessage("");
        setLoading(true);
        setRecipeSaved(false);
        
        try {
            const apiKey = "AIzaSyBaz8vOQknd48Q5AnwH-sbp-GXjja1n_v0"; // Replace with your actual API key
            const prompt = `
                I want to make ${desiredDish} for ${servings} people.
                I have these ingredients available: ${availableIngredients.join(", ")}.
                Please provide a complete recipe that uses my available ingredients as much as possible.
                If essential ingredients are missing, suggest substitutes from what I have.
                also give a approximate cost of the ingredients.
                keep it simple and to-the-point to follow.
                Format the response with:
                - Dont add a introdudtion or conclution or any other text, just the recipe
                - Use markdown format with headings and bullet points
                - A creative recipe name
                - List of ingredients with measurements
                - Clear step-by-step cooking instructions
                - Approximate cooking time
                - Any tips or variations
                Keep it simple and easy to follow!
            `;
            
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                }
            );
            
            if (response.data?.candidates?.length > 0) {
                let recipeText = response.data.candidates[0].content.parts[0].text;
                // Clean up formatting if needed
                recipeText = recipeText.replace(/\*\*/g, "").replace(/\*/g, "");
                recipeText = recipeText.replace(/\#\#/g, "").replace(/\#/g, "");
                setRecipe(recipeText);
            } else {
                setErrorMessage("Sorry, couldn't generate a recipe. Please try again.");
            }
        } catch (error) {
            console.error("Error generating recipe:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            setErrorMessage("An error occurred. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Save the generated recipe
    const handleSaveRecipe = async () => {
        if (!currentUser) {
            Alert.alert(
                "Login Required", 
                "Please login to save recipes",
                [{ text: "OK" }]
            );
            return;
        }
        
        if (!recipe) {
            return;
        }
        
        try {
            // Extract recipe name from the generated text (assuming it's the first line)
            const recipeName = recipe.split('\n')[0].replace(/^#+ /, '').trim();
            
            // Create a recipe object similar to what the API would return
            const recipeObject = {
                idMeal: "custom_" + new Date().getTime(), // Create a unique ID
                strMeal: recipeName || "Custom Generated Recipe",
                strMealThumb: "https://via.placeholder.com/300/fcf1ef/333333?text=Custom+Recipe", // Placeholder image
                strInstructions: recipe,
                // Add ingredient fields as needed by your app
                strIngredient1: availableIngredients.join(", "),
                strCategory: desiredDish,
                strArea: "Custom",
                isCustomRecipe: true,
                generatedFor: servings + " people"
            };
            
            await saveRecipe(recipeObject);
            setRecipeSaved(true);
            Alert.alert("Success", "Recipe saved successfully!");
        } catch (error) {
            console.error("Error saving recipe:", error);
            Alert.alert("Error", "Failed to save recipe. Please try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>🍽️ Ingredients Finder</Text>

                <Text style={styles.label}>What dish do you want to make?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Pasta, Chicken Curry, etc."
                    placeholderTextColor="#999"
                    value={desiredDish}
                    onChangeText={setDesiredDish}
                />

                <Text style={styles.label}>How many people are you cooking for?</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Number of servings"
                    placeholderTextColor="#999"
                    value={servings}
                    onChangeText={setServings}
                />

                <Text style={styles.label}>What ingredients do you have?</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.ingredientInput]}
                        placeholder="Add your ingredients one by one"
                        placeholderTextColor="#999"
                        value={ingredientInput}
                        onChangeText={setIngredientInput}
                        onSubmitEditing={addIngredient}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                        <Ionicons name="add-circle" size={28} color="#FF8A5C" />
                    </TouchableOpacity>
                </View>

                {availableIngredients.length > 0 && (
                    <View style={styles.ingredientsList}>
                        <Text style={styles.subLabel}>Your ingredients:</Text>
                        <FlatList
                            data={availableIngredients}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={styles.ingredientChip}
                                    onPress={() => removeIngredient(index)}
                                >
                                    <Text style={styles.ingredientChipText}>{item}</Text>
                                    <Ionicons name="close-circle" size={18} color="#FF8A5C" />
                                </TouchableOpacity>
                            )}
                            keyExtractor={(_, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateRecipe}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.generateButtonText}>Find My Recipe</Text>
                    )}
                </TouchableOpacity>

                {recipe && (
                    <View style={styles.recipeCard}>
                        <Text style={styles.recipeTitle}>Your Recipe</Text>
                        <Text style={styles.recipeContent}>{recipe}</Text>
                        
                        {/* Save Button */}
                        <TouchableOpacity 
                            style={[
                                styles.saveButton, 
                                recipeSaved ? styles.savedButton : {}
                            ]} 
                            onPress={handleSaveRecipe}
                            disabled={recipeSaved}
                        >
                            <Ionicons 
                                name={recipeSaved ? "bookmark" : "bookmark-outline"} 
                                size={20} 
                                color="#FFF"
                                style={styles.saveIcon} 
                            />
                            <Text style={styles.saveButtonText}>
                                {recipeSaved ? "Recipe Saved" : "Save Recipe"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fcf1ef",
    },
    scrollContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#444",
        marginBottom: 8,
        marginTop: 16,
    },
    subLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e8e8e8",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    ingredientInput: {
        flex: 1,
        marginRight: 10,
    },
    addButton: {
        padding: 5,
    },
    ingredientsList: {
        marginBottom: 20,
    },
    ingredientChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFE5D9",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    ingredientChipText: {
        marginRight: 5,
        fontSize: 14,
    },
    errorText: {
        color: "#E53935",
        marginBottom: 16,
        fontSize: 14,
    },
    generateButton: {
        backgroundColor: "#FF8A5C",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
        marginVertical: 10,
    },
    generateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    recipeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recipeTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
        textAlign: "center",
    },
    recipeContent: {
        fontSize: 14,
        lineHeight: 22,
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#436e6f",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
    },
    savedButton: {
        backgroundColor: "#6EA788",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    saveIcon: {
        marginRight: 8,
    }
});

export default IngredientsFinderScreen;