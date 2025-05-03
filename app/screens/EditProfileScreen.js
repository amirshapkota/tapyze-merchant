import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/EditProfileScreenStyles';

const EditProfileScreen = ({ navigation, route }) => {
  // Get user profile data from route or use default
  const initialUserProfile = route?.params?.userProfile || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+977 98765 43210',
    memberSince: 'March 2024',
    accountType: 'Premium'
  };

  // State for form fields
  const [name, setName] = useState(initialUserProfile.name);
  const [email, setEmail] = useState(initialUserProfile.email);
  const [phone, setPhone] = useState(initialUserProfile.phone);
  const [isLoading, setIsLoading] = useState(false);

  // Handle save changes
  const handleSaveChanges = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert("Error", "Phone number cannot be empty");
      return;
    }
    
    // Show loading
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Update profile in real app would happen here
      Alert.alert(
        "Success",
        "Profile updated successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  // Handle go back
  const handleGoBack = () => {
    if (name !== initialUserProfile.name || 
        email !== initialUserProfile.email || 
        phone !== initialUserProfile.phone) {
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
            <Text style={styles.screenTitle}>Edit Profile</Text>
            <Text style={styles.screenSubtitle}>Update your personal information</Text>
          </View>

          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Member Since</Text>
              <View style={styles.disabledInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{initialUserProfile.memberSince}</Text>
              </View>
              <Text style={styles.helperText}>This field cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.disabledInputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{initialUserProfile.accountType}</Text>
              </View>
              <Text style={styles.helperText}>Contact support to change your plan</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              isLoading ? styles.saveButtonDisabled : {}
            ]}
            onPress={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Updating...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;