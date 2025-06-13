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
import merchantAuthService from '../services/merchantAuthService';

import styles from '../styles/CreatePaymentScreenStyles';

const CreatePaymentScreen = () => {
  const CURRENCY = 'Rs.';
  const MIN_AMOUNT = 0;
  const MAX_TRANSACTION_TIMEOUT = 30000; // 30 seconds timeout for transactions
  const PIN_LENGTH = 4; // Standard PIN length
  
  const navigation = useNavigation();
  const route = useRoute();
  const nfcAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial'); // 'initial', 'ready', 'enterPin', 'processing', 'success', 'failed'
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
  const [currentScannerIP, setCurrentScannerIP] = useState('192.168.4.1');

  // Load scanner IP from AsyncStorage
  useEffect(() => {
    const loadScannerIP = async () => {
      try {
        const storedIP = await AsyncStorage.getItem('scannerIP');
        if (storedIP) {
          console.log('Payment screen loaded scanner IP from storage:', storedIP);
          setCurrentScannerIP(storedIP);
        } else {
          console.log('No scanner IP found in storage, using default');
          setCurrentScannerIP('192.168.4.1');
        }
      } catch (error) {
        console.error('Failed to load scanner IP from AsyncStorage:', error);
        setCurrentScannerIP('192.168.4.1');
      }
    };
    
    loadScannerIP();
  }, []);
  
  useEffect(() => {
    // Animate card scaling on mount
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Clean up any timeouts on unmount
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
    // Stop RFID polling when leaving screen
    if (rfidPollingInterval) {
      clearInterval(rfidPollingInterval);
      setRfidPollingInterval(null);
    }

    // Prevent immediate navigation if a transaction is in progress
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
  
  // Amount handlers
  const handleNumberPress = (number) => {
  // If in PIN entry mode, handle PIN input
  if (paymentStatus === 'enterPin') {
    // Strict PIN length validation - prevent any input beyond PIN_LENGTH
    if (pin.length >= PIN_LENGTH) {
      console.log('PIN already at maximum length, ignoring input');
      return; // Don't add any more digits
    }
    
    // Only allow numeric input for PIN
    if (!/^\d$/.test(number)) {
      console.log('Non-numeric input for PIN, ignoring:', number);
      return;
    }
    
    const newPin = pin + number;
    console.log('PIN input - Current:', pin, 'Adding:', number, 'New:', newPin, 'Length:', newPin.length);
    
    setPin(newPin);
    setPinError(''); // Clear any previous PIN errors
    return;
  }
  
  // Handle amount input (existing logic)
  if (amount.includes('.') && amount.split('.')[1].length >= 2) {
    return;
  }
  
  if (!amount.includes('.') && amount.length >= 6) {
    return; // Limit to 999,999
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
    if (!value || value === '') return '0.00';
    const numValue = parseFloat(value);
    return numValue.toFixed(2);
  };
  
  const handleNextPress = () => {
    // Amount validation
    if (!amount || parseFloat(amount) <= MIN_AMOUNT) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    // Scanner IP validation
    if (!currentScannerIP) {
      setErrorMessage('Scanner IP not available. Please go back and reconnect scanner.');
      return;
    }
    
    console.log('Payment setup - Amount:', amount, 'Scanner IP:', currentScannerIP);
    
    // Clear any error messages
    setErrorMessage('');
    
    // Transition to ready state
    setPaymentStatus('ready');
    
    // Start the NFC reader animation
    startNfcAnimation();
    
    // Start RFID polling
    startRFIDPolling();
  };
  
  const startNfcAnimation = () => {
    // Create pulsing effect for NFC reader
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

  // Start RFID polling for card detection
  const startRFIDPolling = () => {
    console.log('Starting RFID polling for payment at IP:', currentScannerIP);
    
    // First test the scanner connection
    fetch(`http://${currentScannerIP}/status`, { timeout: 3000 })
      .then(response => response.json())
      .then(data => {
        console.log('Scanner status check successful:', data);
      })
      .catch(error => {
        console.error('Scanner status check failed:', error);
        setErrorMessage('Cannot connect to scanner. Please check scanner connection.');
        setPaymentStatus('failed');
        return;
      });
    
    let lastProcessedUID = "";
    let lastReceivedTimestamp = 0;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://${currentScannerIP}/read-rfid`, {
          method: 'GET',
          timeout: 3000
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Only process if:
          // 1. We have a valid UID
          // 2. The UID is different from the last one OR the timestamp has changed (indicating a new detection)
          if (data.uid && data.uid.length > 0) {
            const isNewUID = data.uid !== lastProcessedUID;
            const isNewTimestamp = data.timestamp !== lastReceivedTimestamp && data.timestamp > 0;
            
            if (isNewUID || isNewTimestamp) {
              console.log('🎉 RFID card detected for payment:', data.uid, 'Timestamp:', data.timestamp);
              
              // Update our tracking variables
              lastProcessedUID = data.uid;
              lastReceivedTimestamp = data.timestamp;
              
              // Stop polling once card is detected
              clearInterval(interval);
              setRfidPollingInterval(null);
              
              // Handle card detection
              await handleCardDetected(data.uid);
            } else {
              // Same UID and timestamp - this is the old detection
              console.log('Ignoring old card data:', data.uid, 'Timestamp:', data.timestamp);
            }
          }
        } else {
          console.log('RFID polling response not ok:', response.status);
        }
      } catch (error) {
        console.error('RFID polling error:', error.message);
        
        // If we can't reach the scanner, show error
        if (error.message.includes('Network request failed') || error.message.includes('timeout')) {
          console.log('Scanner connection lost, stopping polling');
          clearInterval(interval);
          setRfidPollingInterval(null);
          setErrorMessage('Scanner connection lost. Please check the scanner and try again.');
          setPaymentStatus('failed');
        }
      }
    }, 1000); // Poll every second
    
    setRfidPollingInterval(interval);
    
    // Add timeout to stop polling after 60 seconds
    setTimeout(() => {
      if (interval) {
        console.log('RFID polling timeout - stopping');
        clearInterval(interval);
        setRfidPollingInterval(null);
        if (paymentStatus === 'ready') {
          setErrorMessage('No card detected within 60 seconds. Please try again.');
          setPaymentStatus('failed');
        }
      }
    }, 60000);
  };
  
  // Handle real card detection from RFID
  const handleCardDetected = async (cardUid) => {
    try {
      console.log('Processing detected card:', cardUid);
      
      // Stop NFC animation
      nfcAnimation.stopAnimation();
      
      // Verify card exists and get basic info (without PIN verification)
      const response = await merchantAuthService.apiCall(`/payments/rfid/verify/${cardUid}`, {
        method: 'GET'
      });
      
      if (response.status === 'success') {
        // Store card info
        setScannedCard({
          uid: cardUid,
          status: response.data.cardStatus,
          expiryDate: response.data.expiryDate,
          lastUsed: response.data.lastUsed
        });
        
        // Transition to PIN entry state
        setPaymentStatus('enterPin');
        setPin('');
        setPinError('');
        setPinAttempts(0);
        
      } else {
        // Card verification failed
        setErrorMessage(response.message || 'Invalid card detected');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Card verification error:', error);
      setErrorMessage('Failed to verify card. Please try again.');
      setPaymentStatus('failed');
    }
  };
  
  // Handle PIN submission
  const handlePinSubmit = async () => {
  console.log('=== PIN SUBMISSION ===');
  console.log('Current PIN:', pin);
  console.log('PIN Length:', pin.length);
  console.log('Expected Length:', PIN_LENGTH);
  
  // Validate PIN length
  if (pin.length !== PIN_LENGTH) {
    const errorMsg = `Please enter ${PIN_LENGTH} digit PIN`;
    console.log('PIN length validation failed:', errorMsg);
    setPinError(errorMsg);
    return;
  }
  
  // Validate PIN contains only digits
  if (!/^\d+$/.test(pin)) {
    const errorMsg = 'PIN must contain only numbers';
    console.log('PIN format validation failed:', errorMsg);
    setPinError(errorMsg);
    return;
  }
  
  // Validate scanned card exists
  if (!scannedCard || !scannedCard.uid) {
    const errorMsg = 'No card detected. Please try again.';
    console.log('Card validation failed:', errorMsg);
    setPinError(errorMsg);
    return;
  }
  
  console.log('PIN validation passed, processing payment...');
  
  // Clear any previous errors
  setPinError('');
  
  // Process payment with PIN verification
  await processPayment();
};
  
  // Process payment with backend integration
  const processPayment = async () => {
  try {
    setPaymentStatus('processing');
    
    console.log('=== PAYMENT PROCESSING ===');
    
    // Final validation before API call
    if (!scannedCard?.uid) {
      throw new Error('No card detected');
    }
    
    if (!pin || pin.length !== PIN_LENGTH) {
      throw new Error(`Invalid PIN length: ${pin.length}, expected: ${PIN_LENGTH}`);
    }
    
    if (!/^\d+$/.test(pin)) {
      throw new Error('PIN contains invalid characters');
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    // Prepare clean payload
    const payloadData = {
      cardUid: scannedCard.uid.trim(),
      pin: pin.trim(), // Ensure PIN is clean string
      amount: parseFloat(amount),
      description: `Payment at merchant - ${new Date().toLocaleString()}`
    };
    
    console.log('Payload validation:');
    console.log('- cardUid:', payloadData.cardUid, 'length:', payloadData.cardUid.length);
    console.log('- pin:', payloadData.pin, 'length:', payloadData.pin.length, 'isNumeric:', /^\d+$/.test(payloadData.pin));
    console.log('- amount:', payloadData.amount, 'type:', typeof payloadData.amount);
    
    const response = await merchantAuthService.apiCall('/payments/rfid/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadData)
    });
    
    console.log('Payment API response:', response);
    
    if (response.status === 'success') {
      console.log('Payment successful');
      
      setTransactionId(response.data.transactionReference || `TXN${Date.now()}`);
      setCustomerInfo({
        newBalance: response.data.customerBalance,
        merchantBalance: response.data.merchantBalance
      });
      
      setPaymentStatus('success');
    } else {
      console.log('Payment failed:', response.message);
      handlePaymentFailure(response);
    }
    
  } catch (error) {
    console.error('Payment processing error:', error);
    handlePaymentError(error);
  }
};
  
  const resetPayment = () => {
    // Stop animations
    nfcAnimation.stopAnimation();
    nfcAnimation.setValue(1);
    
    // Stop RFID polling
    if (rfidPollingInterval) {
      clearInterval(rfidPollingInterval);
      setRfidPollingInterval(null);
    }
    
    // Clear timeout if exists
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
    
    // Reset state
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
  
  // For PIN entry, disable decimal point and limit input
  if (paymentStatus === 'enterPin') {
    keys[9] = { value: '', disabled: true }; // Disable decimal point
  }
  
  return (
    <View style={styles.numberPad}>
      {keys.map((key, index) => {
        // Additional validation for PIN mode
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
  
  // Render different content based on payment status
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
              
              {customerInfo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer Balance</Text>
                  <Text style={styles.detailValue}>{CURRENCY} {customerInfo.newBalance?.toFixed(2)}</Text>
                </View>
              )}
              
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
      
      {/* Main Content */}
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