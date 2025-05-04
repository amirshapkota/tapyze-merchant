import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/ChangePasswordScreenStyles';

const ChangePasswordScreen = ({ navigation }) => {
  // State for password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: '#E0E0E0' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: '#FF3B30' };
    if (score <= 4) return { score, label: 'Medium', color: '#FFCC00' };
    return { score, label: 'Strong', color: '#34C759' };
  };
  
  const passwordStrength = checkPasswordStrength(newPassword);

  // Handle password change
  const handleChangePassword = () => {
    // Validation
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    
    if (passwordStrength.score < 3) {
      Alert.alert("Weak Password", "Please create a stronger password with a mix of uppercase, lowercase, numbers, and special characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords don't match");
      return;
    }
    
    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }
    
    // Show loading
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Handle success (in real app, would update password via API)
      Alert.alert(
        "Success",
        "Your password has been updated successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  // Handle go back
  const handleGoBack = () => {
    if (currentPassword || newPassword || confirmPassword) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
            <Text style={styles.screenTitle}>Change Password</Text>
            <Text style={styles.screenSubtitle}>Create a strong password to secure your account</Text>
          </View>

          {/* Security Icon */}
          <View style={styles.securityIconContainer}>
            <View style={styles.securityIconCircle}>
              <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password strength indicator */}
              {newPassword ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    <View 
                      style={[
                        styles.strengthBar, 
                        { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              ) : null}
              
              <Text style={styles.helperText}>
                Use at least 8 characters with a mix of uppercase, lowercase, numbers, and special characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <Text style={styles.errorText}>Passwords don't match</Text>
              )}
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity 
            style={[
              styles.updateButton,
              isLoading ? styles.updateButtonDisabled : {}
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.updateButtonText}>Updating...</Text>
            ) : (
              <Text style={styles.updateButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')} >
            <Text style={styles.forgotPasswordText}>
              Forgot your current password?
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;