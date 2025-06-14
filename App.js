import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the MerchantAuthProvider and useMerchantAuth hook
import { MerchantAuthProvider, useMerchantAuth } from './app/context/MerchantAuthContext';

import WelcomeScreen from './app/screens/WelcomeScreen';
import AuthScreen from './app/screens/AuthScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import AnalyticsScreen from './app/screens/AnalyticsScreen';
import CreatePaymentScreen from './app/screens/CreatePaymentScreen';
import ScannerScreen from './app/screens/ScannerScreen';
import StatementsScreen from './app/screens/StatementsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import EditProfileScreen from './app/screens/EditProfileScreen';
import ChangePasswordScreen from './app/screens/ChangePasswordScreen';
import ForgotPasswordScreen from './app/screens/ForgotPasswordScreen';
import WifiSetupScreen from './app/screens/WifiSetupScreen.js';
import WithdrawScreen from './app/screens/WithdrawScreen.js';
import LoadingScreen from './app/screens/LoadingScreen'; // You'll need to create this

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SettingsStack = createStackNavigator();
const HomeStack = createStackNavigator();
const PaymentStack = createStackNavigator();
const ScannerStack = createStackNavigator();
const StatementsStack = createStackNavigator();

// Settings stack navigator
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
};

// Home stack navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="DashboardMain" 
        component={DashboardScreen} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="Analytics"
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{ headerShown: false }}
      />
      {/* Add merchant-specific dashboard screens here if needed */}
    </HomeStack.Navigator>
  );
};

// Payment stack navigator
const PaymentStackNavigator = () => {
  return (
    <PaymentStack.Navigator>
      <PaymentStack.Screen 
        name="CreatePayment" 
        component={CreatePaymentScreen} 
        options={{ headerShown: false }}
      />
    </PaymentStack.Navigator>
  );
};

// Scanner stack navigator
const ScannerStackNavigator = () => {
  return (
    <ScannerStack.Navigator>
      <ScannerStack.Screen 
        name="ScannerMain" 
        component={ScannerScreen} 
        options={{ headerShown: false }}
      />
      <ScannerStack.Screen
        name="WifiSetup"
        component={WifiSetupScreen}
        options={{ headerShown: false }}
      />
    </ScannerStack.Navigator>
  );
};

// Statements stack navigator
const StatementsStackNavigator = () => {
  return (
    <StatementsStack.Navigator>
      <StatementsStack.Screen 
        name="StatementsMain" 
        component={StatementsScreen} 
        options={{ headerShown: false }}
      />
      {/* Add statement-related screens here if needed */}
    </StatementsStack.Navigator>
  );
};

// Bottom tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Statements') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ed7b0e',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarStyle: {
          paddingTop: 5,
          backgroundColor: 'white',
          paddingVertical: 12,
          paddingHorizontal: 15,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 5,
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Payments" component={PaymentStackNavigator} />
      <Tab.Screen name="Scanner" component={ScannerStackNavigator} />
      <Tab.Screen name="Statements" component={StatementsStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const MainAppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// App Content Component (uses MerchantAuthContext)
const AppContent = () => {
  const { isAuthenticated, isLoading } = useMerchantAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

// Main App Component
function App() {
  return (
    <MerchantAuthProvider>
      <AppContent />
    </MerchantAuthProvider>
  );
}

export default App;