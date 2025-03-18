import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export const SmartRecipeScreen = () => {
    const [ingredients, setIngredients] = useState([]);
    const [input, setInput] = useState("");
    const [servings, setServings] = useState("1");
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);

    const addIngredient = () => {
        if (input.trim()) {
            setIngredients([...ingredients, input.trim()]);
            setInput("");
        }
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const fetchRecipe = async () => {
        if (ingredients.length === 0) return;
        setLoading(true);
        
        const prompt = `Generate a well-formatted recipe for ${servings} person(s) using the following ingredients: ${ingredients.join(", ")}. and it should be tasty as well. The recipe should include: A creative and appealing recipe name, Total cooking time, Serving size, A beautifully formatted layout with bold headlines (Ingredients, Instructions, etc.), Clear bullet points for steps and ingredients, mark bold points with different font ,do not mention anything in the starting just start with recipe name and a description of that in 1 or 2 line ,only use the ingredients provided`;
        try {
            const apiKey = "..."; 
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                { contents: [
                    {
                      role: "user",
                      parts: [{ text: prompt }]
                    }
                  ]
                }
            );
            
            if (response.data?.candidates?.length > 0) {
                let cleanText = response.data.candidates[0].content.parts[0].text;
                cleanText = cleanText.replace(/\*\*/g, "").replace(/\*/g, "");
                cleanText = cleanText.replace(/\#\#/g, "").replace(/\*/g, "");
    
                setRecipe(cleanText);
            }
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
        setLoading(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🍳 Smart Recipe Generator</Text>
            
            <Text style={styles.label}>👥 Number of People:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={servings}
                placeholderTextColor="#ccc"
                onChangeText={setServings}
            />
            
            <Text style={styles.label}>🛒 Add Ingredients:</Text>
            <View style={styles.ingredientInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter an ingredient"
                    placeholderTextColor="#ccc"
                    value={input}
                    onChangeText={setInput}
                />
                <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                    <Ionicons name="add-circle" size={28} color="#5DB075" />
                </TouchableOpacity>
            </View>

            <FlatList
                horizontal
                data={ingredients}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.ingredientTag} onPress={() => removeIngredient(index)}>
                        <Text style={styles.ingredientText}>{item} ❌</Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.fetchButton} onPress={fetchRecipe}>
                <Text style={styles.fetchButtonText}>🔍 Get Recipe</Text>
            </TouchableOpacity>
            
            {loading && <ActivityIndicator size="large" color="#e094a0" style={styles.loader} />}
            
            {recipe && (
                <View style={styles.recipeContainer}>
                    <Text style={styles.recipeTitle}>📜 Generated Recipe:</Text>
                    <Text style={styles.recipeText}>{recipe}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        backgroundColor: "#fcf1ef", 
        flex: 1 
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        textAlign: "center", 
        marginBottom: 15 
    },
    label: { 
        fontSize: 18, 
        fontWeight: "bold", 
        marginBottom: 5 
    },
    input: { 
        backgroundColor: "#fff", 
        padding: 10, 
        borderRadius: 8, 
        marginBottom: 10, 
        fontSize: 16 
    },
    ingredientInputContainer: { 
        flexDirection: "row", 
        alignItems: "center" 
    },
    addButton: { 
        marginLeft: 10 
    },
    ingredientTag: { 
        backgroundColor: "#f2dde1", 
        padding: 8, 
        borderRadius: 15, 
        marginHorizontal: 5 
    },
    ingredientText: { 
        fontSize: 16
    },
    fetchButton: { 
        backgroundColor: "#e094a0", 
        padding: 12, 
        borderRadius: 10, 
        alignItems: "center", 
        marginTop: 15 
    },
    fetchButtonText: { 
        color: "#fff", 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    recipeContainer: { 
        backgroundColor: "#f2dde1", 
        padding: 15, 
        marginTop: 20, 
        borderRadius: 10 ,
        marginBottom: 20
    },
    recipeTitle: { 
        fontSize: 20, 
        fontWeight: "bold", 
        marginBottom: 5 
    },
    recipeText: { 
        fontSize: 16 
    },
    loader: { 
        marginTop: 20 
    }
});
