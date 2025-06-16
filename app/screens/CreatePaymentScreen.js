import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Import services
import paymentService from '../services/merchantPaymentService';

import styles from '../styles/CreatePaymentScreenStyles';

// BLE Service and Characteristic UUIDs (must match ESP32)
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const RFID_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';
const STATUS_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';

const CreatePaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const nfcAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  
  // Payment states
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processingTimeout, setProcessingTimeout] = useState(null);
  const [rfidPollingInterval, setRfidPollingInterval] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [cardType, setCardType] = useState('TAPYZE Card');
  const [scannedCard, setScannedCard] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);

  // BLE states - now with event-driven connection monitoring
  const [manager, setManager] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, connected, disconnected, error
  const [connectionError, setConnectionError] = useState('');
  const [autoReconnectAttempts, setAutoReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(3);

  // Get constants from service
  const CURRENCY = paymentService.getCurrency();
  const MIN_AMOUNT = paymentService.getMinAmount();
  const PIN_LENGTH = paymentService.getPinLength();

  // Initialize BLE and establish dynamic connection monitoring
  useEffect(() => {
    const initializeBLE = async () => {
      try {
        if (!Device.isDevice) {
          setConnectionError('Physical device required for BLE functionality');
          setConnectionStatus('error');
          return;
        }

        const { BleManager } = await import('react-native-ble-plx');
        if (!BleManager) {
          setConnectionError('BLE Manager not available - development build required');
          setConnectionStatus('error');
          return;
        }

        const bleManager = new BleManager();
        setManager(bleManager);
        
        console.log('BLE Manager initialized for payments');
        
        // Start dynamic connection monitoring
        startConnectionMonitoring(bleManager);
        
      } catch (initError) {
        console.error('BLE initialization failed:', initError);
        setConnectionError(`BLE initialization failed: ${initError.message}`);
        setConnectionStatus('error');
      }
    };

    initializeBLE();
  }, []);

  // Manual reconnection check
  const manualReconnectionCheck = async () => {
    if (!manager) return;
    
    console.log('Manual reconnection check triggered...');
    setConnectionStatus('checking');
    setConnectionError('');
    
    try {
      const savedDeviceId = await AsyncStorage.getItem('savedScannerDeviceId');
      
      if (!savedDeviceId) {
        setConnectionError('No scanner assigned. Please connect scanner first.');
        setConnectionStatus('disconnected');
        return;
      }

      console.log('Attempting manual reconnection to:', savedDeviceId);
      
      const device = await manager.connectToDevice(savedDeviceId);
      
      // Request optimal MTU
      try {
        await device.requestMTU(512);
      } catch (mtuError) {
        console.warn('MTU optimization failed:', mtuError.message);
      }
      
      await device.discoverAllServicesAndCharacteristics();
      
      // Set up disconnection event listener
      device.onDisconnected((error, disconnectedDevice) => {
        console.log('Device disconnected event:', error?.message || 'Clean disconnect');
        setConnectedDevice(null);
        setConnectionStatus('disconnected');
        setConnectionError('Scanner disconnected unexpectedly');
        
        // Stop any ongoing RFID monitoring
        if (rfidPollingInterval) {
          if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
            rfidPollingInterval.remove();
          }
          setRfidPollingInterval(null);
        }
        
        // If payment is in progress, show error
        if (paymentStatus === 'ready' || paymentStatus === 'processing') {
          setErrorMessage('Scanner connection lost during payment');
          setPaymentStatus('failed');
        }
      });
      
      setConnectedDevice(device);
      setConnectionStatus('connected');
      setConnectionError('');
      setAutoReconnectAttempts(0);
      
      console.log('Manual reconnection successful');
      
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      setConnectionError('Failed to reconnect. Please check scanner is powered on and nearby.');
      setConnectionStatus('disconnected');
    }
  };
  const startConnectionMonitoring = async (bleManager) => {
    console.log('Starting event-driven BLE connection monitoring...');
    
    const establishConnection = async () => {
      try {
        const savedDeviceId = await AsyncStorage.getItem('savedScannerDeviceId');
        
        if (!savedDeviceId) {
          setConnectionError('No scanner assigned. Please connect scanner first.');
          setConnectionStatus('disconnected');
          return;
        }

        // Only attempt connection if we don't have one
        if (!connectedDevice) {
          console.log('Attempting to connect to scanner:', savedDeviceId);
          setConnectionStatus('checking');
          
          try {
            const device = await bleManager.connectToDevice(savedDeviceId);
            
            // Request optimal MTU
            try {
              await device.requestMTU(512);
            } catch (mtuError) {
              console.warn('MTU optimization failed:', mtuError.message);
            }
            
            await device.discoverAllServicesAndCharacteristics();
            
            // Set up disconnection event listener
            device.onDisconnected((error, disconnectedDevice) => {
              console.log('Device disconnected event:', error?.message || 'Clean disconnect');
              setConnectedDevice(null);
              setConnectionStatus('disconnected');
              setConnectionError('Scanner disconnected unexpectedly');
              
              // Stop any ongoing RFID monitoring
              if (rfidPollingInterval) {
                if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
                  rfidPollingInterval.remove();
                }
                setRfidPollingInterval(null);
              }
              
              // If payment is in progress, show error
              if (paymentStatus === 'ready' || paymentStatus === 'processing') {
                setErrorMessage('Scanner connection lost during payment');
                setPaymentStatus('failed');
              }
            });
            
            setConnectedDevice(device);
            setConnectionStatus('connected');
            setConnectionError('');
            setAutoReconnectAttempts(0);
            
            console.log('BLE connection established for payments');
            
          } catch (connectionError) {
            console.error('Connection failed:', connectionError);
            
            setAutoReconnectAttempts(prev => prev + 1);
            
            if (autoReconnectAttempts >= maxReconnectAttempts) {
              setConnectionError('Cannot connect to scanner. Please check scanner is powered on and nearby.');
              setConnectionStatus('disconnected');
            } else {
              setConnectionStatus('checking');
              console.log(`Reconnection attempt ${autoReconnectAttempts + 1}/${maxReconnectAttempts}`);
              
              // Retry after delay
              setTimeout(establishConnection, 2000);
            }
          }
        } else {
          // We already have a device, just verify it's connected
          setConnectionStatus('connected');
          setConnectionError('');
        }
        
      } catch (error) {
        console.error('Connection setup error:', error);
        setConnectionError('Connection setup failed');
        setConnectionStatus('error');
      }
    };

    // Initial connection attempt
    await establishConnection();
  };

  // Remove periodic monitoring - use event-driven approach only
  useEffect(() => {
    return () => {
      // Only cleanup RFID monitoring, not connection monitoring
      if (rfidPollingInterval) {
        if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
          rfidPollingInterval.remove();
        }
        setRfidPollingInterval(null);
      }
    };
  }, []);

  // Monitor connection status changes and update UI accordingly
  useEffect(() => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      // If we're in ready or processing state and lose connection, show error
      if (paymentStatus === 'ready' || paymentStatus === 'processing') {
        setErrorMessage(connectionError || 'Scanner connection lost');
        setPaymentStatus('failed');
        
        // Stop any ongoing RFID monitoring
        if (rfidPollingInterval) {
          if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
            rfidPollingInterval.remove();
          }
          setRfidPollingInterval(null);
        }
      }
    }
  }, [connectionStatus, connectionError, paymentStatus]);

  // Reset auto-reconnect attempts when connection is successful
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setAutoReconnectAttempts(0);
    }
  }, [connectionStatus]);
  
  // Remove periodic connection monitoring from cleanup
  useEffect(() => {
    // Animate card scaling on mount
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Cleanup function
    return () => {
      console.log('Payment screen cleanup');
      
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
      
      if (rfidPollingInterval) {
        if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
          rfidPollingInterval.remove();
        }
        setRfidPollingInterval(null);
      }
    };
  }, []);
  
  const handleGoBack = () => {
    // Stop RFID monitoring when leaving screen
    if (rfidPollingInterval) {
      console.log('Stopping RFID monitoring on back navigation');
      if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
        rfidPollingInterval.remove();
      }
      setRfidPollingInterval(null);
    }

    if (paymentStatus === 'processing') {
      Alert.alert(
        "Cancel Transaction?",
        "A transaction is in progress. Are you sure you want to cancel?",
        [
          { text: "Stay", style: "cancel" },
          { 
            text: "Cancel Transaction", 
            onPress: () => {
              if (processingTimeout) {
                clearTimeout(processingTimeout);
                setProcessingTimeout(null);
              }
              resetPayment();
              navigation.goBack();
            } 
          }
        ]
      );
      return;
    }
    
    if (paymentStatus === 'success') {
      Alert.alert(
        "Leave Payment Screen?",
        "Do you want to return to the previous screen?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Go Back", onPress: () => navigation.goBack() }
        ]
      );
      return;
    }
  
    if (paymentStatus === 'ready' || paymentStatus === 'enterPin') {
      Alert.alert(
        "Cancel Payment?",
        "Are you sure you want to cancel this payment?",
        [
          { text: "Continue Payment", style: "cancel" },
          { 
            text: "Cancel", 
            onPress: () => {
              nfcAnimation.stopAnimation();
              navigation.goBack();
            } 
          }
        ]
      );
      return;
    }
    
    navigation.goBack();
  };
  
  const handleNumberPress = (number) => {
    if (paymentStatus === 'enterPin') {
      if (pin.length >= PIN_LENGTH) {
        console.log('PIN already at maximum length, ignoring input');
        return;
      }
      
      if (!/^\d$/.test(number)) {
        console.log('Non-numeric input for PIN, ignoring:', number);
        return;
      }
      
      const newPin = pin + number;
      console.log('PIN input - Current:', pin, 'Adding:', number, 'New:', newPin, 'Length:', newPin.length);
      
      setPin(newPin);
      setPinError('');
      return;
    }
    
    if (amount.includes('.') && amount.split('.')[1].length >= 2) {
      return;
    }
    
    if (!amount.includes('.') && amount.length >= 6) {
      return;
    }
    
    if (amount === '0' && number !== '.') {
      setAmount(number);
      return;
    }
    
    if (number === '.' && amount.includes('.')) {
      return;
    }
    
    if (number === '.' && amount === '') {
      setAmount('0.');
      return;
    }
    
    setAmount(amount + number);
    
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  const handleBackspace = () => {
    if (paymentStatus === 'enterPin') {
      if (pin.length > 0) {
        const newPin = pin.slice(0, -1);
        console.log('PIN backspace - Current:', pin, 'New:', newPin, 'Length:', newPin.length);
        setPin(newPin);
      }
      return;
    }
    
    if (amount.length > 0) {
      setAmount(amount.slice(0, -1));
    }
  };
  
  const handleClear = () => {
    if (paymentStatus === 'enterPin') {
      console.log('Clearing PIN');
      setPin('');
      setPinError('');
      return;
    }
    
    setAmount('');
    setErrorMessage('');
  };
  
  const formatAmount = (value) => {
    return paymentService.formatAmount(value);
  };
  
  const handleNextPress = () => {
    if (!amount || parseFloat(amount) <= MIN_AMOUNT) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    // Check current connection status
    if (connectionStatus !== 'connected') {
      setErrorMessage('Scanner not connected. Please ensure scanner is powered on and nearby.');
      return;
    }

    if (!connectedDevice) {
      setErrorMessage('No active scanner connection. Please check scanner connection.');
      return;
    }
    
    console.log('Payment setup - Amount:', amount, 'BLE Device connected');
    
    setErrorMessage('');
    setPaymentStatus('ready');
    startNfcAnimation();
    startRFIDPolling();
  };
  
  const startNfcAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(nfcAnimation, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(nfcAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  // Enhanced RFID Monitoring - no interference from connection checking
  const startRFIDPolling = () => {
    console.log('Starting RFID monitoring for payment...');
    
    // Verify connection once before starting RFID monitoring
    if (connectionStatus !== 'connected' || !connectedDevice) {
      setErrorMessage('Scanner not connected. Please check scanner connection.');
      setPaymentStatus('failed');
      return;
    }
    
    let lastUID = "";
    let lastTime = 0;
    let subscription = null;
    
    const handleRFIDData = (error, characteristic) => {
      if (error) {
        console.error('RFID monitoring error:', error);
        
        // Connection lost during RFID monitoring
        if (error.errorCode === 6) {
          setErrorMessage('Scanner connection lost during payment. Please reconnect and try again.');
          setPaymentStatus('failed');
          setConnectedDevice(null);
          setConnectionStatus('disconnected');
        }
        return;
      }
      
      if (!characteristic?.value) return;
      
      try {
        const rawData = atob(characteristic.value);
        console.log('Raw RFID data received:', rawData);
        
        if (!rawData || rawData.trim() === '') return;
        
        const data = JSON.parse(rawData);
        console.log('Parsed RFID data:', data);
        
        // Only process RFID scan data (not status data)
        if (data.uid && data.uid.length > 0 && !data.status) {
          const now = Date.now();
          const timeDiff = now - lastTime;
          const isNewCard = data.uid !== lastUID || timeDiff > 2000;
          
          if (isNewCard) {
            console.log('Card detected for payment:', data.uid);
            console.log('Stopping RFID monitoring immediately');
            
            // Stop monitoring to prevent card switching
            if (subscription) {
              subscription.remove();
              subscription = null;
            }
            setRfidPollingInterval(null);
            
            // Update tracking
            lastUID = data.uid;
            lastTime = now;
            
            // Process card
            handleCardDetected(data.uid);
          } else {
            console.log('Duplicate card ignored');
          }
        } else if (data.status) {
          console.log('Status data ignored during RFID monitoring');
        }
        
      } catch (parseError) {
        console.error('JSON parse failed:', parseError.message);
      }
    };
    
    try {
      console.log('Setting up RFID characteristic monitoring...');
      subscription = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        RFID_CHAR_UUID,
        handleRFIDData
      );
      
      setRfidPollingInterval(subscription);
      console.log('RFID monitoring active - waiting for card...');
      
    } catch (startError) {
      console.error('Failed to start RFID monitoring:', startError);
      setErrorMessage('Failed to start card monitoring. Please try again.');
      setPaymentStatus('failed');
    }
    
    // Timeout after 60 seconds
    setTimeout(() => {
      if (subscription && paymentStatus === 'ready') {
        console.log('RFID monitoring timeout');
        subscription.remove();
        setRfidPollingInterval(null);
        setErrorMessage('No card detected within 60 seconds. Please try again.');
        setPaymentStatus('failed');
      }
    }, 60000);
  };
  
  const handleCardDetected = async (cardUid) => {
    try {
      console.log('Processing detected card:', cardUid);
      
      nfcAnimation.stopAnimation();
      
      const result = await paymentService.verifyCard(cardUid);
      
      if (result.success) {
        setScannedCard(result.data);
        
        if (result.data.requiresPinChange) {
          setErrorMessage('PIN change required before making transactions');
          setPaymentStatus('failed');
          return;
        }
        
        if (result.data.cardStatus === 'PIN_LOCKED') {
          setErrorMessage('Card is locked due to multiple failed PIN attempts');
          setPaymentStatus('failed');
          return;
        }
        
        if (result.data.cardStatus !== 'ACTIVE') {
          setErrorMessage(`Card is ${result.data.cardStatus.toLowerCase()}`);
          setPaymentStatus('failed');
          return;
        }
        
        setPaymentStatus('enterPin');
        setPin('');
        setPinError('');
        setPinAttempts(0);
        
      } else {
        setErrorMessage(result.message || 'Invalid card detected');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Card verification error:', error);
      setErrorMessage('Failed to verify card. Please try again.');
      setPaymentStatus('failed');
    }
  };
  
  const handlePinSubmit = async () => {
    console.log('=== PIN SUBMISSION ===');
    console.log('Current PIN:', pin);
    console.log('PIN Length:', pin.length);
    console.log('Expected Length:', PIN_LENGTH);
    
    if (pin.length !== PIN_LENGTH) {
      const errorMsg = `Please enter ${PIN_LENGTH} digit PIN`;
      console.log('PIN length validation failed:', errorMsg);
      setPinError(errorMsg);
      return;
    }
    
    if (!/^\d+$/.test(pin)) {
      const errorMsg = 'PIN must contain only numbers';
      console.log('PIN format validation failed:', errorMsg);
      setPinError(errorMsg);
      return;
    }
    
    if (!scannedCard || !scannedCard.uid) {
      const errorMsg = 'No card detected. Please try again.';
      console.log('Card validation failed:', errorMsg);
      setPinError(errorMsg);
      return;
    }
    
    console.log('PIN validation passed, processing payment...');
    
    setPinError('');
    await processPayment();
  };
  
  const processPayment = async () => {
    try {
      setPaymentStatus('processing');
      
      const paymentData = {
        cardUid: scannedCard.uid,
        pin: pin,
        amount: parseFloat(amount),
        description: `Payment at merchant - ${new Date().toLocaleString()}`
      };
      
      console.log('Processing payment with PaymentService...');
      
      const result = await paymentService.processPayment(paymentData);
      
      console.log('PaymentService result:', result);
      console.log('Result success:', result.success);
      console.log('Result type:', result.type);
      console.log('Result message:', result.message);
      
      if (result.success) {
        console.log('Payment successful');
        
        setTransactionId(result.data.transactionReference || `TXN${Date.now()}`);
        
        setCustomerInfo({
          merchantBalance: result.data.merchantBalance
        });
        
        setPaymentStatus('success');
      } else {
        console.log('Payment failed - checking type...');
        
        // Check for Invalid PIN in multiple ways
        const isInvalidPin = result.type === 'INVALID_PIN' || 
                           result.type === 'UNKNOWN_ERROR' && result.message && result.message.toLowerCase().includes('invalid pin');
        
        console.log('Is invalid PIN?', isInvalidPin);
        
        if (isInvalidPin) {
          console.log('Invalid PIN detected - staying on PIN entry page');
          if (result.data && result.data.remainingAttempts !== undefined) {
            setPinAttempts(3 - result.data.remainingAttempts);
            setMaxAttempts(3);
            setPinError(result.message);
          } else {
            setPinError('Invalid PIN. Please try again.');
          }
          setPin('');
          console.log('About to set status to enterPin...');
          setPaymentStatus('enterPin');
          console.log('Status set back to enterPin, PIN cleared');
          
          return;
        } else {
          console.log('Other error type - going to failed state');
          handlePaymentFailure(result);
        }
      }
      
    } catch (error) {
      console.error('Payment processing error in catch block:', error);
      console.log('Error message:', error.message);
      console.log('Checking if error contains "invalid pin"...');
      
      if (error.message && error.message.toLowerCase().includes('invalid pin')) {
        console.log('Caught invalid PIN error - staying on PIN entry page');
        console.log('Setting PIN error and clearing PIN field');
        setPinError('Invalid PIN. Please try again.');
        setPin('');
        setPaymentStatus('enterPin');
        console.log('Status set back to enterPin');
      } else {
        console.log('Other error detected - going to failed state');
        setErrorMessage('An unexpected error occurred. Please try again.');
        setPaymentStatus('failed');
      }
    }
  };
  
  const handlePaymentFailure = (result) => {
    switch (result.type) {
      case 'CARD_LOCKED':
        setErrorMessage(result.message);
        setPaymentStatus('failed');
        break;
        
      case 'INSUFFICIENT_FUNDS':
        setErrorMessage(result.message);
        setPaymentStatus('failed');
        break;
        
      case 'TIMEOUT':
      case 'NETWORK_ERROR':
      case 'AUTH_ERROR':
      case 'SERVER_ERROR':
      case 'VALIDATION_ERROR':
      default:
        setErrorMessage(result.message);
        setPaymentStatus('failed');
        break;
    }
  };
  
  const resetPayment = () => {
    nfcAnimation.stopAnimation();
    nfcAnimation.setValue(1);
    
    if (rfidPollingInterval) {
      if (typeof rfidPollingInterval === 'object' && rfidPollingInterval.remove) {
        rfidPollingInterval.remove();
      }
      setRfidPollingInterval(null);
    }
    
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
    
    setPaymentStatus('initial');
    setAmount('');
    setErrorMessage('');
    setTransactionId('');
    setPin('');
    setPinError('');
    setScannedCard(null);
    setCustomerInfo(null);
    setPinAttempts(0);
  };

  // Render connection status indicator with reload button
  const renderConnectionStatus = () => {
    let statusColor, statusText, statusIcon;
    
    switch (connectionStatus) {
      case 'connected':
        statusColor = '#4CAF50';
        statusText = 'Scanner Connected';
        statusIcon = 'bluetooth';
        break;
      case 'checking':
        statusColor = '#FF9800';
        statusText = 'Connecting to Scanner...';
        statusIcon = 'bluetooth-outline';
        break;
      case 'disconnected':
        statusColor = '#F44336';
        statusText = 'Scanner Disconnected';
        statusIcon = 'bluetooth-outline';
        break;
      case 'error':
        statusColor = '#F44336';
        statusText = 'Connection Error';
        statusIcon = 'alert-circle-outline';
        break;
      default:
        statusColor = '#9E9E9E';
        statusText = 'Unknown Status';
        statusIcon = 'help-circle-outline';
    }

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: statusColor + '20',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: statusColor,
      }}>
        <Ionicons name={statusIcon} size={16} color={statusColor} />
        <Text style={{
          marginLeft: 8,
          fontSize: 14,
          color: statusColor,
          fontWeight: '600',
          flex: 1,
        }}>
          {statusText}
        </Text>
        
        {connectionStatus === 'checking' && (
          <ActivityIndicator size="small" color={statusColor} style={{ marginLeft: 8 }} />
        )}
        
        {/* Reload button for disconnected state */}
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
          <TouchableOpacity
            style={{
              marginLeft: 8,
              padding: 4,
              borderRadius: 4,
              backgroundColor: statusColor + '30',
            }}
            onPress={manualReconnectionCheck}
            activeOpacity={0.7}
          >
            <Ionicons name="reload-outline" size={16} color={statusColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };
    
  const renderAmountDisplay = () => {
    return (
      <View style={styles.amountDisplayContainer}>
        <View style={styles.amountDisplay}>
          <Text style={styles.currencySymbol}>{CURRENCY}</Text>
          <Text style={styles.amountText}>
            {formatAmount(amount)}
          </Text>
        </View>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
    );
  };
  
  const renderPinDisplay = () => {
    return (
      <View style={styles.pinDisplayContainer}>
        <Text style={styles.pinLabel}>Enter PIN</Text>
        
        <View style={styles.pinDotsContainer}>
          {Array(PIN_LENGTH).fill(0).map((_, index) => (
            <View 
              key={`pin-dot-${index}`} 
              style={[
                styles.pinDot,
                pin.length > index ? styles.pinDotFilled : {}
              ]}
            />
          ))}
        </View>
        
        {pinAttempts > 0 && (
          <Text style={styles.attemptsText}>
            {maxAttempts - pinAttempts} attempts remaining
          </Text>
        )}
        
        {pinError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{pinError}</Text>
          </View>
        ) : null}
      </View>
    );
  };
  
  const renderNumberPad = () => {
    const keys = [
      { value: '1' }, { value: '2' }, { value: '3' },
      { value: '4' }, { value: '5' }, { value: '6' },
      { value: '7' }, { value: '8' }, { value: '9' },
      { value: '.' }, { value: '0' }, { value: 'del', icon: 'backspace-outline' }
    ];
    
    if (paymentStatus === 'enterPin') {
      keys[9] = { value: '', disabled: true };
    }
    
    return (
      <View style={styles.numberPad}>
        {keys.map((key, index) => {
          const isPinMode = paymentStatus === 'enterPin';
          const isPinFull = isPinMode && pin.length >= PIN_LENGTH && key.value !== 'del' && key.value !== '';
          const isDisabled = key.disabled || isPinFull;
          
          return (
            <TouchableOpacity
              key={`key-${index}`}
              style={[
                styles.numberKey,
                isDisabled ? styles.disabledKey : {}
              ]}
              activeOpacity={isDisabled ? 1 : 0.7}
              onPress={() => {
                if (isDisabled) return;
                
                if (key.value === 'del') {
                  handleBackspace();
                } else if (key.value !== '') {
                  handleNumberPress(key.value.toString());
                }
              }}
              disabled={isDisabled}
            >
              {key.icon ? (
                <Ionicons name={key.icon} size={24} color={isDisabled ? "#ccc" : "#000"} />
              ) : (
                <Text style={[styles.keyText, isDisabled ? { color: '#ccc' } : {}]}>
                  {key.value}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  const renderPaymentContent = () => {
    switch(paymentStatus) {
      case 'initial':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Payment Amount</Text>
              <Text style={styles.cardSubtitle}>Enter the amount to charge</Text>
            </View>
            
            {renderConnectionStatus()}
            {renderAmountDisplay()}
            {renderNumberPad()}
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.8}
                onPress={handleClear}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!amount || parseFloat(amount) <= MIN_AMOUNT || connectionStatus !== 'connected') ? styles.disabledButton : {}
                ]}
                activeOpacity={0.8}
                onPress={handleNextPress}
                disabled={!amount || parseFloat(amount) <= MIN_AMOUNT || connectionStatus !== 'connected'}
              >
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      
      case 'ready':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Ready For Payment</Text>
              <Text style={styles.cardSubtitle}>Present RFID card to complete transaction</Text>
            </View>
            
            {renderConnectionStatus()}
            
            <View style={styles.amountSummary}>
              <Text style={styles.amountLabel}>Amount:</Text>
              <Text style={styles.summaryAmount}>{CURRENCY} {formatAmount(amount)}</Text>
            </View>
            
            <View style={styles.nfcContainer}>
              <Animated.View
                style={[
                  styles.nfcCircle,
                  {
                    opacity: nfcAnimation,
                    transform: [
                      { scale: nfcAnimation.interpolate({
                        inputRange: [0.6, 1],
                        outputRange: [0.9, 1]
                      }) }
                    ]
                  }
                ]}
              >
                <Ionicons name="card-outline" size={64} color="#FFFFFF" />
              </Animated.View>
              
              <Text style={styles.nfcInstructions}>
                Tap your RFID card on the scanner
              </Text>
              
              <View style={styles.statusBadge}>
                <View style={styles.statusIndicator}></View>
                <Text style={styles.statusText}>Waiting for card...</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => {
                // Allow immediate cancellation and navigation back if connection lost
                if (connectionStatus !== 'connected') {
                  resetPayment();
                  navigation.goBack();
                } else {
                  // Normal cancellation flow - just reset payment
                  resetPayment();
                }
              }}
            >
              <Ionicons name="close-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {connectionStatus !== 'connected' ? 'Go Back' : 'Cancel Transaction'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      
      case 'enterPin':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={[styles.cardDetectedInfo, { marginTop: 0, paddingTop: 10 }]}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="card" size={32} color="#4CAF50" />
                <View style={styles.cardCheckmark}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                </View>
              </View>
              <Text style={styles.cardDetectedText}>Card Detected</Text>
              <Text style={styles.cardTypeText}>
                UID: {scannedCard?.uid ? `${scannedCard.uid.substring(0, 8)}...` : 'Unknown'}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Enter PIN</Text>
              <Text style={styles.cardSubtitle}>Please enter your 4-digit PIN to complete payment</Text>
            </View>

            {renderConnectionStatus()}

            <View style={styles.amountSummary}>
              <Text style={styles.amountLabel}>Amount to Pay:</Text>
              <Text style={styles.summaryAmount}>{CURRENCY} {formatAmount(amount)}</Text>
            </View>
            
            {renderPinDisplay()}
            {renderNumberPad()}
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.8}
                onPress={handleClear}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Clear PIN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (pin.length !== PIN_LENGTH || connectionStatus !== 'connected') ? styles.disabledButton : {}
                ]}
                activeOpacity={0.8}
                onPress={handlePinSubmit}
                disabled={pin.length !== PIN_LENGTH || connectionStatus !== 'connected'}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={resetPayment}
            >
              <Ionicons name="close-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      
      case 'processing':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Processing Payment</Text>
              <Text style={styles.cardSubtitle}>Please wait while we complete your transaction</Text>
            </View>
            
            {renderConnectionStatus()}
            
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#ed7b0e" />
              
              <View style={styles.processingStatusContainer}>
                <Text style={styles.processingText}>
                  Verifying card and processing payment
                </Text>
                <Text style={styles.processingAmount}>
                  {CURRENCY} {formatAmount(amount)}
                </Text>
                <Text style={styles.processingSubtext}>
                  Please wait...
                </Text>
              </View>
            </View>

            {/* Add cancel button for processing state in case of connection issues */}
            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 20 }]}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  "Cancel Transaction?", 
                  "Are you sure you want to cancel this payment in progress?",
                  [
                    { text: "Continue", style: "cancel" },
                    { 
                      text: "Cancel", 
                      onPress: () => {
                        resetPayment();
                        navigation.goBack();
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="close-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      
      case 'success':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={64} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Payment Successful</Text>
              <Text style={styles.successSubtitle}>Transaction completed</Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{CURRENCY} {formatAmount(amount)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>
                  {transactionId}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card UID</Text>
                <Text style={styles.detailValue}>
                  {scannedCard?.uid ? `${scannedCard.uid.substring(0, 12)}...` : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.successTag}>APPROVED</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.newPaymentButton}
                activeOpacity={0.8}
                onPress={resetPayment}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>New Payment</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      
      case 'failed':
        return (
          <Animated.View 
            style={[
              styles.paymentCard,
              { transform: [{ scale: scaleAnimation }] }
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.failedIconCircle}>
                <Ionicons name="close" size={64} color="#FFFFFF" />
              </View>
              <Text style={styles.failedTitle}>Payment Failed</Text>
              <Text style={styles.failedSubtitle}>
                The transaction could not be completed
              </Text>
            </View>
            
            {renderConnectionStatus()}
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Attempted Amount</Text>
                <Text style={styles.detailValue}>{CURRENCY} {formatAmount(amount)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
              
              {scannedCard && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Card UID</Text>
                  <Text style={styles.detailValue}>
                    {scannedCard.uid ? `${scannedCard.uid.substring(0, 12)}...` : 'N/A'}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.failedTag}>DECLINED</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Error</Text>
                <Text style={styles.errorValue}>
                  {errorMessage || connectionError || 'Payment processing failed'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  connectionStatus !== 'connected' ? styles.disabledButton : {}
                ]}
                activeOpacity={0.8}
                onPress={resetPayment}
                disabled={connectionStatus !== 'connected'}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {connectionStatus === 'connected' ? 'Try Again' : 'Connect Scanner First'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Always show cancel button for failed payments */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => {
                resetPayment();
                navigation.goBack();
              }}
            >
              <Ionicons name="close-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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

      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Accept Payment</Text>
        <Text style={styles.screenSubtitle}>
          {paymentStatus === 'initial' ? 'Enter amount to create a new transaction' :
           paymentStatus === 'ready' ? 'Ready to accept RFID card payment' :
           paymentStatus === 'enterPin' ? 'Card detected - Enter PIN to complete payment' :
           paymentStatus === 'processing' ? 'Processing your transaction' :
           paymentStatus === 'success' ? 'Payment completed successfully' :
           'Transaction could not be completed'}
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderPaymentContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePaymentScreen;