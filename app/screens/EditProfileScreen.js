import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/EditProfileScreenStyles';

const MerchantEditProfileScreen = ({ navigation, route }) => {
  // Get merchant profile data from route or use default
  const initialMerchantProfile = route?.params?.merchantProfile || {
    businessName: "Coffee Shop",
    ownerName: "John Smith",
    email: "john@coffeeshop.com",
    phone: "+977 9801234567",
    address: "Thamel, Kathmandu",
    businessType: "Cafe & Restaurant",
    memberSince: 'April 2023',
    merchantID: 'TPZ-78245'
  };

  // State for form fields
  const [businessName, setBusinessName] = useState(initialMerchantProfile.businessName);
  const [ownerName, setOwnerName] = useState(initialMerchantProfile.ownerName);
  const [email, setEmail] = useState(initialMerchantProfile.email);
  const [phone, setPhone] = useState(initialMerchantProfile.phone);
  const [address, setAddress] = useState(initialMerchantProfile.address);
  const [businessType, setBusinessType] = useState(initialMerchantProfile.businessType);
  const [isLoading, setIsLoading] = useState(false);

  // Handle save changes
  const handleSaveChanges = () => {
    // Validate inputs
    if (!businessName.trim()) {
      Alert.alert("Error", "Business name cannot be empty");
      return;
    }
    
    if (!ownerName.trim()) {
      Alert.alert("Error", "Owner name cannot be empty");
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
    
    if (!address.trim()) {
      Alert.alert("Error", "Business address cannot be empty");
      return;
    }
    
    if (!businessType.trim()) {
      Alert.alert("Error", "Business type cannot be empty");
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
        "Business profile updated successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  // Handle go back
  const handleGoBack = () => {
    if (businessName !== initialMerchantProfile.businessName || 
        ownerName !== initialMerchantProfile.ownerName ||
        email !== initialMerchantProfile.email || 
        phone !== initialMerchantProfile.phone ||
        address !== initialMerchantProfile.address ||
        businessType !== initialMerchantProfile.businessType) {
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
            <Text style={styles.screenTitle}>Edit Business Profile</Text>
            <Text style={styles.screenSubtitle}>Update your business information</Text>
          </View>

          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="business" size={40} color="#FFFFFF" />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Enter your business name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Owner Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholder="Enter owner name"
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
              <Text style={styles.inputLabel}>Business Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter business address"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Type</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={businessType}
                  onChangeText={setBusinessType}
                  placeholder="Enter business type"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Merchant ID</Text>
              <View style={styles.disabledInputContainer}>
                <Ionicons name="id-card-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{initialMerchantProfile.merchantID}</Text>
              </View>
              <Text style={styles.helperText}>This field cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Member Since</Text>
              <View style={styles.disabledInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{initialMerchantProfile.memberSince}</Text>
              </View>
              <Text style={styles.helperText}>This field cannot be changed</Text>
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

export default MerchantEditProfileScreen;