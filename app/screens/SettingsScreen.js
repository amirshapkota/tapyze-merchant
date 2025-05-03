import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/SettingsScreenStyles';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(false);
  const [autoWithdrawalEnabled, setAutoWithdrawalEnabled] = useState(false);
  const [receiptEmailEnabled, setReceiptEmailEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Modals
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile information
  const [profileInfo, setProfileInfo] = useState({
    businessName: "Coffee Shop",
    ownerName: "John Smith",
    email: "john@coffeeshop.com",
    phone: "+977 9801234567",
    address: "Thamel, Kathmandu",
    businessType: "Cafe & Restaurant"
  });
  
  // Bank account information
  const [bankInfo, setBankInfo] = useState({
    bankName: "Nepal Bank Ltd",
    accountNumber: "•••• •••• •••• 5874",
    accountHolder: "John Smith",
    branchName: "Thamel Branch"
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Navigate back to dashboard
  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };
  
  // Handle password change
  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false);
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password has been changed successfully');
    }, 1500);
  };
  
  // Handle saving profile
  const handleSaveProfile = () => {
    // Simulate API call
    setTimeout(() => {
      setShowEditProfileModal(false);
      Alert.alert('Success', 'Profile information updated successfully');
    }, 1000);
  };
  
  // Handle saving bank account
  const handleSaveBankAccount = () => {
    // Simulate API call
    setTimeout(() => {
      setShowBankAccountModal(false);
      Alert.alert('Success', 'Bank account information updated successfully');
    }, 1000);
  };
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            // In a real app, you would clear auth tokens here
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed7b0e" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={navigateToDashboard}
        >
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitials}>JS</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.businessName}>{profileInfo.businessName}</Text>
          <Text style={styles.ownerName}>{profileInfo.ownerName}</Text>
          <Text style={styles.merchantId}>Merchant ID: TPZ-78245</Text>
        </View>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => setShowEditProfileModal(true)}
        >
          <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.settingsContainer}>
        {/* Account Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowEditProfileModal(true)}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="person-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowBankAccountModal(true)}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="card-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Bank Account Information</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="finger-print-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Biometric Login</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#ed7b0e" }}
              thumbColor={biometricLoginEnabled ? "#FFFFFF" : "#F4F4F4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => setBiometricLoginEnabled(prev => !prev)}
              value={biometricLoginEnabled}
            />
          </View>
        </View>
        
        {/* Notification Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#ed7b0e" }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : "#F4F4F4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => setNotificationsEnabled(prev => !prev)}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="mail-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Email Receipts</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#ed7b0e" }}
              thumbColor={receiptEmailEnabled ? "#FFFFFF" : "#F4F4F4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => setReceiptEmailEnabled(prev => !prev)}
              value={receiptEmailEnabled}
            />
          </View>
        </View>
        
        {/* Payment Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Payment Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="cash-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="repeat-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Auto Withdrawal</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#ed7b0e" }}
              thumbColor={autoWithdrawalEnabled ? "#FFFFFF" : "#F4F4F4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => setAutoWithdrawalEnabled(prev => !prev)}
              value={autoWithdrawalEnabled}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="calculator-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Tax Settings</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
        </View>
        
        {/* App Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#ed7b0e" }}
              thumbColor={darkModeEnabled ? "#FFFFFF" : "#F4F4F4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => setDarkModeEnabled(prev => !prev)}
              value={darkModeEnabled}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="language-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>English</Text>
              <Ionicons name="chevron-forward" size={22} color="#999999" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="document-text-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>Terms & Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="information-circle-outline" size={22} color="#ed7b0e" />
            </View>
            <Text style={styles.settingLabel}>About</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>v1.0.0</Text>
              <Ionicons name="chevron-forward" size={22} color="#999999" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showChangePasswordModal}
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  secureTextEntry={true}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>
              
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
              
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditProfileModal}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter business name"
                  value={profileInfo.businessName}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, businessName: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Owner Name</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter owner name"
                  value={profileInfo.ownerName}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, ownerName: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  value={profileInfo.email}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, email: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={profileInfo.phone}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, phone: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter business address"
                  value={profileInfo.address}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, address: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Business Type</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter business type"
                  value={profileInfo.businessType}
                  onChangeText={(text) => setProfileInfo(prev => ({ ...prev, businessType: text }))}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Bank Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBankAccountModal}
        onRequestClose={() => setShowBankAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Account</Text>
              <TouchableOpacity onPress={() => setShowBankAccountModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.bankInfoText}>
                This bank account will be used for automatic withdrawals and payouts from your TAPYZE merchant account.
              </Text>
              
              <Text style={styles.inputLabel}>Bank Name</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter bank name"
                  value={bankInfo.bankName}
                  onChangeText={(text) => setBankInfo(prev => ({ ...prev, bankName: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Account Number</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account number"
                  keyboardType="number-pad"
                  value={bankInfo.accountNumber.replace(/•/g, '')}
                  onChangeText={(text) => setBankInfo(prev => ({ ...prev, accountNumber: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account holder name"
                  value={bankInfo.accountHolder}
                  onChangeText={(text) => setBankInfo(prev => ({ ...prev, accountHolder: text }))}
                />
              </View>
              
              <Text style={styles.inputLabel}>Branch Name</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter branch name"
                  value={bankInfo.branchName}
                  onChangeText={(text) => setBankInfo(prev => ({ ...prev, branchName: text }))}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSaveBankAccount}
              >
                <Text style={styles.submitButtonText}>Save Bank Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;