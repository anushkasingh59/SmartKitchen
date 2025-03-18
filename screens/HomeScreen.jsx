import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, FlatList, TouchableOpacity, Dimensions } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 

const screenWidth = Dimensions.get("window").width;

export const HomeScreen = ({ navigation }) => {
    const nav = useNavigation();  
    const [news, setNews] = useState([]);
    const [mealType, setMealType] = useState("");
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        fetchNews();
        determineMealType();
    }, []);

    useEffect(() => {
        if (mealType) {
            fetchRecipeSuggestion();
        }
    }, [mealType]);

    // 📰 Fetch food-related news
    const fetchNews = async () => {
        try {
            const response = await axios.get("https://newsapi.org/v2/everything?q=food&apiKey=d47741ac3ce84dafbbd6c802d8e0fedf");
            setNews(response.data.articles.slice(0, 5)); // Taking first 5 news articles
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    // ⏳ Determine the current meal time
    const determineMealType = () => {
        const currentTime = new Date().getHours();
        let meal = "dinner"; // Default to dinner

        if (currentTime >= 5 && currentTime < 11) meal = "breakfast";
        else if (currentTime >= 11 && currentTime < 15) meal = "lunch";
        else if (currentTime >= 15 && currentTime < 18) meal = "snack";
        // Evening onwards, it's dinner time

        setMealType(meal);
    };

    // 🍽️ Fetch multiple meal suggestions from TheMealDB API
    const fetchRecipeSuggestion = async () => {
        try {
            const fetchedRecipes = [];
            for (let i = 0; i < 4; i++) {
                const response = await axios.get("https://www.themealdb.com/api/json/v1/1/random.php");
                if (response.data.meals) {
                    fetchedRecipes.push(response.data.meals[0]);
                }
            }
            setRecipes(fetchedRecipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setRecipes([]);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* 🔄 Logo Instead  */}
            <View style={styles.logoContainer}>
                <Image source={require("../assets/SmartKitchenlogo.png")} style={styles.logo} />
                <Text style={styles.heading}>Smart Kitchen</Text>
            </View>

            {/* 📰 Scrollable News Section */}
            <View style={styles.newsContainer}>
                <Text style={styles.subheading}>📰 Food News Today</Text>
                <FlatList
                    horizontal
                    data={news}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.newsCard}>
                            <Text style={styles.newsItem}>{item.title}</Text>
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* 🍽️ Recipe Suggestions */}
            <View style={styles.newsContainer}>
                <Text style={styles.subheading}>🔥 Today's {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Suggestions</Text>
                <FlatList
                    horizontal
                    data={recipes}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}>
                            <View style={styles.recipeCard}>
                                <Text style={styles.recipeTitle}>{item.strMeal}</Text>
                                <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
                                <Text style={styles.recipe}>{item.strInstructions.substring(0, 100)}...</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fcf1ef",
    },
    logoContainer: {
        flexDirection: "row", // Arrange logo and text in a row
        alignItems: "center", // Align them vertically in the center
        marginTop: 10,
        marginBottom: 20,
        justifyContent: "center", // Keep everything centered horizontally
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
        marginRight: 4, // Add some space between the logo and text
    },
    
    //menuButton: {
        //position: "absolute",
        //top: 20,
        //left: 20,
        //zIndex: 10,
        //backgroundColor: "rgba(255, 255, 255, 0.7)",
        //padding: 8,
        //borderRadius: 5,
    //},
    heading: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
        color: "#4e4e4e",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    newsContainer: {
        marginBottom: 10,
    },
    newsCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        padding: 15,
        width: screenWidth * 0.7,
        marginRight: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    subheading: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#4e4e4e",
    },
    newsItem: {
        fontSize: 14,
        color: "#333333",
    },
    recipeCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        padding: 15,
        width: screenWidth * 0.9,
        marginRight: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#2d2d2d",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    recipeImage: {
        width: "100%",
        height: 200,
        borderRadius: 15,
        marginBottom: 10,
    },
    recipe: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#2d2d2d",
    },
});