import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar, View, StyleSheet, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
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
import SendReceiveScreen from './app/screens/SendReceiveScreen'; // Add this import

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

const TabNavigator = () => {
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1 }}>
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
            paddingVertical: Platform.OS === 'android' ? 8 : 12,
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
            height: Platform.OS === 'android' ? 70 : 'auto',
            paddingBottom: Platform.OS === 'android' ? 10 : 20,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
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
      
      {/* Floating Action Button positioned at bottom right */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate('SendReceive');
        }}
      >
        <Ionicons name="swap-horizontal" size={24} color="white" />
      </TouchableOpacity>
    </View>
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
      <Stack.Screen
        name="SendReceive"
        component={SendReceiveScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
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

// Main App Component with SafeAreaProvider
function App() {
  return (
    <SafeAreaProvider>
      <MerchantAuthProvider>
        <AppContent />
      </MerchantAuthProvider>
    </SafeAreaProvider>
  );
}

// Styles for the floating button
const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 90 : 100,
    right: 20,
    width: 82,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ed7b0e',
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow for Android
    elevation: 8,
    // Enhanced shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 0,
    zIndex: 1000,
  },
});

export default App;