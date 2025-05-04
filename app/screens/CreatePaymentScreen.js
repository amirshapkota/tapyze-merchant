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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/CreatePaymentScreenStyles';

const CreatePaymentScreen = () => {
  const CURRENCY = 'Rs.';
  const MIN_AMOUNT = 0;
  const MAX_TRANSACTION_TIMEOUT = 30000; // 30 seconds timeout for transactions
  
  const navigation = useNavigation();
  const nfcAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial'); // 'initial', 'ready', 'processing', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processingTimeout, setProcessingTimeout] = useState(null);
  
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
    };
  }, []);
  
  const handleGoBack = () => {
    if (paymentStatus === 'processing') {
      // confirmation dialog
      return;
    }
    
    // Animate out before navigating back
    Animated.timing(scaleAnimation, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      navigation.goBack();
    });
  };
  
  // amount handlers
  const handleNumberPress = (number) => {
    // If amount already has two decimal places, don't add more digits
    if (amount.includes('.') && amount.split('.')[1].length >= 2) {
      return;
    }
    
    // Maximum amount validation (for demo purpose)
    if (!amount.includes('.') && amount.length >= 6) {
      return; // Limit to 999,999
    }
    
    // If we're adding a number and the current value is just 0, replace it
    if (amount === '0' && number !== '.') {
      setAmount(number);
      return;
    }
    
    // If we're trying to add a decimal point but there's already one, do nothing
    if (number === '.' && amount.includes('.')) {
      return;
    }
    
    // If we're adding a decimal point to an empty field, add "0." instead
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
    if (amount.length > 0) {
      setAmount(amount.slice(0, -1));
    }
  };
  
  const handleClear = () => {
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
    
    // Clear any error messages
    setErrorMessage('');
    
    // Transition to ready state
    setPaymentStatus('ready');
    
    // Start the NFC reader animation
    startNfcAnimation();
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
  
  // Process payment - in production, this would connect to NFC hardware
  const processPayment = () => {
    // Transition to processing state
    setPaymentStatus('processing');
    
    // Stop animation
    nfcAnimation.stopAnimation();
    
    // In production: Initialize NFC reader and process payment here
    // For demo: Simulate processing with timeout
    const timeout = setTimeout(() => {
      // Generate transaction ID
      const txId = generateTransactionId();
      setTransactionId(txId);
      
      // Simulate 70% success rate
      const isSuccess = Math.random() > 0.3;
      
      // Update payment status
      setPaymentStatus(isSuccess ? 'success' : 'failed');
      
    }, 3000); // Simulated processing time
    
    setProcessingTimeout(timeout);
  };
  
  const generateTransactionId = () => {
    // Format: TXN-YYYYMMDD-XXXXX
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    return `TXN-${datePart}-${randomPart}`;
  };
  
  const resetPayment = () => {
    // Stop animations
    nfcAnimation.stopAnimation();
    nfcAnimation.setValue(1);
    
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
  
  const renderNumberPad = () => {
    // Keypad layout with positions
    const keys = [
      { value: '1' }, { value: '2' }, { value: '3' },
      { value: '4' }, { value: '5' }, { value: '6' },
      { value: '7' }, { value: '8' }, { value: '9' },
      { value: '.' }, { value: '0' }, { value: 'del', icon: 'backspace-outline' }
    ];
    
    return (
      <View style={styles.numberPad}>
        {keys.map((key, index) => (
          <TouchableOpacity
            key={`key-${index}`}
            style={styles.numberKey}
            activeOpacity={0.7}
            onPress={() => {
              if (key.value === 'del') {
                handleBackspace();
              } else {
                handleNumberPress(key.value.toString());
              }
            }}
          >
            {key.icon ? (
              <Ionicons name={key.icon} size={24} color="#000" />
            ) : (
              <Text style={styles.keyText}>{key.value}</Text>
            )}
          </TouchableOpacity>
        ))}
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
              <Text style={styles.cardSubtitle}>Present card or device to complete transaction</Text>
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
                Hold card or device near the NFC reader
              </Text>
              
              <View style={styles.statusBadge}>
                <View style={styles.statusIndicator}></View>
                <Text style={styles.statusText}>Ready</Text>
              </View>
            </View>
            
            {/* DEVELOPMENT ONLY - Remove in production */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.devButton}
                activeOpacity={0.7}
                onPress={processPayment}
              >
                <Text style={styles.devButtonText}>
                  [DEV] Simulate Payment Process
                </Text>
              </TouchableOpacity>
            )}
            
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
                  Transaction in progress
                </Text>
                <Text style={styles.processingAmount}>
                  {CURRENCY} {formatAmount(amount)}
                </Text>
                <Text style={styles.processingSubtext}>
                  Keep card or device near the reader
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
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>TAPYZE Card</Text>
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
            
            <TouchableOpacity
              style={styles.homeButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Ionicons name="home-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
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
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>
                  {transactionId || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.failedTag}>DECLINED</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Error</Text>
                <Text style={styles.errorValue}>Card Read Error</Text>
              </View>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => setPaymentStatus('ready')}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Retry Payment</Text>
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
           paymentStatus === 'ready' ? 'Ready to accept contactless payment' :
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