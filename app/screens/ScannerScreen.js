import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Animated,
  Image,
  Vibration,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import merchantAuthService from '../services/merchantAuthService';
import merchantDeviceService from '../services/merchantDeviceService';

// Import styles
import styles from '../styles/ScannerScreenStyles';

const ScannerScreen = () => {
  // Get the navigation object
  const navigation = useNavigation();
  
  // Scanner assignment states
  const [hasAssignedScanner, setHasAssignedScanner] = useState(null); // null = loading, true/false = checked
  const [assignedScanner, setAssignedScanner] = useState(null);
  const [isCheckingAssignment, setIsCheckingAssignment] = useState(true);
  
  // Scanner assignment form states
  const [deviceId, setDeviceId] = useState('');
  const [model, setModel] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [deviceIdFocused, setDeviceIdFocused] = useState(false);
  const [firmwareFocused, setFirmwareFocused] = useState(false);
  const [modelFocused, setModelFocused] = useState(false);
  
  const modelOptions = [
    { label: 'Tapyze Pro', value: 'tapyze-pro' },
    { label: 'Tapyze Lite', value: 'tapyze-lite' },
    { label: 'Tapyze Mini', value: 'tapyze-mini' },
  ];
  
  // RFID scanner states
  const [rfidReaderIP, setRfidReaderIP] = useState('192.168.4.1'); // Default setup IP
  const [scannerConnected, setScannerConnected] = useState(false);
  const [searching, setSearching] = useState(false);
  const [lastScannedCard, setLastScannedCard] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [lastActive, setLastActive] = useState('Never');
  const [loading, setLoading] = useState(false);
  
  // Scanner details
  const defaultScannerDetails = {
    name: 'RFID Card Reader',
    scannerId: 'TPZ-5423-RFID',
    firmwareVersion: '2.1.4',
    location: 'Main Counter'
  };
  
  // Animation for card detection
  const [cardAnimation] = useState(new Animated.Value(0));

  // Check if merchant has assigned scanner on component mount
  useEffect(() => {
    checkScannerAssignment();
  }, []);

  // Initialize and check network status only after scanner assignment is confirmed
  useEffect(() => {
    if (hasAssignedScanner === true) {
      checkNetworkStatus();
      
      // Set up network state change listener
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.type === 'wifi') {
          checkNetworkStatus();
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [hasAssignedScanner]);

  // Function to check if merchant has assigned scanner
  const checkScannerAssignment = async () => {
    try {
      setIsCheckingAssignment(true);
      
      // Check if user is authenticated using your auth service
      const isAuth = await merchantAuthService.isAuthenticated();
      if (!isAuth) {
        console.log('User not authenticated');
        Alert.alert('Error', 'Please log in again');
        navigation.navigate('Login');
        return;
      }

      console.log('User authenticated, checking scanners...');

      // Use device service to get scanners
      const result = await merchantDeviceService.getMerchantScanners();
      
      if (result.success) {
        console.log('Scanner check result:', result);
        
        if (result.count > 0 && result.scanners.length > 0) {
          // Merchant has assigned scanners
          setHasAssignedScanner(true);
          setAssignedScanner(result.scanners[0]); // Use the first scanner
          
          // Update scanner details with assigned scanner info
          const scanner = result.scanners[0];
          setModel(scanner.model || '');
          setFirmwareVersion(scanner.firmwareVersion || '');
          setDeviceId(scanner.deviceId || '');
          
          console.log('Scanner found:', scanner);
        } else {
          // No assigned scanners
          console.log('No scanners found for merchant');
          setHasAssignedScanner(false);
        }
      } else {
        // Handle API error
        if (result.message && (result.message.includes('401') || result.message.includes('Unauthorized'))) {
          console.log('401 Unauthorized - Token may be invalid');
          Alert.alert('Session Expired', 'Please log in again');
          navigation.navigate('Login');
        } else {
          throw new Error(result.message || 'Failed to check scanner assignment');
        }
      }
    } catch (error) {
      console.error('Error checking scanner assignment:', error);
      Alert.alert(
        'Error',
        `Failed to check scanner assignment: ${error.message}. Please try again.`,
        [
          {
            text: 'Retry',
            onPress: checkScannerAssignment
          },
          {
            text: 'Skip for now',
            onPress: () => setHasAssignedScanner(false)
          }
        ]
      );
    } finally {
      setIsCheckingAssignment(false);
    }
  };

  // Function to assign scanner to merchant
  const assignScannerToMerchant = async () => {
    if (!deviceId.trim() || !model.trim()) {
      Alert.alert('Error', 'Please fill in Device ID and Model fields');
      return;
    }

    try {
      setIsAssigning(true);
      
      // Check if user is authenticated
      const isAuth = await merchantAuthService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Error', 'Please log in again');
        navigation.navigate('Login');
        return;
      }

      const scannerData = {
        deviceId: deviceId.trim(),
        model: model.trim(),
        firmwareVersion: firmwareVersion.trim() || '1.0.0'
      };

      console.log('Assigning scanner with data:', scannerData);

      // Use device service to assign scanner
      const result = await merchantDeviceService.assignScanner(scannerData);

      console.log('Assignment response:', result);

      if (result.success) {
        Alert.alert(
          'Success',
          'Scanner assigned successfully!',
          [{
            text: 'OK',
            onPress: () => {
              setAssignedScanner(result.scanner);
              setHasAssignedScanner(true);
            }
          }]
        );
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to assign scanner. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error assigning scanner:', error);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        Alert.alert('Session Expired', 'Please log in again');
        navigation.navigate('Login');
      } else {
        Alert.alert(
          'Error',
          error.message || 'Network error. Please check your connection and try again.'
        );
      }
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Function to check network status
  const checkNetworkStatus = async () => {
    try {
      const netState = await NetInfo.fetch();
      setNetworkInfo(netState);
      
      if (netState.isConnected && netState.type === 'wifi') {
        // Check if we already know the scanner's IP
        if (rfidReaderIP) {
          checkScannerStatus(rfidReaderIP);
        } else {
          // Otherwise try to find it
          findScannerOnNetwork();
        }
      } else {
        Alert.alert(
          'Network Connection Required',
          'Please connect to a WiFi network to use this app.'
        );
      }
    } catch (error) {
      console.error('Network status check error:', error);
    }
  };
  
  // Find RFID Scanner on the network using common IP addresses
  const findScannerOnNetwork = async () => {
    setSearching(true);
    setScannerConnected(false);
    
    try {
      // Try mDNS hostname first
      try {
        console.log('Trying mDNS hostname (rfidreader.local)...');
        const mDNSResponse = await fetch('http://rfidreader.local/status', { 
          timeout: 3000 
        });
        
        if (mDNSResponse.ok) {
          const data = await mDNSResponse.json();
          console.log('Found ESP32 via mDNS:', data);
          setRfidReaderIP(data.ip);
          setScannerConnected(true);
          setSearching(false);
          setLastActive('just now');
          
          // Start polling for RFID tags
          startRFIDPolling(data.ip);
          return;
        }
      } catch (error) {
        console.log('mDNS lookup failed, trying IP scan');
      }
      
      // If mDNS fails, try the common IP addresses directly
      const commonIPs = [
        '192.168.1.1', '192.168.1.100', '192.168.1.101', '192.168.1.150', '192.168.1.200',
        '192.168.0.1', '192.168.0.100', '192.168.0.101', '192.168.0.150', '192.168.0.200',
        '192.168.2.1', '192.168.2.100', '192.168.2.101', '192.168.2.150', '192.168.2.200',
        '10.0.0.1', '10.0.0.100', '10.0.0.101', '10.0.0.150', '10.0.0.200',
      ];
      
      // Try known common addresses
      console.log('Trying common IP addresses...');
      let found = false;
      
      for (const ip of commonIPs) {
        if (found) break;
        
        console.log('Trying IP:', ip);
        
        try {
          const response = await fetch(`http://${ip}/status`, { 
            timeout: 1000 
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Verify this is our ESP32 by checking response format
            if (data && 'isConnected' in data) {
              console.log('Found ESP32 at IP:', ip);
              setRfidReaderIP(ip);
              setScannerConnected(true);
              found = true;
              setLastActive('just now');
              
              // Start polling for RFID tags
              startRFIDPolling(ip);
            }
          }
        } catch (error) {
          // Continue trying next IP
        }
      }
      
      // If still not found, try IP range scan (10 IPs at a time)
      if (!found) {
        console.log('Trying targeted IP range scan...');
        
        // If we know the device's IP, try to guess the subnet
        if (networkInfo?.details?.ipAddress) {
          const deviceIP = networkInfo.details.ipAddress;
          const ipParts = deviceIP.split('.');
          const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
          
          // Scan first 20 addresses in subnet
          for (let i = 1; i <= 20; i++) {
            if (found) break;
            
            const ipToTry = `${subnet}.${i}`;
            console.log('Scanning IP:', ipToTry);
            
            try {
              const response = await fetch(`http://${ipToTry}/status`, { 
                timeout: 800 
              });
              
              if (response.ok) {
                const data = await response.json();
                
                // Verify this is our ESP32
                if (data && 'isConnected' in data) {
                  console.log('Found ESP32 at IP:', ipToTry);
                  setRfidReaderIP(ipToTry);
                  setScannerConnected(true);
                  found = true;
                  setLastActive('just now');
                  
                  // Start polling for RFID tags
                  startRFIDPolling(ipToTry);
                }
              }
            } catch (error) {
              // Continue trying next IP
            }
          }
        }
      }
      
      if (!found) {
        Alert.alert(
          'Scanner Not Found',
          'Could not find the RFID scanner on your network. Make sure it is connected to the same WiFi network, or enter the IP address manually.',
          [
            {
              text: 'Enter IP Manually',
              onPress: () => showManualIPPrompt()
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error finding scanner:', error);
      Alert.alert(
        'Network Error',
        'Error scanning the network: ' + error.message
      );
    } finally {
      setSearching(false);
    }
  };
  
  // Prompt for manual IP entry
  const showManualIPPrompt = () => {
    Alert.prompt(
      'Enter Scanner IP',
      'Please enter the IP address of your RFID scanner:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Connect',
          onPress: (ip) => {
            if (ip && ip.trim()) {
              setRfidReaderIP(ip.trim());
              checkScannerStatus(ip.trim());
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };
  
  // Function to check if a specific IP is our scanner
  const checkScannerStatus = async (ip) => {
    try {
      console.log('Checking scanner status at IP:', ip);
      const response = await fetch(`http://${ip}/status`, { timeout: 3000 });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Scanner status response:', data);
        setScannerConnected(true);
        setLastActive('just now');
        
        // If the scanner is connected to WiFi, start polling
        if (data.isConnected) {
          // Update the IP if it has changed
          if (data.ip && data.ip !== ip && data.ip !== '0.0.0.0') {
            console.log('Updated scanner IP from', ip, 'to', data.ip);
            setRfidReaderIP(data.ip);
            startRFIDPolling(data.ip);
            return data.ip; // Return the updated IP
          } else {
            startRFIDPolling(ip);
          }
        }
        
        return ip; // Return the current IP if it's still valid
      }
    } catch (error) {
      console.error('Scanner status check error:', error);
      setScannerConnected(false);
    }
    return null;
  };
  
  // Start polling for RFID scans
  const startRFIDPolling = (ip) => {
    // Clear any existing interval
    if (window.rfidPollingInterval) {
      clearInterval(window.rfidPollingInterval);
    }
    
    console.log('Starting RFID polling at IP:', ip);
    
    // Store the last processed data to avoid duplicate processing
    let lastProcessedUID = "";
    let lastProcessedTimestamp = 0;
    
    // Set up a new polling interval
    window.rfidPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://${ip}/read-rfid`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('RFID data received:', data);
          
          // Only process if:
          // 1. We have a valid UID
          // 2. This is different from the last card we processed (either by UID or timestamp)
          if (data.uid && data.uid.length > 0 && 
              (data.uid !== lastProcessedUID || data.timestamp !== lastProcessedTimestamp)) {
            
            console.log('New RFID card detected:', data.uid);
            
            // Update our tracking variables
            lastProcessedUID = data.uid;
            lastProcessedTimestamp = data.timestamp;
            
            // Create a card object with timestamp
            const newCard = {
              uid: data.uid,
              timestamp: new Date().toLocaleTimeString(),
              id: Math.random().toString(36).substring(2, 10), // Random ID for FlatList
            };
            
            // Update state
            setLastScannedCard(newCard);
            setLastActive('just now');
            
            // Add to history (only keep last 20)
            setScanHistory(prevHistory => [
              newCard,
              ...prevHistory.slice(0, 19)
            ]);
            
            // Trigger animation and vibration
            Animated.sequence([
              Animated.timing(cardAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(cardAnimation, {
                toValue: 0,
                duration: 300,
                delay: 500,
                useNativeDriver: true,
              })
            ]).start();
            
            // Vibrate the device
            Vibration.vibrate(200);
          }
        }
      } catch (error) {
        console.error('RFID polling error:', error);
        
        // If we get an error, check if the scanner is still available
        const stillConnected = await checkScannerStatus(ip);
        
        if (!stillConnected) {
          // Stop polling if scanner is not available
          clearInterval(window.rfidPollingInterval);
          setScannerConnected(false);
        }
      }
    }, 1000); // Poll every second
  };
  
  // Handle manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (hasAssignedScanner) {
      await checkNetworkStatus();
    } else {
      await checkScannerAssignment();
    }
    setRefreshing(false);
  };
  
  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (window.rfidPollingInterval) {
        clearInterval(window.rfidPollingInterval);
      }
    };
  }, []);

  // Navigate to dashboard
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };
  
  // Navigate to create payment screen
  const navigateToCreatePayment = () => {
    navigation.navigate('Payments');
  };
  
  // Navigate to wifi setup screen
  const navigateToWifiSetup = () => {
    navigation.navigate('WifiSetup');
  };

  // Animation style for card detection
  const cardHighlightStyle = {
    transform: [
      {
        scale: cardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05]
        })
      }
    ],
    shadowOpacity: cardAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.8]
    }),
    backgroundColor: cardAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFFFFF', '#FFF8F0']
    })
  };

  // Show loading screen while checking assignment
  if (isCheckingAssignment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#ed7b0e" />
          <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
            Checking scanner assignment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show scanner assignment screen if no scanner is assigned
  if (hasAssignedScanner === false) {
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
            onPress={navigateToSettings}
          >
            <Ionicons name="person-circle-outline" size={40} color="#ed7b0e" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ed7b0e']}
            />
          }
        >
          {/* Scanner Assignment Section */}
          <View style={styles.detailsSection}>
            <View style={[styles.sectionHeader, { flexDirection: 'row', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="credit-card-scan-outline" size={24} color="#ed7b0e" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Assign RFID Scanner</Text>
            </View>
            
            <View style={styles.assignmentFormSection}>
              <Text style={[styles.detailValue, { marginBottom: 25, textAlign: 'center', color: '#666', fontSize: 15, lineHeight: 22 }]}>
                You need to assign an RFID scanner to your account before you can start accepting payments.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Device ID <Text style={styles.requiredIndicator}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  deviceIdFocused && styles.inputContainerFocused
                ]}>
                  <MaterialCommunityIcons 
                    name="credit-card-scan-outline" 
                    size={20} 
                    color={deviceIdFocused ? "#ed7b0e" : "#666"} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={deviceId}
                    onChangeText={setDeviceId}
                    onFocus={() => setDeviceIdFocused(true)}
                    onBlur={() => setDeviceIdFocused(false)}
                    placeholder="Enter scanner device ID (e.g., TPZ-5423-RFID)"
                    placeholderTextColor="#888"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Model <Text style={styles.requiredIndicator}>*</Text>
                </Text>
                <View style={[
                  styles.dropdownContainer,
                  (showModelDropdown || modelFocused) && styles.dropdownContainerFocused,
                  showModelDropdown && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                ]}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setShowModelDropdown(!showModelDropdown);
                      setModelFocused(!showModelDropdown);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="cellphone-nfc" 
                      size={20} 
                      color={(showModelDropdown || modelFocused) ? "#ed7b0e" : "#666"} 
                      style={styles.inputIcon}
                    />
                    <Text style={model ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                      {model ? modelOptions.find(option => option.value === model)?.label : 'Select scanner model'}
                    </Text>
                    <Ionicons 
                      name={showModelDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={(showModelDropdown || modelFocused) ? "#ed7b0e" : "#666"}
                      style={styles.dropdownIcon}
                    />
                  </TouchableOpacity>
                </View>
                
                {showModelDropdown && (
                  <View style={[styles.dropdownList, { 
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderColor: '#ed7b0e',
                  }]}>
                    {modelOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          model === option.value && styles.dropdownItemSelected,
                          index === modelOptions.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setModel(option.value);
                          setShowModelDropdown(false);
                          setModelFocused(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons 
                          name="cellphone-nfc" 
                          size={16} 
                          color={model === option.value ? "#ed7b0e" : "#666"} 
                          style={{ marginRight: 10 }}
                        />
                        <Text style={[
                          styles.dropdownItemText,
                          model === option.value && styles.dropdownItemSelectedText
                        ]}>
                          {option.label}
                        </Text>
                        {model === option.value && (
                          <Ionicons 
                            name="checkmark" 
                            size={18} 
                            color="#ed7b0e" 
                            style={{ marginLeft: 'auto' }}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Firmware Version</Text>
                <View style={[
                  styles.inputContainer,
                  firmwareFocused && styles.inputContainerFocused
                ]}>
                  <MaterialCommunityIcons 
                    name="update" 
                    size={20} 
                    color={firmwareFocused ? "#ed7b0e" : "#666"} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={firmwareVersion}
                    onChangeText={setFirmwareVersion}
                    onFocus={() => setFirmwareFocused(true)}
                    onBlur={() => setFirmwareFocused(false)}
                    placeholder="Enter firmware version (optional)"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.assignmentButton,
                  isAssigning && styles.assignmentButtonDisabled
                ]}
                onPress={assignScannerToMerchant}
                disabled={isAssigning}
                activeOpacity={0.8}
              >
                {isAssigning ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.assignmentButtonText}>
                    Assign Scanner
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <View style={styles.helpHeader}>
              <Ionicons name="help-circle-outline" size={24} color="#ed7b0e" />
              <Text style={styles.helpTitle}>
                How to find your scanner details?
              </Text>
            </View>
            
            <Text style={styles.helpText}>
              Your RFID scanner's Device ID and Model can usually be found on a label on the device itself or in the device manual. If you're unsure, contact your hardware provider for assistance.
            </Text>
            
            <TouchableOpacity style={{
              backgroundColor: '#ed7b0e',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#FFFFFF',
                fontWeight: '600',
              }}>
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show main scanner screen if scanner is assigned
  const scannerDetails = assignedScanner ? {
    name: assignedScanner.model || 'RFID Card Reader',
    scannerId: assignedScanner.deviceId,
    firmwareVersion: assignedScanner.firmwareVersion,
    location: 'Main Counter'
  } : defaultScannerDetails;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section - Same as original ScannerScreen */}
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
          onPress={navigateToSettings}
        >
          <Ionicons name="person-circle-outline" size={40} color="#ed7b0e" />
        </TouchableOpacity>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hello, Coffee Shop</Text>
        <Text style={styles.greetingSubtext}>Manage your RFID scanner</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ed7b0e']}
          />
        }
      >
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
                  scannerConnected ? styles.connectionActive : styles.connectionInactive
                ]}>
                  <Ionicons 
                    name={scannerConnected ? "radio-outline" : "radio-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.connectionTextContainer}>
                  <Text style={styles.connectionStatus}>
                    {scannerConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                  <Text style={styles.connectionSubtext}>
                    {scannerConnected ? 'Ready for payments' : 'Check connection below'}
                  </Text>
                </View>
              </View>
            </View>
            
            {searching ? (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="small" color="#ed7b0e" />
                <Text style={styles.scanningText}>Searching for scanner...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.checkConnectionButton}
                onPress={findScannerOnNetwork}
                disabled={searching}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFF" />
                <Text style={styles.checkConnectionText}>
                  {scannerConnected ? 'Check Connection' : 'Find Scanner'}
                </Text>
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
                  scannerConnected ? styles.statusConnected : styles.statusDisconnected
                ]} />
                <Text style={[
                  styles.detailValue,
                  scannerConnected ? styles.valueConnected : styles.valueDisconnected
                ]}>
                  {scannerConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            
            {assignedScanner && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Assignment Status</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F0F8F0',
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: '#28a745',
                }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#28a745" />
                  <Text style={[styles.detailValue, { color: '#28a745', marginLeft: 6, fontSize: 14 }]}>
                    Assigned to your account
                  </Text>
                </View>
              </View>
            )}
            
            {networkInfo && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Network</Text>
                <Text style={styles.detailValue}>
                  {networkInfo?.details?.ssid || 'Unknown'}
                </Text>
              </View>
            )}
            
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
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>IP Address</Text>
              <Text style={styles.detailValue}>{rfidReaderIP || 'Unknown'}</Text>
            </View>
          </View>
        </View>

        {/* Last Scanned Card - Show only when scanner is connected */}
        {scannerConnected && lastScannedCard && (
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Last Scanned Card</Text>
            </View>
            
            <Animated.View style={[styles.detailsContainer, cardHighlightStyle, {padding: 20, alignItems: 'center'}]}>
              <View style={styles.paymentActionIcon}>
                <MaterialCommunityIcons name="credit-card-scan-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: 8
              }}>
                {lastScannedCard.uid}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666',
              }}>
                Scanned at {lastScannedCard.timestamp}
              </Text>
            </Animated.View>
          </View>
        )}
        
        {/* Scan History - Show only when scanner is connected and history exists */}
        {scannerConnected && scanHistory.length > 0 && (
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scan History</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <FlatList
                data={scanHistory.slice(0, 5)} // Show only the latest 5
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.detailItem}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <MaterialCommunityIcons name="credit-card-scan" size={18} color="#ed7b0e" style={{marginRight: 8}} />
                      <Text style={styles.detailValue}>{item.uid}</Text>
                    </View>
                    <Text style={{fontSize: 12, color: '#888'}}>{item.timestamp}</Text>
                  </View>
                )}
                scrollEnabled={false}  // Disable scrolling for the nested list
              />
              
              {scanHistory.length > 5 && (
                <TouchableOpacity style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: '#F0F0F0',
                  marginTop: 5,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#ed7b0e',
                    fontWeight: '600',
                  }}>View All Scans</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {/* Accept Payment - Action Button */}
        <View style={styles.paymentActionContainer}>
          <TouchableOpacity 
            style={[styles.paymentActionButton, {backgroundColor: scannerConnected ? '#ed7b0e' : '#cccccc'}]}
            onPress={navigateToCreatePayment}
            disabled={!scannerConnected}
          >
            <View style={styles.paymentActionIcon}>
              <Ionicons name="cash-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentActionTitle}>Accept Payment</Text>
          </TouchableOpacity>
        </View>
        
        {/* Manual IP Button */}
        <View style={styles.manualIpButtonContainer}>
          <TouchableOpacity
            style={styles.manualIpButton}
            onPress={showManualIPPrompt}
          >
            <Text style={styles.manualIpButtonText}>
              Enter Scanner IP Manually
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle-outline" size={24} color="#ed7b0e" />
            <Text style={styles.helpTitle}>
              Need help with your scanner?
            </Text>
          </View>
          
          <Text style={styles.helpText}>
            If you're having trouble with your RFID scanner, check that it's powered on and connected to the same WiFi network as your phone. You can also try manually entering the scanner's IP address.
          </Text>
          
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>
              View Troubleshooting Guide
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* WiFi Setup Button */}
        <View style={styles.wifiActionContainer}>
          <TouchableOpacity 
            style={styles.wifiActionButton}
            onPress={navigateToWifiSetup}
          >
            <View style={styles.wifiActionIcon}>
              <Ionicons name="wifi-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.wifiActionTitle}>Connect Scanner to Wifi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScannerScreen;