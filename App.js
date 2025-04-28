import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import merchant screens
import WelcomeScreen from './app/screens/WelcomeScreen';

// Create navigation stack
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MerchantWelcome" component={WelcomeScreen} />
        {/* <Stack.Screen name="MerchantAuth" component={AuthScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;