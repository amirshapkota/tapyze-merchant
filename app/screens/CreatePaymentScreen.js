import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/CreatePaymentScreenStyles';

const CreatePaymentScreen = () => {
  // Get the navigation object
  const navigation = useNavigation();
  
  // State for payment
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial'); // 'initial', 'ready', 'processing', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation value for blinking effect
  const blinkAnim = useRef(new Animated.Value(1)).current;
  
  // Navigate back to scanner screen
  const navigateToScanner = () => {
    navigation.navigate('Scanner');
  };
  
  // Handle amount input
  const handleAmountChange = (text) => {
    // Only allow numbers and a single decimal point
    const filteredText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (filteredText.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }
    
    // Limit to two decimal places
    const parts = filteredText.split('.');
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(filteredText);
  };
  
  // Handle next button press
  const handleNextPress = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    setErrorMessage('');
    setPaymentStatus('ready');
    
    // Start the blinking animation
    startBlinkAnimation();
    
    // In production, this would connect to the actual NFC scanner
    // and prepare it to accept payment for the specified amount
  };
  
  // Blinking animation for tap circle
  const startBlinkAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  };
  
  // Simulate card tap
  const simulateCardTap = () => {
    setPaymentStatus('processing');
    
    // Simulate processing time
    setTimeout(() => {
      // Randomly succeed or fail for demonstration
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
    }, 2000);
  };
  
  // Reset payment process
  const resetPayment = () => {
    // Stop animation
    blinkAnim.stopAnimation();
    blinkAnim.setValue(1);
    
    setPaymentStatus('initial');
    setAmount('');
    setErrorMessage('');
  };
  
  // Render different content based on payment status
  const renderPaymentContent = () => {
    switch(paymentStatus) {
      case 'initial':
        return (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Enter Payment Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <TouchableOpacity 
              style={[styles.nextButton, (!amount || parseFloat(amount) <= 0) ? styles.buttonDisabled : {}]}
              onPress={handleNextPress}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );
      
      case 'ready':
        return (
          <View style={styles.tapContainer}>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountDisplayLabel}>Amount:</Text>
              <Text style={styles.amountDisplayValue}>${parseFloat(amount).toFixed(2)}</Text>
            </View>
            
            <View style={styles.tapIconContainer}>
              <Animated.View 
                style={[
                  styles.tapCircle,
                  { opacity: blinkAnim } // Apply the blinking animation
                ]}
              >
                <Ionicons name="card-outline" size={60} color="#FFF" />
              </Animated.View>
              <Text style={styles.tapInstructions}>Ready for Tap</Text>
              <Text style={styles.tapSubtext}>Tap card or device to reader</Text>
            </View>
            
            {/* This button is for simulation only - would not exist in production */}
            <TouchableOpacity 
              style={styles.simulateTapButton}
              onPress={simulateCardTap}
            >
              <Text style={styles.simulateTapText}>Simulate Card Tap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={resetPayment}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'processing':
        return (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#ed7b0e" />
            <Text style={styles.processingText}>Processing Payment...</Text>
            <Text style={styles.processingSubtext}>Please keep card near reader</Text>
          </View>
        );
      
      case 'success':
        return (
          <View style={styles.resultContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successText}>Payment Received</Text>
            <Text style={styles.successAmount}>${parseFloat(amount).toFixed(2)}</Text>
            <Text style={styles.successTransactionId}>Transaction ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
            
            <TouchableOpacity 
              style={styles.newPaymentButton}
              onPress={resetPayment}
            >
              <Text style={styles.newPaymentText}>New Payment</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'failed':
        return (
          <View style={styles.resultContainer}>
            <View style={styles.failedIcon}>
              <Ionicons name="close-circle" size={80} color="#FF3B30" />
            </View>
            <Text style={styles.failedText}>Payment Failed</Text>
            <Text style={styles.failedSubtext}>Please try again or use a different payment method</Text>
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setPaymentStatus('ready')}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.newPaymentButton}
              onPress={resetPayment}
            >
              <Text style={styles.newPaymentText}>New Payment</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
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
          onPress={navigateToScanner}
        >
          <Ionicons name="arrow-back" size={30} color="#ed7b0e" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Accept Payment</Text>
        <Text style={styles.screenSubtitle}>
          {paymentStatus === 'initial' ? 'Enter amount to create a new payment' :
           paymentStatus === 'ready' ? 'Ready to accept payment' :
           paymentStatus === 'processing' ? 'Processing transaction' :
           paymentStatus === 'success' ? 'Payment successful' :
           'Payment failed'}
        </Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderPaymentContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePaymentScreen;

// PRODUCTION CODE COMMENTS:
// 1. For actual NFC integration, use the appropriate NFC library for React Native
//    (e.g., react-native-nfc-manager) to communicate with the physical NFC reader.
// 2. Replace the simulation logic with actual NFC payment processing:
//    - Initialize the NFC reader when the amount is confirmed
//    - Set up proper error handling for connectivity issues
//    - Implement secure transaction processing with your payment processor
//    - Add proper receipt generation and transaction recording
// 3. Add proper validation for payment amounts based on business rules
// 4. Implement proper error handling for payment declines, timeouts, etc.
// 5. Add analytics to track transaction success/failure rates
// 6. Implement proper security measures for handling payment data
// 7. Add accessibility features for all UI elements