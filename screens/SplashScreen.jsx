import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export const SplashScreen = ({navigation}) => {
    const { currentUser } = useAuth();
    
    useEffect(() => {
        setTimeout(() => {
            // Navigate to Login if no user, otherwise go to MainApp
            if (currentUser) {
                navigation.replace('MainApp');
            } else {
                navigation.replace('Login');
            }
        }, 4000);
    }, [currentUser, navigation]);
    
    return (
        <View style={styles.container}>
            <LottieView 
                source={require('../assets/Animation - 1741690500580.json')} 
                autoPlay 
                loop
                style={styles.splashCard}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashCard: {
        width: 300,
        height: 400,
    }
});