import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import merchantAuthService from '../services/merchantAuthService';
import merchantDeviceService from '../services/merchantDeviceService';

// Import styles
import styles from '../styles/ScannerScreenStyles';

// BLE Service and Characteristic UUIDs (must match ESP32)
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const STATUS_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';

const ScannerScreen = () => {
  const navigation = useNavigation();
  
  // BLE Manager - with error handling
  const [manager, setManager] = useState(null);
  const [bleAvailable, setBleAvailable] = useState(false);
  const [bleError, setBleError] = useState(null);
  
  // Scanner assignment states
  const [hasAssignedScanner, setHasAssignedScanner] = useState(null);
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
  
  // BLE scanner states
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [scannerConnected, setScannerConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastActive, setLastActive] = useState('Never');
  const [bluetoothState, setBluetoothState] = useState('Unknown');
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  // Scanner details
  const defaultScannerDetails = {
    name: 'RFID Card Reader',
    scannerId: 'TPZ-5423-RFID',
    firmwareVersion: '2.0.0-BLE',
    location: 'Main Counter'
  };

  // Initialize BLE with proper error handling
  useEffect(() => {
    const initializeBLE = async () => {
      try {
        // Check if we're on a physical device
        if (!Device.isDevice) {
          setBleError('Physical device required for Bluetooth functionality');
          return;
        }

        // Try to import and initialize BLE manager
        const { BleManager } = await import('react-native-ble-plx');
        
        if (!BleManager) {
          setBleError('BLE Manager not available - may need development build');
          return;
        }

        const bleManager = new BleManager();
        setManager(bleManager);
        setBleAvailable(true);
        
        // Monitor Bluetooth state
        const subscription = bleManager.onStateChange((state) => {
          handleBluetoothState(state);
        }, true);
        
        console.log('BLE Manager initialized successfully');
        
        return () => {
          if (subscription) subscription.remove();
          if (bleManager) bleManager.destroy();
        };
        
      } catch (error) {
        console.error('BLE initialization error:', error);
        setBleError(`BLE not available: ${error.message}`);
        
        // Show user-friendly error message
        if (error.message.includes('Native module cannot be null')) {
          setBleError('Development build required for BLE functionality. Cannot use Expo Go.');
        } else {
          setBleError(`BLE initialization failed: ${error.message}`);
        }
      }
    };

    initializeBLE();
  }, []);

  // Request permissions - store permission state
  const requestBLEPermissions = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          'Physical Device Required',
          'Bluetooth functionality requires a physical device. BLE does not work in simulators.'
        );
        return false;
      }

      if (!bleAvailable) {
        Alert.alert(
          'BLE Not Available',
          bleError || 'Bluetooth Low Energy is not available on this device.'
        );
        return false;
      }

      // Check if permissions were already granted
      const permissionGranted = await AsyncStorage.getItem('blePermissionGranted');
      if (permissionGranted === 'true') {
        setPermissionsGranted(true);
        return true;
      }

      if (Platform.OS === 'android') {
        // For Android, guide user to settings
        Alert.alert(
          'Bluetooth Permissions Required',
          'This app needs Bluetooth and location permissions to scan for devices.\n\n1. Grant Location permission\n2. Grant Nearby devices permission\n3. Enable Location services',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              }
            },
            {
              text: 'I\'ve granted permissions',
              onPress: async () => {
                setPermissionsGranted(true);
                await AsyncStorage.setItem('blePermissionGranted', 'true');
                console.log('User confirmed permissions granted');
              }
            }
          ]
        );
      } else {
        console.log('iOS: BLE permissions will be requested automatically when needed');
        setPermissionsGranted(true);
        await AsyncStorage.setItem('blePermissionGranted', 'true');
      }

      return true;
      
    } catch (error) {
      console.error('Permission setup error:', error);
      Alert.alert(
        'Permission Error',
        'Failed to set up Bluetooth permissions. Please check your device settings.'
      );
      return false;
    }
  };

  // Platform-specific Bluetooth state handling
  const handleBluetoothState = (state) => {
    console.log('Bluetooth state changed:', state);
    setBluetoothState(state);
    
    switch (state) {
      case 'PoweredOff':
        setScannerConnected(false);
        setConnectedDevice(null);
        Alert.alert(
          'Bluetooth Required',
          'Please turn on Bluetooth to connect to your scanner.'
        );
        break;
        
      case 'Unauthorized':
        Alert.alert(
          'Bluetooth Permission Required',
          'Please allow Bluetooth access for this app in Settings.',
          [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        break;
        
      case 'PoweredOn':
        console.log('Bluetooth is ready');
        if (hasAssignedScanner === true && !scannerConnected) {
          autoConnectToSavedScanner();
        }
        break;
        
      case 'Unsupported':
        Alert.alert(
          'Bluetooth Not Supported',
          'This device does not support Bluetooth Low Energy.'
        );
        break;
        
      default:
        console.log(`Bluetooth state: ${state}`);
    }
  };

  // Check scanner assignment on mount
  useFocusEffect(
    React.useCallback(() => {
      checkScannerAssignment();
    }, [])
  );

  // Auto-connect when conditions are met
  useEffect(() => {
    if (hasAssignedScanner === true && bluetoothState === 'PoweredOn' && permissionsGranted && manager) {
      autoConnectToSavedScanner();
    }
  }, [hasAssignedScanner, bluetoothState, permissionsGranted, manager]);

  // Permission setup when BLE becomes available
  useEffect(() => {
    if (bleAvailable && !permissionsGranted) {
      requestBLEPermissions();
    }
  }, [bleAvailable]);

  // Function to check if merchant has assigned scanner
  const checkScannerAssignment = async () => {
    try {
      setIsCheckingAssignment(true);
      
      const isAuth = await merchantAuthService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Error', 'Please log in again');
        navigation.navigate('Auth');
        return;
      }

      const result = await merchantDeviceService.getMerchantScanners();
      
      if (result.success) {
        if (result.count > 0 && result.scanners.length > 0) {
          setHasAssignedScanner(true);
          setAssignedScanner(result.scanners[0]);
          
          const scanner = result.scanners[0];
          setModel(scanner.model || '');
          setFirmwareVersion(scanner.firmwareVersion || '');
          setDeviceId(scanner.deviceId || '');
        } else {
          setHasAssignedScanner(false);
        }
      } else {
        if (result.message && result.message.includes('401')) {
          Alert.alert('Session Expired', 'Please log in again');
          navigation.navigate('Auth');
        } else {
          throw new Error(result.message || 'Failed to check scanner assignment');
        }
      }
    } catch (error) {
      console.error('Error checking scanner assignment:', error);
      Alert.alert(
        'Error',
        `Failed to check scanner assignment: ${error.message}`,
        [
          { text: 'Retry', onPress: checkScannerAssignment },
          { text: 'Skip for now', onPress: () => setHasAssignedScanner(false) }
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
      
      const isAuth = await merchantAuthService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Error', 'Please log in again');
        navigation.navigate('Auth');
        return;
      }

      const scannerData = {
        deviceId: deviceId.trim(),
        model: model.trim(),
        firmwareVersion: firmwareVersion.trim() || '2.0.0-BLE'
      };

      const result = await merchantDeviceService.assignScanner(scannerData);

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
        Alert.alert('Error', result.message || 'Failed to assign scanner');
      }
    } catch (error) {
      console.error('Error assigning scanner:', error);
      if (error.message.includes('401')) {
        Alert.alert('Session Expired', 'Please log in again');
        navigation.navigate('Auth');
      } else {
        Alert.alert('Error', error.message || 'Network error');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  // Scan for devices - only if BLE is available
  const scanForDevices = async () => {
    if (!manager || !bleAvailable) {
      Alert.alert(
        'BLE Not Available',
        bleError || 'Bluetooth Low Energy is not available. You may need a development build instead of Expo Go.'
      );
      return;
    }

    if (bluetoothState !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth Required',
        'Please turn on Bluetooth to scan for devices'
      );
      return;
    }

    // Check permissions before scanning
    if (!permissionsGranted) {
      Alert.alert(
        'Permissions Required',
        'Please grant Bluetooth and location permissions in Settings > Apps > Tapyze Merchant > Permissions',
        [
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setScanning(true);
    setDiscoveredDevices([]);
    
    try {
      console.log('Starting BLE scan...');
      manager.stopDeviceScan();
      
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          
          // Handle specific BLE errors
          if (error.message.includes('not authorized')) {
            Alert.alert(
              'Permission Denied',
              'Bluetooth permission denied. Please enable Location and Nearby devices permissions in Settings > Apps > Tapyze Merchant > Permissions',
              [
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings()
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
          } else if (error.message.includes('location')) {
            Alert.alert(
              'Location Required',
              'Location services must be enabled for Bluetooth scanning. Please enable Location in Settings.',
              [
                {
                  text: 'Open Settings', 
                  onPress: () => Linking.openSettings()
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
          } else {
            Alert.alert('Scan Error', `Failed to scan: ${error.message}`);
          }
          return;
        }
        
        if (device && device.name) {
          const isTargetDevice = 
            device.name.toLowerCase().includes('tapyze') ||
            device.name.toLowerCase().includes('scanner') ||
            device.name === 'TapyzeScanner';
          
          if (isTargetDevice) {
            console.log('Found target device:', device.name);
            setDiscoveredDevices(prev => {
              const exists = prev.find(d => d.id === device.id);
              if (!exists) {
                return [...prev, {
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi
                }];
              }
              return prev;
            });
          }
        }
      });
      
      setTimeout(() => {
        manager.stopDeviceScan();
        setScanning(false);
        console.log('BLE scan completed');
      }, 15000);
      
    } catch (error) {
      console.error('Error starting scan:', error);
      setScanning(false);
      Alert.alert('Scan Error', `Failed to start scanning: ${error.message}`);
    }
  };

  // Connect to device - only if BLE is available
  const connectToDevice = async (deviceId) => {
    if (!manager) {
      Alert.alert('Error', 'BLE Manager not available');
      return;
    }

    try {
      console.log('Connecting to device:', deviceId);
      const device = await manager.connectToDevice(deviceId);
      
      // Request larger MTU for better data transfer
      try {
        await device.requestMTU(512);
        console.log('MTU requested: 512');
      } catch (mtuError) {
        console.log('MTU request failed, using default:', mtuError.message);
      }
      
      await device.discoverAllServicesAndCharacteristics();
      
      // Only set up basic connection monitoring for status (not RFID data)
      await setupConnectionMonitoring(device);
      
      setConnectedDevice(device);
      setScannerConnected(true);
      setLastActive('just now');
      
      await AsyncStorage.setItem('savedScannerDeviceId', deviceId);
      console.log('Connected successfully');
      
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', `Failed to connect: ${error.message}`);
    }
  };

  // Set up basic connection monitoring - NO RFID data handling
  const setupConnectionMonitoring = async (device) => {
    try {
      console.log('Setting up basic connection monitoring...');
      
      // Monitor only connection status, not RFID data
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Connection monitoring error:', error);
            if (error.errorCode === 6) {
              handleDeviceDisconnection();
            }
            return;
          }
          
          if (characteristic?.value) {
            try {
              const rawData = atob(characteristic.value);
              
              if (!rawData || rawData.trim() === '') {
                return;
              }
              
              // Only process status/connection data, ignore RFID data
              const data = JSON.parse(rawData);
              
              // Only handle status updates, not RFID scans
              if (data.status || data.uptime !== undefined) {
                console.log('Scanner status update:', data);
                setConnectionStatus(data);
                setLastActive('just now');
              }
              // Ignore any RFID data (uid, etc.) - that's handled in payment screen
              
            } catch (parseError) {
              console.log('Status data parse error (normal):', parseError.message);
            }
          }
        }
      );
      
      console.log('Connection monitoring setup complete');
      
    } catch (error) {
      console.error('Error setting up connection monitoring:', error);
      Alert.alert(
        'Setup Error',
        'Failed to set up device communication. Please reconnect to the scanner.'
      );
    }
  };

  // Handle device disconnection
  const handleDeviceDisconnection = () => {
    console.log('Device disconnected');
    setScannerConnected(false);
    setConnectedDevice(null);
    setLastActive('Disconnected');
    setConnectionStatus(null);
    
    // Try to auto-reconnect after a delay
    setTimeout(() => {
      if (!scannerConnected && bluetoothState === 'PoweredOn') {
        autoConnectToSavedScanner();
      }
    }, 3000);
  };

  // Auto-connect to saved scanner
  const autoConnectToSavedScanner = async () => {
    try {
      const savedDeviceId = await AsyncStorage.getItem('savedScannerDeviceId');
      if (savedDeviceId && !scannerConnected && manager) {
        console.log('Attempting auto-connect to:', savedDeviceId);
        await connectToDevice(savedDeviceId);
      }
    } catch (error) {
      console.error('Auto-connect error:', error);
    }
  };

  // Disconnect from scanner
  const disconnectFromScanner = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setScannerConnected(false);
        setLastActive('Disconnected');
        setConnectionStatus(null);
        await AsyncStorage.removeItem('savedScannerDeviceId');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (hasAssignedScanner) {
      if (!scannerConnected && manager) {
        await scanForDevices();
      }
    } else {
      await checkScannerAssignment();
    }
    setRefreshing(false);
  };

  // Navigation functions
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };
  
  const navigateToCreatePayment = () => {
    if (!scannerConnected) {
      Alert.alert(
        'Scanner Not Connected',
        'Please connect to the scanner first before creating payments.'
      );
      return;
    }
    navigation.navigate('Payments');
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
          <Text style={{ marginTop: 10, fontSize: 14, color: '#888', textAlign: 'center' }}>
            Device: {Device.isDevice ? 'Physical Device' : 'Simulator/Emulator'}
          </Text>
          {bleError && (
            <Text style={{ marginTop: 10, fontSize: 12, color: '#e74c3c', textAlign: 'center' }}>
              {bleError}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Show BLE unavailable screen
  if (!bleAvailable || bleError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <MaterialCommunityIcons name="bluetooth-off" size={64} color="#e74c3c" />
          <Text style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            BLE Not Available
          </Text>
          <Text style={{ marginTop: 10, fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }}>
            {bleError || 'Bluetooth Low Energy is not available on this device.'}
          </Text>
          
          {bleError && bleError.includes('Development build required') && (
            <View style={{ marginTop: 20, backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ffc107' }}>
              <Text style={{ fontSize: 14, color: '#856404', fontWeight: 'bold' }}>
                Development Build Required
              </Text>
              <Text style={{ fontSize: 12, color: '#856404', marginTop: 5, lineHeight: 16 }}>
                BLE functionality requires a development build. You cannot use Expo Go for Bluetooth features.
                {'\n\n'}Build with: npx expo run:ios --device or npx expo run:android --device
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#ed7b0e', 
              paddingHorizontal: 20, 
              paddingVertical: 12, 
              borderRadius: 8, 
              marginTop: 20 
            }}
            onPress={navigateToSettings}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              Go to Settings
            </Text>
          </TouchableOpacity>
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
              <MaterialCommunityIcons name="bluetooth" size={24} color="#ed7b0e" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Assign BLE RFID Scanner</Text>
            </View>
            
            <View style={styles.assignmentFormSection}>
              <Text style={[styles.detailValue, { marginBottom: 25, textAlign: 'center', color: '#666', fontSize: 15, lineHeight: 22 }]}>
                You need to assign a Bluetooth RFID scanner to your account before you can start accepting payments.
              </Text>

              {/* Device info */}
              <View style={{
                backgroundColor: '#f8f9fa',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                borderLeftWidth: 3,
                borderLeftColor: bleAvailable ? '#28a745' : '#dc3545'
              }}>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                  Device: {Device.isDevice ? 'Physical Device' : 'Simulator/Emulator'}
                </Text>
                <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4 }}>
                  BLE: {bleAvailable ? 'Available' : 'Not Available'} | Bluetooth: {bluetoothState}
                </Text>
              </View>

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
                      name="bluetooth" 
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
                          name="bluetooth" 
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
                Need help with BLE setup?
              </Text>
            </View>
            
            <Text style={styles.helpText}>
              <Text style={{ fontWeight: 'bold' }}>Step 1:</Text> Power on your ESP32 RFID scanner{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Step 2:</Text> Ensure Bluetooth is enabled on your phone{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Step 3:</Text> Grant Location and Nearby devices permissions{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Step 4:</Text> Enable Location services in phone Settings{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Step 5:</Text> Return to app and assign your scanner{'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>Need help?</Text> Make sure to enable all Bluetooth permissions in Settings : Apps : Tapyze Merchant : Permissions
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
                View BLE Setup Guide
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show main scanner screen if scanner is assigned
  const scannerDetails = assignedScanner ? {
    name: assignedScanner.model || 'BLE RFID Card Reader',
    scannerId: assignedScanner.deviceId,
    firmwareVersion: assignedScanner.firmwareVersion,
    location: 'Main Counter'
  } : defaultScannerDetails;

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

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hello, Coffee Shop</Text>
        <Text style={styles.greetingSubtext}>Manage your BLE RFID scanner connection</Text>
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
              <Text style={styles.cardType}>BLE NFC SCANNER</Text>
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
                    name={scannerConnected ? "bluetooth" : "bluetooth-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.connectionTextContainer}>
                  <Text style={styles.connectionStatus}>
                    {scannerConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                  <Text style={styles.connectionSubtext}>
                    {scannerConnected ? 'Ready for payments' : bleAvailable ? 'Tap to scan for devices' : 'BLE not available'}
                  </Text>
                </View>
              </View>
            </View>
            
            {scanning ? (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="small" color="#ed7b0e" />
                <Text style={styles.scanningText}>
                  Scanning for BLE devices...
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.checkConnectionButton,
                  (!bleAvailable || bluetoothState !== 'PoweredOn') && { backgroundColor: '#cccccc' }
                ]}
                onPress={scannerConnected ? disconnectFromScanner : scanForDevices}
                disabled={scanning || !bleAvailable || bluetoothState !== 'PoweredOn'}
              >
                <Ionicons 
                  name={scannerConnected ? "bluetooth" : "bluetooth-outline"} 
                  size={20} 
                  color="#FFF" 
                />
                <Text style={styles.checkConnectionText}>
                  {scannerConnected ? 'Disconnect' : bleAvailable ? 'Scan for Devices' : 'BLE Unavailable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bluetooth Status Info */}
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bluetooth Status</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Device Type</Text>
              <Text style={styles.detailValue}>
                {Device.isDevice ? 'Physical Device' : 'Simulator/Emulator'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>BLE Available</Text>
              <View style={styles.detailValueContainer}>
                <View style={[
                  styles.statusDot,
                  bleAvailable ? styles.statusConnected : styles.statusDisconnected
                ]} />
                <Text style={[
                  styles.detailValue,
                  bleAvailable ? styles.valueConnected : styles.valueDisconnected
                ]}>
                  {bleAvailable ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bluetooth State</Text>
              <View style={styles.detailValueContainer}>
                <View style={[
                  styles.statusDot,
                  bluetoothState === 'PoweredOn' ? styles.statusConnected : styles.statusDisconnected
                ]} />
                <Text style={[
                  styles.detailValue,
                  bluetoothState === 'PoweredOn' ? styles.valueConnected : styles.valueDisconnected
                ]}>
                  {bluetoothState}
                </Text>
              </View>
            </View>

            {bleError && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Error</Text>
                <Text style={[styles.detailValue, { color: '#e74c3c', fontSize: 12 }]}>
                  {bleError}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Discovered Devices */}
        {discoveredDevices.length > 0 && !scannerConnected && (
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discovered Devices ({discoveredDevices.length})</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              {discoveredDevices.map((device, index) => (
                <TouchableOpacity
                  key={device.id}
                  style={[styles.deviceItem, {
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    padding: 15,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                  }]}
                  onPress={() => connectToDevice(device.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="bluetooth" size={24} color="#ed7b0e" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                        {device.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
                        Signal: {device.rssi} dBm
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ed7b0e" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Scanner Details */}
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scanner Details</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Connection Status</Text>
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
            
            {connectedDevice && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Device ID</Text>
                <Text style={[styles.detailValue, { fontSize: 12, fontFamily: 'monospace' }]}>
                  {connectedDevice.id}
                </Text>
              </View>
            )}

            {connectionStatus && connectionStatus.uptime !== undefined && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Scanner Uptime</Text>
                <Text style={styles.detailValue}>
                  {Math.floor(connectionStatus.uptime / 1000 / 60)} minutes
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Accept Payment - Action Button */}
        <View style={styles.paymentActionContainer}>
          <TouchableOpacity 
            style={[
              styles.paymentActionButton, 
              {backgroundColor: scannerConnected ? '#ed7b0e' : '#cccccc'}
            ]}
            onPress={navigateToCreatePayment}
            disabled={!scannerConnected}
          >
            <View style={styles.paymentActionIcon}>
              <Ionicons name="cash-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentActionTitle}>Accept Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View style={styles.manualIpButtonContainer}>
          {/* Open Bluetooth Settings */}
          <TouchableOpacity
            style={styles.manualIpButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.manualIpButtonText}>
              Open {Platform.OS === 'ios' ? 'Settings' : 'Bluetooth Settings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle-outline" size={24} color="#ed7b0e" />
            <Text style={styles.helpTitle}>
              How to connect your BLE scanner
            </Text>
          </View>
          
          <Text style={styles.helpText}>
            <Text style={{ fontWeight: 'bold' }}>Step 1:</Text> Power on your ESP32 RFID scanner{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Step 2:</Text> Ensure Bluetooth is enabled on your phone{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Step 3:</Text> Tap "Scan for Devices" below{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Step 4:</Text> Select "TapyzeScanner" from the list{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Step 5:</Text> Wait for connection confirmation{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Step 6:</Text> Navigate to Payments to start accepting payments{'\n\n'}
            <Text style={{ fontWeight: 'bold' }}>Troubleshooting:</Text>{'\n'}
            • Grant Location and Nearby devices permissions{'\n'}
            • Enable Location services in Settings{'\n'}
            • Keep scanner within 10 meters{'\n'}
            • Restart app if connection fails
          </Text>
          
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>
              View {Platform.OS === 'ios' ? 'iOS' : 'Android'} Setup Guide
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScannerScreen;