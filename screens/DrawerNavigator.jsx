import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomeScreen } from "./HomeScreen";
import { SmartRecipeScreen } from "./SmartRecipeScreen";
import { SavedRecipesScreen } from "./SavedRecipesScreen"
const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={HomeScreen} />
            
            <Drawer.Screen name="Smart Recipe" component={SmartRecipeScreen} />
            <Drawer.Screen name="Saved Recipes" component={SavedRecipesScreen} />

        </Drawer.Navigator>
    );
}
