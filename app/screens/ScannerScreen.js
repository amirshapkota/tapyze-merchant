import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/ScannerScreenStyles';

const ScannerScreen = () => {
  // Get the navigation object
  const navigation = useNavigation();
  
  // State for scanner
  const [isConnected, setIsConnected] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [lastActive, setLastActive] = useState('2 minutes ago');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autoSleep, setAutoSleep] = useState(true);
  const [transactionSounds, setTransactionSounds] = useState(true);
  
  // Scanner details
  const scannerDetails = {
    name: 'Main Counter Scanner',
    scannerId: 'TPZ-7842-NFC',
    firmwareVersion: '3.2.5',
    location: 'Main Counter'
  };
  
  // Simulate checking connection status
  useEffect(() => {
    const connectionCheck = setInterval(() => {
      // Random connection status for test
      // this would check actual serial connection
      if (Math.random() > 0.8) {
        setIsConnected(prev => !prev);
      }
    }, 10000);
    
    return () => clearInterval(connectionCheck);
  }, []);
  
  // Check connection manually
  const checkConnection = () => {
    setIsScanning(true);
    
    // Simulate connection check
    setTimeout(() => {
      setIsConnected(true);
      setLastActive('just now');
      setIsScanning(false);
    }, 2000);
  };
  
  // Navigate back to dashboard
  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };
  
  // Navigate to create payment screen
  const navigateToCreatePayment = () => {
    navigation.navigate('CreatePayment');
  };
  
  // Open scanner settings
  const openSettings = () => {
    setShowSettingsModal(true);
  };

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
          style={styles.profileButton}
          onPress={navigateToDashboard}
        >
          <Ionicons name="home-outline" size={30} color="#ed7b0e" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>NFC Scanner</Text>
        <Text style={styles.screenSubtitle}>Manage your payment terminal</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Scanner Status Card */}
        <View style={styles.scannerCardContainer}>
          <View style={styles.scannerCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>TAPYZE</Text>
              </View>
              <Text style={styles.cardType}>NFC SCANNER</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{scannerDetails.name}</Text>
              <Text style={styles.cardId}>Scanner ID: {scannerDetails.scannerId}</Text>
              
              <View style={styles.connectionContainer}>
                <View style={[
                  styles.connectionIndicator, 
                  isConnected ? styles.connectionActive : styles.connectionInactive
                ]}>
                  <Ionicons 
                    name={isConnected ? "radio-outline" : "radio-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.connectionTextContainer}>
                  <Text style={styles.connectionStatus}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                  <Text style={styles.connectionSubtext}>
                    {isConnected ? 'Ready for payments' : 'Check connection'}
                  </Text>
                </View>
              </View>
            </View>
            
            {isScanning ? (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="small" color="#ed7b0e" />
                <Text style={styles.scanningText}>Checking connection...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.checkConnectionButton}
                onPress={checkConnection}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFF" />
                <Text style={styles.checkConnectionText}>Check Connection</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Scanner Details */}
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scanner Details</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.detailValueContainer}>
                <View style={[
                  styles.statusDot,
                  isConnected ? styles.statusConnected : styles.statusDisconnected
                ]} />
                <Text style={[
                  styles.detailValue,
                  isConnected ? styles.valueConnected : styles.valueDisconnected
                ]}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Battery Level</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{batteryLevel}%</Text>
                <Ionicons 
                  name="battery-half-outline" 
                  size={20} 
                  color={batteryLevel > 20 ? "#4CAF50" : "#FF3B30"} 
                  style={styles.detailIcon}
                />
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Active</Text>
              <Text style={styles.detailValue}>{lastActive}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Firmware</Text>
              <Text style={styles.detailValue}>{scannerDetails.firmwareVersion}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{scannerDetails.location}</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionItem, styles.primaryActionItem]}
            onPress={navigateToCreatePayment}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Accept Payment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Generate QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="stats-chart-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Transaction History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={openSettings}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle-outline" size={24} color="#ed7b0e" />
            <Text style={styles.helpTitle}>Need help with your scanner?</Text>
          </View>
          <Text style={styles.helpText}>
            If you're having trouble with your NFC scanner, check our troubleshooting
            guide or contact support.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>View Troubleshooting Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scanner Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Basic Settings</Text>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Scanner Name</Text>
                  <TouchableOpacity style={styles.settingEditButton}>
                    <Text style={styles.settingValue}>{scannerDetails.name}</Text>
                    <Ionicons name="create-outline" size={20} color="#ed7b0e" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Location</Text>
                  <TouchableOpacity style={styles.settingEditButton}>
                    <Text style={styles.settingValue}>{scannerDetails.location}</Text>
                    <Ionicons name="create-outline" size={20} color="#ed7b0e" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Auto Sleep Mode</Text>
                  <Switch
                    trackColor={{ false: "#ccc", true: "#ed7b0e" }}
                    thumbColor="#fff"
                    value={autoSleep}
                    onValueChange={setAutoSleep}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Transaction Sounds</Text>
                  <Switch
                    trackColor={{ false: "#ccc", true: "#ed7b0e" }}
                    thumbColor="#fff"
                    value={transactionSounds}
                    onValueChange={setTransactionSounds}
                  />
                </View>
              </View>
              
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Advanced Settings</Text>
                
                <TouchableOpacity style={styles.settingButton}>
                  <Ionicons name="sync-outline" size={20} color="#ed7b0e" />
                  <Text style={styles.settingButtonText}>Update Firmware</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingButton}>
                  <Ionicons name="bluetooth-outline" size={20} color="#ed7b0e" />
                  <Text style={styles.settingButtonText}>Connection Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingButton}>
                  <Ionicons name="cash-outline" size={20} color="#ed7b0e" />
                  <Text style={styles.settingButtonText}>Payment Thresholds</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dangerSection}>
                <TouchableOpacity style={styles.dangerButton}>
                  <Ionicons name="refresh-circle-outline" size={20} color="#FF3B30" />
                  <Text style={styles.dangerButtonText}>Factory Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.dangerButton}>
                  <Ionicons name="help-circle-outline" size={20} color="#FF3B30" />
                  <Text style={styles.dangerButtonText}>Report Problem</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ScannerScreen;