import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native"; // ✅ Import added
import { SplashScreen } from "./screens/SplashScreen";
import { RecipeDetailScreen } from "./screens/RecipeDetailScreen";
import { DrawerNavigator } from "./screens/DrawerNavigator"; // ✅ Correct import
import { SmartRecipeScreen }  from "./screens/SmartRecipeScreen";
import { SavedRecipesScreen } from "./screens/SavedRecipesScreen";
export default function App() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer> 
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Home" component={DrawerNavigator} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="SmartRecipe" component={SmartRecipeScreen} />
        <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
