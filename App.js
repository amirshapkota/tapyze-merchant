import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import WelcomeScreen from './app/screens/WelcomeScreen';
import AuthScreen from './app/screens/AuthScreen';
import MerchantDashboardScreen from './app/screens/DashboardScreen';
import AnalyticsScreen from './app/screens/AnalyticsScreen';


// Create navigation stack
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={AnalyticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;