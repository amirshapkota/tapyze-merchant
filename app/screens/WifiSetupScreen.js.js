import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/WifiSetupScreenStyles';

export default function WifiSetupScreen() {

  const navigation = useNavigation();
  
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const submitCredentials = async () => {
    if (!ssid || !password) {
      Alert.alert('Error', 'Please enter both SSID and password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://192.168.4.1/wifi-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, password }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Credentials sent! ESP32 is connecting...');
      } else {
        Alert.alert('Error', 'Failed to send credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to ESP32 SoftAP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>TAPYZE</Text>
              <Text style={styles.merchantLabel}>MERCHANT</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Wi-Fi Setup</Text>
          <Text style={styles.screenSubtitle}>Enter your network credentials to connect ESP32</Text>
        </View>
        
        {/* Security Icon */}
        <View style={styles.securityIconContainer}>
          <View style={styles.securityIconCircle}>
            <Ionicons name="wifi" size={40} color="#FFFFFF" />
          </View>
        </View>
        
        {/* Form Section */}
        <View style={styles.formSection}>
          {/* SSID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wi-Fi Network (SSID)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="wifi-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter network name"
                value={ssid}
                onChangeText={setSsid}
                autoCapitalize="none"
              />
            </View>
          </View>
          
          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wi-Fi Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter network password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Enter your Wi-Fi password</Text>
          </View>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.updateButton, (!ssid || !password || loading) && styles.updateButtonDisabled]}
          onPress={submitCredentials}
          disabled={!ssid || !password || loading}
        >
          <Text style={styles.updateButtonText}>{loading ? 'Connecting...' : 'Connect Device'}</Text>
        </TouchableOpacity>
        
        {/* Help Link */}
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Need help connecting?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>
            1. Make sure your phone is connected to the "TapyzeSetup" WiFi network{'\n'}
            2. Enter your home/business WiFi credentials above{'\n'}
            3. Tap "Connect Device" to configure the scanner{'\n'}
            4. After sending, switch back to your regular WiFi network{'\n'}
            5. The app will automatically find the scanner on your network
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
