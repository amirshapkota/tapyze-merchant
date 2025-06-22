import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Camera, CameraView } from 'expo-camera';
import { useMerchantAuth } from '../context/MerchantAuthContext'; // Adjust path as needed
import merchantWalletService from '../services/merchantWalletService';
import styles from '../styles/SendReceiveScreenStyles'; // Adjust path as needed

const MerchantSendReceiveScreen = ({ navigation }) => {
  const { user } = useMerchantAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientUser, setRecipientUser] = useState(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [sendType, setSendType] = useState('user');
  const [recipientLookupLoading, setRecipientLookupLoading] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  
  const quickAmounts = [500, 1000, 2000, 5000];

  useEffect(() => {
    loadUserBalance();
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasPermission(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      setBalanceLoading(true);
      const result = await merchantWalletService.getWalletBalance();
      if (result.success) {
        setUserBalance(result.balance);
      } else {
        console.error('Failed to load balance:', result.message);
        Alert.alert('Error', 'Failed to load wallet balance');
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      Alert.alert('Error', 'Failed to load wallet balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  const formatAmount = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const handleAmountChange = (text) => {
    const formattedAmount = formatAmount(text);
    setAmount(formattedAmount);
  };
  
  const handleQuickAmount = (value) => {
    setAmount(formatAmount(value.toString()));
  };

  const handlePhoneChange = (text) => {
    setRecipientPhone(text);
  };

  const lookupRecipient = useCallback(async (phone) => {
    if (!phone || phone.length < 10) {
      setRecipientUser(null);
      setPhoneValidationError('');
      return;
    }

    const cleanPhone = phone.replace(/^\+977-?/, '').replace(/\s+/g, '');
    if (cleanPhone.length < 10 || !cleanPhone.startsWith('9')) {
      setRecipientUser(null);
      setPhoneValidationError('Phone number should start with 9 and be 10 digits');
      return;
    }

    try {
      setRecipientLookupLoading(true);
      setPhoneValidationError('');
      
      const result = await merchantWalletService.findUserByPhone(phone);
      
      if (result.success) {
        setRecipientUser(result.user);
        
        if (result.user.type === 'Merchant') {
          setSendType('business');
        } else {
          setSendType('user');
        }
      } else {
        setRecipientUser(null);
        if (cleanPhone.length >= 10) {
          setPhoneValidationError(result.message || 'User not found');
        }
      }
    } catch (error) {
      console.error('Recipient lookup error:', error);
      setRecipientUser(null);
      setPhoneValidationError('Error looking up recipient');
    } finally {
      setRecipientLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientPhone.trim()) {
        lookupRecipient(recipientPhone.trim());
      } else {
        setRecipientUser(null);
        setPhoneValidationError('');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [recipientPhone, lookupRecipient]);

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

    if (!recipientPhone.trim()) {
      Alert.alert('Error', 'Please enter recipient phone number');
      return false;
    }

    const cleanPhone = recipientPhone.replace(/^\+977-?/, '').replace(/\s+/g, '');
    if (cleanPhone.length < 10 || !cleanPhone.startsWith('9')) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    if (!recipientUser) {
      Alert.alert('Error', 'Recipient not found. Please check the phone number.');
      return false;
    }
    
    return true;
  };

  const handleSendMoney = async () => {
    if (!validateSendTransaction()) return;

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    const recipientType = recipientUser?.type === 'Merchant' ? 'BUSINESS' : 'USER';
    
    Alert.alert(
      'Confirm Payment',
      `Send Rs. ${amount} to ${recipientUser?.name || recipientPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await merchantWalletService.transferFunds(
                recipientPhone,
                recipientType,
                numericAmount,
                note ? `Transfer to ${recipientUser?.name || recipientPhone} (${note})` : `Transfer to ${recipientUser?.name || recipientPhone}`
              );
              
              if (result.success) {
                setTransactionSuccess({
                  amount: amount,
                  recipient: result.recipient || { name: recipientUser?.name, phone: recipientPhone },
                  transaction: result.transaction,
                  newBalance: result.senderBalance,
                  timestamp: new Date()
                });
                
                setAmount('');
                setRecipientPhone('');
                setRecipientUser(null);
                setNote('');
                setPhoneValidationError('');
                loadUserBalance();
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

  const handleScanQR = async () => {
    if (hasPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to scan QR codes');
        return;
      }
    } else if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Please enable camera permission in settings');
      return;
    }

    // Reset scanned state when opening scanner
    setScanned(false);
    setScannerModalVisible(true);
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Close scanner modal immediately
    setScannerModalVisible(false);
    
    const phoneNumber = data.trim();
    const cleanPhone = phoneNumber.replace(/^\+977-?/, '').replace(/\s+/g, '');
    
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      setRecipientPhone(cleanPhone);
      // Remove the popup - just auto-fill the phone number
    } else {
      Alert.alert('Invalid QR Code', 'Please scan a valid TAPYZE payment QR code.');
    }
  };

  const generateQRData = () => {
    return user?.phone || '';
  };

  // Transaction Success Screen
  if (transactionSuccess) {
    return (
      <SafeAreaView style={styles.container}>
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
          <TouchableOpacity onPress={() => {
            setTransactionSuccess(null);
            navigation.goBack();
          }}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#28a745" />
            </View>
            
            <Text style={styles.successTitle}>Payment Sent!</Text>
            <Text style={styles.successSubtitle}>Your transaction was completed successfully</Text>
            
            <View style={styles.transactionDetails}>
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Amount Sent</Text>
                <Text style={styles.amountValue}>Rs. {transactionSuccess.amount}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>{transactionSuccess.recipient.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{transactionSuccess.recipient.phone}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={styles.detailValue}>{transactionSuccess.transaction?.reference || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {transactionSuccess.timestamp.toLocaleDateString()} at {transactionSuccess.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>New Balance</Text>
                <Text style={styles.balanceValue}>Rs. {transactionSuccess.newBalance.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.successActions}>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => {
                  Alert.alert('Share Receipt', 'Receipt sharing functionality will be implemented');
                }}
              >
                <Ionicons name="share-outline" size={20} color="#ed7b0e" />
                <Text style={styles.shareButtonText}>Share Receipt</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => {
                  setTransactionSuccess(null);
                  navigation.goBack();
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderSendTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet-outline" size={24} color="#ed7b0e" />
          <Text style={styles.balanceLabel}>Business Balance</Text>
        </View>
        {balanceLoading ? (
          <ActivityIndicator size="small" color="#ed7b0e" />
        ) : (
          <Text style={styles.balanceAmount}>Rs. {userBalance.toLocaleString()}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send To</Text>
        <View style={styles.sendTypeContainer}>
          <TouchableOpacity 
            style={[styles.sendTypeButton, sendType === 'user' && styles.activeSendType]}
            onPress={() => setSendType('user')}
            disabled={recipientUser?.type === 'Merchant'}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={sendType === 'user' ? '#FFFFFF' : '#666'} 
            />
            <Text style={[styles.sendTypeText, sendType === 'user' && styles.activeSendTypeText]}>
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendTypeButton, sendType === 'business' && styles.activeSendType]}
            onPress={() => setSendType('business')}
            disabled={recipientUser?.type === 'Customer'}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {sendType === 'user' ? 'Send to Customer' : 'Pay to Business'}
        </Text>
        <View style={styles.recipientInputContainer}>
          <Ionicons 
            name="call" 
            size={20} 
            color="#666" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={[
              styles.recipientInput,
              phoneValidationError && !recipientUser && styles.errorInput
            ]}
            value={recipientPhone}
            onChangeText={handlePhoneChange}
            placeholder="Phone number (9xxxxxxxxx)"
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

        {phoneValidationError && !recipientUser && (
          <View style={styles.errorInfo}>
            <Ionicons name="alert-circle" size={16} color="#dc3545" />
            <Text style={styles.errorText}>{phoneValidationError}</Text>
          </View>
        )}

        {recipientLookupLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ed7b0e" />
            <Text style={styles.loadingText}>Looking up recipient...</Text>
          </View>
        )}

        {recipientUser && !recipientLookupLoading && (
          <View style={styles.recipientInfo}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <View style={styles.recipientDetails}>
              <Text style={styles.recipientNameText}>{recipientUser.name}</Text>
              <Text style={styles.recipientTypeText}>
                {recipientUser.type === 'Merchant' ? 'Business Account' : 'Customer Account'}
              </Text>
              <Text style={styles.recipientPhoneText}>
                {recipientUser.phone}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Note (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder={sendType === 'user' ? "Payment description" : "Business payment details"}
          placeholderTextColor="#999999"
          multiline
          editable={!isLoading}
          maxLength={200}
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.sendButton,
          (!amount || !recipientPhone || !recipientUser || isLoading || balanceLoading) && styles.disabledButton
        ]}
        disabled={!amount || !recipientPhone || !recipientUser || isLoading || balanceLoading}
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
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Business Payment QR</Text>
        <Text style={styles.qrSubtitle}>
          Show this code to customers for instant payments
        </Text>
        
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={generateQRData()}
            size={220}
            color="#000000"
            backgroundColor="#FFFFFF"
            logo={require('../assets/logo.png')}
            logoSize={44}
            logoBackgroundColor="transparent"
            logoMargin={4}
            logoBorderRadius={12}
            enableLinearGradient={false}
          />
        </View>
        
        <View style={styles.userInfoCard}>
          <Text style={styles.userName}>{user?.businessName}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={styles.userIdContainer}>
            <Ionicons name="business" size={14} color="#ed7b0e" />
            <Text style={styles.userId}>Verified Business Account</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {
            Alert.alert('Share QR', 'QR code sharing functionality will be implemented');
          }}
        >
          <Ionicons name="share" size={18} color="#ed7b0e" />
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="flash" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Instant</Text>
          <Text style={styles.featureDesc}>Real-time payments</Text>
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
            <Ionicons name="trending-up" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Business</Text>
          <Text style={styles.featureDesc}>For merchants</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="notifications" size={20} color="#ed7b0e" />
          </View>
          <Text style={styles.featureTitle}>Alerts</Text>
          <Text style={styles.featureDesc}>Instant notifications</Text>
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How to Receive Payments</Text>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>1</Text>
          </View>
          <Text style={styles.instructionText}>Show your business QR code to customers</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>2</Text>
          </View>
          <Text style={styles.instructionText}>Customer scans with TAPYZE customer app</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepText}>3</Text>
          </View>
          <Text style={styles.instructionText}>Receive instant payment confirmation</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Send or Receive</Text>
        <Text style={styles.screenSubtitle}>Manage business money transfers</Text>
      </View>

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

      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerModalVisible}
        onRequestClose={() => {
          setScannerModalVisible(false);
          setScanned(false); // Reset scanned state when modal closes
        }}
      >
        <View style={cameraStyles.container}>
          <View style={cameraStyles.header}>
            <TouchableOpacity 
              onPress={() => {
                setScannerModalVisible(false);
                setScanned(false); // Reset scanned state when manually closing
              }}
              style={cameraStyles.closeButton}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={cameraStyles.headerTitle}>Scan Customer QR</Text>
            <View style={cameraStyles.placeholder} />
          </View>

          {hasPermission === false ? (
            <View style={cameraStyles.permissionContainer}>
              <Ionicons name="camera-off" size={64} color="#666" />
              <Text style={cameraStyles.permissionText}>Camera permission denied</Text>
              <TouchableOpacity 
                style={cameraStyles.permissionButton}
                onPress={getCameraPermissions}
              >
                <Text style={cameraStyles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          )}

          <View style={cameraStyles.overlay}>
            <View style={cameraStyles.scannerFrame}>
              <View style={cameraStyles.corner} />
              <View style={[cameraStyles.corner, cameraStyles.topRight]} />
              <View style={[cameraStyles.corner, cameraStyles.bottomLeft]} />
              <View style={[cameraStyles.corner, cameraStyles.bottomRight]} />
            </View>
          </View>

          <View style={cameraStyles.instructionsContainer}>
            <Text style={cameraStyles.instructionsTitle}>
              Point camera at customer's QR code
            </Text>
            <Text style={cameraStyles.instructionsText}>
              Make sure the QR code is clearly visible
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const cameraStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#ed7b0e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ed7b0e',
    borderWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MerchantSendReceiveScreen;