import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/TransactionScreenStyles';

const WithdrawScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [note, setNote] = useState('');
  
  // Current balance - this would come from your app state/context
  const currentBalance = 2580.75;
  
  // Sample withdrawal methods
  const withdrawalMethods = [
    { id: '1', name: 'VISA Debit', number: '••••8912', icon: 'card-outline', color: '#0057b8' },
    { id: '2', name: 'Bank Account', number: 'ICICI ••••7281', icon: 'business-outline', color: '#333333' },
    { id: '3', name: 'UPI Transfer', number: 'user@okaxis', icon: 'phone-portrait-outline', color: '#6739B7' },
  ];
  
  // Quick amount options
  const quickAmounts = [200, 500, 1000, 2000];
  
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
  
  // Check if withdrawal amount is valid
  const isValidAmount = () => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    return numAmount > 0 && numAmount <= currentBalance;
  };
  
  // Handle quick amount selection
  const handleQuickAmount = (value) => {
    setAmount(formatAmount(value.toString()));
  };
  
  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };
  
  // Handle withdraw submission
  const handleWithdraw = () => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    
    if (numAmount > currentBalance) {
      Alert.alert(
        "Insufficient Balance",
        "You don't have enough funds to withdraw this amount.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Here you would implement the actual withdrawal functionality
    // For now, just navigate back to dashboard
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Money</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceInfoContainer}>
          <Text style={styles.availableBalanceLabel}>Available Balance</Text>
          <Text style={styles.availableBalanceAmount}>Rs. {currentBalance.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Enter Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>Rs.</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#CCCCCC"
          />
        </View>
        
        <View style={styles.quickAmountContainer}>
          {quickAmounts.map((value) => (
            <TouchableOpacity 
              key={value} 
              style={styles.quickAmountButton}
              onPress={() => handleQuickAmount(value)}
            >
              <Text style={styles.quickAmountText}>Rs. {value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Withdraw To</Text>
        <View style={styles.methodsContainer}>
          {withdrawalMethods.map((method) => (
            <TouchableOpacity 
              key={method.id} 
              style={[
                styles.methodItem,
                selectedMethod?.id === method.id && styles.selectedMethodItem
              ]}
              onPress={() => handleMethodSelect(method)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                <Ionicons name={method.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodNumber}>{method.number}</Text>
              </View>
              {selectedMethod?.id === method.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#ed7b0e" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="What's this withdrawal for?"
          placeholderTextColor="#999999"
          multiline
        />
        
        <View style={styles.feeInfoContainer}>
          <View style={styles.feeIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.feeTextContainer}>
            <Text style={styles.feeTitle}>Withdrawal Fee</Text>
            <Text style={styles.feeDescription}>
              Standard withdrawals are free. Instant withdrawals have a 1% fee.
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!amount || !selectedMethod || !isValidAmount()) && styles.disabledButton
            ]}
            disabled={!amount || !selectedMethod || !isValidAmount()}
            onPress={handleWithdraw}
          >
            <Text style={styles.submitButtonText}>Withdraw Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawScreen;