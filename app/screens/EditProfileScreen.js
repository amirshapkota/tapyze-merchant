import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMerchantAuth } from '../context/MerchantAuthContext';
import merchantAuthService from '../services/merchantAuthService';
import styles from '../styles/EditProfileScreenStyles';

const MerchantEditProfileScreen = ({ navigation }) => {
  const { user, updateUser, token } = useMerchantAuth();
  
  // State for form fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || '');
      setOwnerName(user.ownerName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBusinessAddress(user.businessAddress || '');
      setBusinessType(user.businessType || '');
    }
  }, [user]);

  // Check if there are changes
  useEffect(() => {
    if (user) {
      const changes = (
        businessName !== (user.businessName || '') ||
        ownerName !== (user.ownerName || '') ||
        phone !== (user.phone || '') ||
        businessAddress !== (user.businessAddress || '') ||
        businessType !== (user.businessType || '')
      );
      setHasChanges(changes);
    }
  }, [businessName, ownerName, phone, businessAddress, businessType, user]);

  // Validate form inputs
  const validateInputs = () => {
    if (!businessName.trim()) {
      Alert.alert("Error", "Business name cannot be empty");
      return false;
    }
    
    if (!ownerName.trim()) {
      Alert.alert("Error", "Owner name cannot be empty");
      return false;
    }
    
    if (!phone.trim()) {
      Alert.alert("Error", "Phone number cannot be empty");
      return false;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert("Error", "Please enter a valid phone number (10-15 digits)");
      return false;
    }

    if (!businessAddress.trim()) {
      Alert.alert("Error", "Business address cannot be empty");
      return false;
    }
    
    if (!businessType.trim()) {
      Alert.alert("Error", "Business type cannot be empty");
      return false;
    }
    
    return true;
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare update data (only editable fields)
      const updateData = {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        businessAddress: businessAddress.trim(),
        businessType: businessType.trim()
      };

      const response = await merchantAuthService.apiCall('/auth/merchant/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (response.status === 'success') {
        // Update user data in context
        const updatedUser = { ...user, ...updateData };
        await updateUser(updatedUser);
        
        Alert.alert(
          "Success",
          response.message || "Profile updated successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error", 
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle go back
  const handleGoBack = () => {
    if (hasChanges) {
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

  // Format member since date
  const formatMemberSince = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return 'Unknown';
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
              <Text style={styles.inputLabel}>Business Name *</Text>
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
              <Text style={styles.inputLabel}>Owner Name *</Text>
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
              <View style={styles.disabledInputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{email}</Text>
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
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
              <Text style={styles.inputLabel}>Business Address *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Enter business address"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Type *</Text>
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
              <Text style={styles.inputLabel}>Member Since</Text>
              <View style={styles.disabledInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{formatMemberSince()}</Text>
              </View>
              <Text style={styles.helperText}>This field cannot be changed</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              (isLoading || !hasChanges) ? styles.saveButtonDisabled : {}
            ]}
            onPress={handleSaveChanges}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Updating...</Text>
            ) : (
              <Text style={styles.saveButtonText}>
                {hasChanges ? 'Save Changes' : 'No Changes to Save'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Required fields note */}
          <Text style={styles.requiredNote}>* Required fields</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MerchantEditProfileScreen;