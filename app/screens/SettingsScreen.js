import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/SettingsScreenStyles';

import { useNavigation } from '@react-navigation/native';
import { useMerchantAuth } from '../context/MerchantAuthContext';

const MerchantSettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout, isLoading } = useMerchantAuth();
  
  // State for toggle settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoWithdrawalEnabled, setAutoWithdrawalEnabled] = useState(false);
  const [receiptEmailEnabled, setReceiptEmailEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use actual user data from context, with fallback for testing
  const merchantProfile = {
    businessName: user?.businessName,
    ownerName: user?.ownerName,
    email: user?.email,
    phone: user?.phone,
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2023',
    merchantID: user?._id ? `TPZ-${user._id.slice(-5).toUpperCase()}` : 'TPZ-78245'
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: performLogout, 
          style: "destructive" 
        }
      ]
    );
  };

  // Perform the actual logout
  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await logout();
      
      if (result.success) {
        // Show success message briefly
        Alert.alert(
          "Logged Out",
          "You have been successfully logged out.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigation will be handled automatically by AuthContext
                // The app will switch to AuthStackNavigator
              }
            }
          ]
        );
      } else {
        // Handle logout failure
        Alert.alert(
          "Logout Failed",
          result.message || "Failed to logout. Please try again.",
          [
            {
              text: "OK"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        "Error",
        "An error occurred while logging out. Please try again.",
        [
          {
            text: "OK"
          }
        ]
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Business Account",
      "Are you sure you want to permanently delete your business account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            Alert.alert("Verification Required", "For security reasons, we need to verify your identity. A verification code has been sent to your registered email address.");
          }, 
          style: "destructive" 
        }
      ]
    );
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
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Merchant Settings</Text>
          <Text style={styles.screenSubtitle}>Manage your business account preferences</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarContainer}>
              <Ionicons name="business" size={36} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{merchantProfile.businessName}</Text>
              <Text style={styles.profileType}>Merchant ID: {merchantProfile.merchantID}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => navigation.navigate('EditProfile', { merchantProfile })}
              disabled={isLoading || isLoggingOut}
            >
              <Ionicons name="pencil" size={20} color="#ed7b0e" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.profileDetailItem}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.profileDetailText}>{merchantProfile.ownerName}</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.profileDetailText}>{merchantProfile.email}</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.profileDetailText}>{merchantProfile.phone}</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.profileDetailText}>Member since {merchantProfile.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#d1d1d6", true: "#FFCAA3" }}
              thumbColor={notificationsEnabled ? "#ed7b0e" : "#f4f3f4"}
              onValueChange={() => setNotificationsEnabled(prev => !prev)}
              value={notificationsEnabled}
              disabled={isLoading || isLoggingOut}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="cash-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Currency</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>NPR (Rs.)</Text>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Payment Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="card-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Bank Account Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('ChangePassword')}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Two-Factor Authentication</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Merchant Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
              <Text style={styles.settingText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={styles.settingText}>About TAPYZE</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.versionText}>v1.0.0</Text>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout and Delete Account */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.logoutButton,
              (isLoading || isLoggingOut) && styles.disabledButton
            ]}
            onPress={handleLogout}
            disabled={isLoading || isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.logoutButtonText, { marginLeft: 8 }]}>Logging out...</Text>
              </>
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deleteAccountButton,
              (isLoading || isLoggingOut) && styles.disabledDeleteButton
            ]}
            onPress={handleDeleteAccount}
            disabled={isLoading || isLoggingOut}
          >
            <Text style={[
              styles.deleteAccountText,
              (isLoading || isLoggingOut) && styles.disabledDeleteText
            ]}>
              Delete Business Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MerchantSettingsScreen;