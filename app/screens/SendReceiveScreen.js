import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/MerchantAuthContext';
import walletService from '../services/merchantWalletService';
import styles from '../styles/SendReceiveScreenStyles';

const SendReceiveScreen = ({ navigation }) => {
//   const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'receive'
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [sendType, setSendType] = useState('user'); // 'user' or 'business'
  
  // Quick amount options
  const quickAmounts = [500, 1000, 2000, 5000];

  useEffect(() => {
    loadUserBalance();
  }, []);

  // Load user's current balance
  const loadUserBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  // Format the amount with commas
  const formatAmount = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Handle amount input
  const handleAmountChange = (text) => {
    const formattedAmount = formatAmount(text);
    setAmount(formattedAmount);
  };
  
  // Handle quick amount selection
  const handleQuickAmount = (value) => {
    setAmount(formatAmount(value.toString()));
  };

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+977-9[0-9]{9}$|^9[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate send transaction
  const validateSendTransaction = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    if (!amount || isNaN(numericAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (numericAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return false;
    }
    
    if (numericAmount < 10) {
      Alert.alert('Error', 'Minimum transfer amount is Rs. 10');
      return false;
    }
    
    if (numericAmount > userBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return false;
    }

    if (!recipientPhone) {
      Alert.alert('Error', 'Please enter recipient phone number');
      return false;
    }

    if (!validatePhoneNumber(recipientPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number (+977-9XXXXXXXXX or 9XXXXXXXXX)');
      return false;
    }
    
    return true;
  };

  // Handle send money
  const handleSendMoney = async () => {
    if (!validateSendTransaction()) return;

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    Alert.alert(
      'Confirm Payment',
      `Send Rs. ${amount} to ${recipientName || recipientPhone}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await walletService.sendMoney({
                amount: numericAmount,
                recipientPhone,
                note,
                sendType
              });
              
              if (result.success) {
                Alert.alert(
                  'Payment Sent!',
                  `Rs. ${amount} has been sent successfully to ${recipientName || recipientPhone}!\n\nTransaction ID: ${result.transactionId}\nNew Balance: Rs. ${result.balance.toFixed(2)}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Reset form
                        setAmount('');
                        setRecipientPhone('');
                        setRecipientName('');
                        setNote('');
                        loadUserBalance();
                        
                        // Navigate back to dashboard
                        navigation.navigate('DashboardMain');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Payment Failed', result.message);
              }
            } catch (error) {
              console.error('Send money error:', error);
              Alert.alert('Error', 'Failed to send payment. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle QR scanner for sending money
  const handleScanQR = () => {
    setScannerModalVisible(true);
    // In a real app, this would open camera scanner
    setTimeout(() => {
      setScannerModalVisible(false);
      // Mock scanned data
      Alert.alert('QR Scanned', 'Payment request detected!\nAmount: Rs. 500\nFrom: John Doe');
    }, 2000);
  };

  // Handle QR code generation for receiving money
  const generateQRData = () => {
    return JSON.stringify({
      type: 'tapyze_payment',
      userId: user?.id,
      userName: user?.fullName,
      userPhone: user?.phone,
      timestamp: Date.now()
    });
  };

  const renderSendTab = () => (
    <View style={styles.tabContent}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet-outline" size={24} color="#ed7b0e" />
          <Text style={styles.balanceLabel}>Available Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>Rs. {userBalance.toLocaleString()}</Text>
      </View>

      {/* Send Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send To</Text>
        <View style={styles.sendTypeContainer}>
          <TouchableOpacity 
            style={[styles.sendTypeButton, sendType === 'user' && styles.activeSendType]}
            onPress={() => setSendType('user')}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={sendType === 'user' ? '#FFFFFF' : '#666'} 
            />
            <Text style={[styles.sendTypeText, sendType === 'user' && styles.activeSendTypeText]}>
               Person
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendTypeButton, sendType === 'business' && styles.activeSendType]}
            onPress={() => setSendType('business')}
          >
            <Ionicons 
              name="business" 
              size={20} 
              color={sendType === 'business' ? '#FFFFFF' : '#666'} 
            />
            <Text style={[styles.sendTypeText, sendType === 'business' && styles.activeSendTypeText]}>
              Business
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>Rs.</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#CCCCCC"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.quickAmountContainer}>
          {quickAmounts.map((value) => (
            <TouchableOpacity 
              key={value} 
              style={[
                styles.quickAmountButton,
                amount === formatAmount(value.toString()) && styles.selectedQuickAmount,
                value > userBalance && styles.disabledQuickAmount
              ]}
              onPress={() => handleQuickAmount(value)}
              disabled={isLoading || value > userBalance}
            >
              <Text style={[
                styles.quickAmountText,
                amount === formatAmount(value.toString()) && styles.selectedQuickAmountText,
                value > userBalance && styles.disabledQuickAmountText
              ]}>
                {value >= 1000 ? `${value/1000}K` : value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recipient Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {sendType === 'user' ? 'Send to' : 'Pay to'}
        </Text>
        <View style={styles.recipientInputContainer}>
          <Ionicons 
            name={sendType === 'user' ? 'person' : 'business'} 
            size={20} 
            color="#666" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.recipientInput}
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            placeholder={sendType === 'user' ? 'Phone number' : 'Business phone'}
            placeholderTextColor="#CCCCCC"
            keyboardType="phone-pad"
            editable={!isLoading}
          />
          <TouchableOpacity 
            onPress={handleScanQR}
            style={styles.scanButton}
            disabled={isLoading}
          >
            <Ionicons name="qr-code" size={20} color="#ed7b0e" />
          </TouchableOpacity>
        </View>

        {recipientName ? (
          <View style={styles.recipientInfo}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <Text style={styles.recipientNameText}>
              {recipientName} {sendType === 'business' ? '(Business)' : ''}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Note Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Note (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder={sendType === 'user' ? "What's this for?" : "Order details"}
          placeholderTextColor="#999999"
          multiline
          editable={!isLoading}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity 
        style={[
          styles.sendButton,
          (!amount || !recipientPhone || isLoading) && styles.disabledButton
        ]}
        disabled={!amount || !recipientPhone || isLoading}
        onPress={handleSendMoney}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.sendButtonText, { marginLeft: 10 }]}>
              Processing...
            </Text>
          </View>
        ) : (
          <>
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>
              Send Rs. {amount || '0'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderReceiveTab = () => (
    <View style={styles.tabContent}>
      {/* QR Code Card */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Your Payment QR</Text>
        <Text style={styles.qrSubtitle}>
          Show this code to receive instant payments
        </Text>
        
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={generateQRData()}
            size={180}
            color="#000000"
            backgroundColor="#FFFFFF"
            logo={require('../assets/logo.png')}
            logoSize={36}
            logoBackgroundColor="transparent"
            logoMargin={2}
            logoBorderRadius={8}
            enableLinearGradient={false}
          />
        </View>
        
        <View style={styles.userInfoCard}>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={styles.userIdContainer}>
            <Ionicons name="at" size={14} color="#ed7b0e" />
            <Text style={styles.userId}>{user?.username || user?.email?.split('@')[0]}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {
            Alert.alert('Share QR', 'QR code sharing functionality');
          }}
        >
          <Ionicons name="share" size={18} color="#ed7b0e" />
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="flash" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Instant</Text>
          <Text style={styles.featureDesc}>Real-time transfers</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Secure</Text>
          <Text style={styles.featureDesc}>Bank-level security</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="wallet" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Free</Text>
          <Text style={styles.featureDesc}>No transaction fees</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="notifications" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Alerts</Text>
          <Text style={styles.featureDesc}>Instant notifications</Text>
        </View>
      </View>

      {/* Payment Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How to Receive</Text>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>1</Text>
          </View>
          <Text style={styles.instructionText}>Show your QR code to the sender</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>2</Text>
          </View>
          <Text style={styles.instructionText}>They scan it with their TAPYZE app</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>3</Text>
          </View>
          <Text style={styles.instructionText}>Receive instant payment notification</Text>
        </View>
      </View>
    </View>
  );

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Send or Receive</Text>
          <Text style={styles.screenSubtitle}>Manage your money transfers</Text>
        </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => setActiveTab('send')}
        >
          <Ionicons 
            name="arrow-up" 
            size={18} 
            color={activeTab === 'send' ? '#FFFFFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'receive' && styles.activeTab]}
          onPress={() => setActiveTab('receive')}
        >
          <Ionicons 
            name="arrow-down" 
            size={18} 
            color={activeTab === 'receive' ? '#FFFFFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'receive' && styles.activeTabText]}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'send' ? renderSendTab() : renderReceiveTab()}
      </ScrollView>

      {/* Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scannerModalVisible}
        onRequestClose={() => setScannerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan QR Code</Text>
              <TouchableOpacity 
                onPress={() => setScannerModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannerContainer}>
              <View style={styles.scannerPlaceholder}>
                <ActivityIndicator size="large" color="#ed7b0e" />
                <Text style={styles.scannerText}>Scanning QR Code...</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SendReceiveScreen;