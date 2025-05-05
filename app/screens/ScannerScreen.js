import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  ActivityIndicator
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
  const [lastActive, setLastActive] = useState('2 minutes ago');
  
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
      // Random connection status for demonstration
      // In real app, this would check actual serial connection
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
    navigation.navigate('Payments');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section - Same as Dashboard */}
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
          <Ionicons name="person-circle-outline" size={40} color="#ed7b0e" />
        </TouchableOpacity>
      </View>

      {/* Greeting Section - Same as Dashboard */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hello, Coffee Shop</Text>
        <Text style={styles.greetingSubtext}>Manage your NFC scanner</Text>
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
                    name="radio-outline" 
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
        
        {/* Accept Payment - Single Action */}
        <View style={styles.paymentActionContainer}>
          <TouchableOpacity 
            style={styles.paymentActionButton}
            onPress={navigateToCreatePayment}
          >
            <View style={styles.paymentActionIcon}>
              <Ionicons name="cash-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentActionTitle}>Accept Payment</Text>
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
    </SafeAreaView>
  );
};

export default ScannerScreen;