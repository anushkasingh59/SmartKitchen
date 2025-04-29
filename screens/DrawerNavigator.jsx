import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomeScreen } from "./HomeScreen";
import { SmartRecipeScreen } from "./SmartRecipeScreen";
import { SavedRecipesScreen } from "./SavedRecipesScreen";
import { IngredientsFinderScreen } from "./IngredientsFinderScreen";
import { ProfileScreen } from "./ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const Drawer = createDrawerNavigator();

export function DrawerNavigator({ navigation }) {
  const { currentUser } = useAuth();
  
  // If user is not logged in, redirect to Login screen
  React.useEffect(() => {
    if (!currentUser) {
      navigation.replace('Login');
    }
  }, [currentUser, navigation]);
  
  // Don't render drawer until we have a user
  if (!currentUser) {
    return null;
  }
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fcf1ef',
        },
        headerTintColor: '#333',
        drawerActiveTintColor: '#FF8A5C',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Smart Recipe" 
        component={SmartRecipeScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="fast-food-outline" size={22} color={color} />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Ingredients Finder" 
        component={IngredientsFinderScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="search-outline" size={22} color={color} />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Saved Recipes" 
        component={SavedRecipesScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="bookmark-outline" size={22} color={color} />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}