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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Import services
import paymentService from '../services/merchantPaymentService';

import styles from '../styles/CreatePaymentScreenStyles';

// BLE Service and Characteristic UUIDs (must match ESP32)
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const RFID_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';
const STATUS_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';
const CONFIG_CHAR_UUID = '12345678-1234-1234-1234-123456789abf';
const CONTROL_CHAR_UUID = '12345678-1234-1234-1234-123456789ac0';

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

  // BLE states
  const [manager, setManager] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);

  // Get constants from service
  const CURRENCY = paymentService.getCurrency();
  const MIN_AMOUNT = paymentService.getMinAmount();
  const PIN_LENGTH = paymentService.getPinLength();

  // Initialize BLE and check for existing connection
  useEffect(() => {
    const initializeBLE = async () => {
      try {
        if (!Device.isDevice) {
          setErrorMessage('Physical device required for BLE functionality');
          return;
        }

        const { BleManager } = await import('react-native-ble-plx');
        if (!BleManager) {
          setErrorMessage('BLE Manager not available - development build required');
          return;
        }

        const bleManager = new BleManager();
        setManager(bleManager);

        const savedDeviceId = await AsyncStorage.getItem('savedScannerDeviceId');
        if (savedDeviceId) {
          try {
            // First check if device is already connected
            const connectedDevices = await bleManager.connectedDevices([SERVICE_UUID]);
            let device = connectedDevices.find(d => d.id === savedDeviceId);
            
            if (!device) {
              // If not connected, try to connect
              console.log('Connecting to saved device for payments:', savedDeviceId);
              device = await bleManager.connectToDevice(savedDeviceId);
            } else {
              console.log('Device already connected for payments:', savedDeviceId);
            }
            
            // IMPORTANT: Request larger MTU for proper data transfer (like scanner screen)
            try {
              await device.requestMTU(512);
              console.log('MTU requested: 512 for payments');
            } catch (mtuError) {
              console.log('MTU request failed, using default:', mtuError.message);
            }
            
            // Ensure services and characteristics are discovered
            await device.discoverAllServicesAndCharacteristics();
            
            // Test the connection by trying to read a characteristic
            try {
              await device.readCharacteristicForService(SERVICE_UUID, STATUS_CHAR_UUID);
              console.log('BLE connection verified for payments');
            } catch (readError) {
              console.log('BLE characteristic read failed, reconnecting...');
              // Try to reconnect if read fails
              device = await bleManager.connectToDevice(savedDeviceId);
              
              // Request MTU again after reconnection
              try {
                await device.requestMTU(512);
                console.log('MTU requested: 512 after reconnection');
              } catch (mtuError2) {
                console.log('MTU request failed after reconnection:', mtuError2.message);
              }
              
              await device.discoverAllServicesAndCharacteristics();
            }
            
            setConnectedDevice(device);
            console.log('Connected to saved BLE device for payments');
          } catch (error) {
            console.error('Failed to connect to saved device:', error);
            setErrorMessage('Scanner not connected. Please go back and connect scanner first.');
          }
        } else {
          setErrorMessage('No scanner connected. Please connect scanner first.');
        }
      } catch (error) {
        console.error('BLE initialization error:', error);
        setErrorMessage('BLE not available - development build required');
      }
    };

    initializeBLE();
  }, []);
  
  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
      if (rfidPollingInterval) {
        clearInterval(rfidPollingInterval);
      }
    };
  }, []);
  
  const handleGoBack = () => {
    if (rfidPollingInterval) {
      clearInterval(rfidPollingInterval);
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
    
    if (!connectedDevice) {
      setErrorMessage('Scanner not connected. Please go back and connect scanner first.');
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

  const startRFIDPolling = () => {
    console.log('Starting BLE RFID polling for payment...');
    
    if (!connectedDevice) {
      setErrorMessage('Cannot connect to scanner. Please check scanner connection.');
      setPaymentStatus('failed');
      return;
    }
    
    let lastProcessedUID = "";
    let lastReceivedTimestamp = 0;
    let rfidBuffer = '';
    
    try {
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        RFID_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('RFID monitoring error:', error);
            if (error.errorCode === 6) {
              setErrorMessage('Scanner connection lost. Please check the scanner and try again.');
              setPaymentStatus('failed');
            }
            return;
          }
          
          if (characteristic?.value) {
            try {
              const rawData = atob(characteristic.value);
              console.log('Raw RFID data received:', rawData);
              
              if (!rawData || rawData.trim() === '') {
                console.log('Empty RFID data received, skipping...');
                return;
              }
              
              // Add to buffer
              rfidBuffer += rawData;
              console.log('Current buffer:', rfidBuffer);
              
              // Try to parse the buffer
              try {
                const data = JSON.parse(rfidBuffer);
                console.log('Parsed RFID data:', data);
                
                if (data.uid && data.uid.length > 0) {
                  // Check if it's new data
                  const currentTime = Date.now();
                  const isNewUID = data.uid !== lastProcessedUID;
                  const isNewTimestamp = !data.timestamp || data.timestamp !== lastReceivedTimestamp;
                  
                  // If no timestamp in data, use current time and check if enough time passed
                  const timeSinceLastScan = currentTime - (lastReceivedTimestamp || 0);
                  const isNewScan = isNewUID || timeSinceLastScan > 2000; // 2 second minimum between scans
                  
                  if (isNewScan) {
                    console.log('RFID card detected for payment:', data.uid, 'Time since last:', timeSinceLastScan);
                    
                    // Update tracking variables
                    lastProcessedUID = data.uid;
                    lastReceivedTimestamp = data.timestamp || currentTime;
                    
                    // Handle card detection
                    handleCardDetected(data.uid);
                  } else {
                    console.log('Ignoring old/duplicate card data:', data.uid);
                  }
                }
                rfidBuffer = ''; // Clear buffer on successful parse
              } catch (parseError) {
                console.log('JSON parse failed, keeping in buffer. Error:', parseError.message);
                
                // Check if buffer is getting too long (prevent infinite buffering)
                if (rfidBuffer.length > 200) {
                  console.log('Buffer too long, clearing:', rfidBuffer);
                  rfidBuffer = '';
                }
                
                // Check if we have a UID but incomplete JSON - try to construct valid JSON
                if (rfidBuffer.includes('"uid":"') && !rfidBuffer.includes('}')) {
                  const uidMatch = rfidBuffer.match(/"uid":"([^"]+)"/);
                  if (uidMatch) {
                    const uid = uidMatch[1];
                    console.log('Extracted UID from incomplete data:', uid);
                    
                    // Check if it's new
                    const currentTime = Date.now();
                    const timeSinceLastScan = currentTime - (lastReceivedTimestamp || 0);
                    const isNewScan = uid !== lastProcessedUID || timeSinceLastScan > 2000;
                    
                    if (isNewScan) {
                      console.log('Processing extracted UID:', uid);
                      lastProcessedUID = uid;
                      lastReceivedTimestamp = currentTime;
                      handleCardDetected(uid);
                      rfidBuffer = ''; // Clear buffer
                    } else {
                      console.log('Ignoring duplicate extracted UID:', uid);
                      rfidBuffer = ''; // Clear buffer anyway
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error processing RFID data:', error);
              rfidBuffer = ''; // Reset buffer on error
            }
          }
        }
      );
      
      setRfidPollingInterval(true);
      
    } catch (error) {
      console.error('Error starting BLE RFID monitoring:', error);
      setErrorMessage('Failed to start card monitoring. Please try again.');
      setPaymentStatus('failed');
    }
    
    setTimeout(() => {
      if (rfidPollingInterval) {
        console.log('BLE RFID polling timeout - stopping');
        setRfidPollingInterval(null);
        if (paymentStatus === 'ready') {
          setErrorMessage('No card detected within 60 seconds. Please try again.');
          setPaymentStatus('failed');
        }
      }
    }, 60000);
  };
  
  const handleCardDetected = async (cardUid) => {
    try {
      console.log('Processing detected card:', cardUid);
      
      nfcAnimation.stopAnimation();
      setRfidPollingInterval(null);
      
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
          console.log('✅ Invalid PIN detected - staying on PIN entry page');
          if (result.data && result.data.remainingAttempts !== undefined) {
            setPinAttempts(3 - result.data.remainingAttempts);
            setMaxAttempts(3);
            setPinError(result.message);
          } else {
            setPinError('Invalid PIN. Please try again.');
          }
          setPin(''); // Clear PIN for retry
          
          // Make sure we don't call resetPayment or any other state reset
          console.log('About to set status to enterPin...');
          setPaymentStatus('enterPin'); // Explicitly set back to enterPin
          console.log('Status set back to enterPin, PIN cleared');
          
          // Don't call any other functions that might reset state
          return; // Exit early to prevent any other processing
        } else {
          console.log('Other error type - going to failed state');
          // For all other failures, use the general failure handler
          handlePaymentFailure(result);
        }
      }
      
    } catch (error) {
      console.error('Payment processing error in catch block:', error);
      console.log('Error message:', error.message);
      console.log('Checking if error contains "invalid pin"...');
      
      // Check if the error is specifically about invalid PIN
      if (error.message && error.message.toLowerCase().includes('invalid pin')) {
        console.log('✅ Caught invalid PIN error - staying on PIN entry page');
        console.log('Setting PIN error and clearing PIN field');
        setPinError('Invalid PIN. Please try again.');
        setPin(''); // Clear PIN for retry
        setPaymentStatus('enterPin'); // Stay on PIN entry page
        console.log('Status set back to enterPin');
      } else {
        console.log('❌ Other error detected - going to failed state');
        // For other errors, go to failed state
        setErrorMessage('An unexpected error occurred. Please try again.');
        setPaymentStatus('failed');
      }
    }
  };
  
  const handlePaymentFailure = (result) => {
    switch (result.type) {
      case 'INVALID_PIN':
        // Stay on PIN entry page for invalid PIN - don't go to failed state
        if (result.data && result.data.remainingAttempts !== undefined) {
          setPinAttempts(3 - result.data.remainingAttempts);
          setMaxAttempts(3);
          setPinError(result.message);
          setPin(''); // Clear PIN for retry
          // Keep paymentStatus as 'enterPin' - don't change to 'failed'
        } else {
          setPinError('Invalid PIN. Please try again.');
          setPin(''); // Clear PIN for retry
          // Keep paymentStatus as 'enterPin' - don't change to 'failed'
        }
        break;
        
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
                  (!amount || parseFloat(amount) <= MIN_AMOUNT) ? styles.disabledButton : {}
                ]}
                activeOpacity={0.8}
                onPress={handleNextPress}
                disabled={!amount || parseFloat(amount) <= MIN_AMOUNT}
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
              onPress={resetPayment}
            >
              <Ionicons name="close-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel Transaction</Text>
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
                  (pin.length !== PIN_LENGTH) ? styles.disabledButton : {}
                ]}
                activeOpacity={0.8}
                onPress={handlePinSubmit}
                disabled={pin.length !== PIN_LENGTH}
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
                <Text style={styles.errorValue}>{errorMessage || 'Payment processing failed'}</Text>
              </View>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={resetPayment}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
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