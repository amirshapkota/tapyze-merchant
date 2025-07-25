import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useMerchantAuth } from '../context/MerchantAuthContext';
import merchantWalletService from '../services/merchantWalletService';
import styles from '../styles/StatementsScreenStyles';

import paymentService from '../services/merchantPaymentService';

const StatementsScreen = () => {
  const navigation = useNavigation();
  const { user } = useMerchantAuth();
  
  // State management
  const [statements, setStatements] = useState([]);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date('2025-02-01'), 
    endDate: new Date() 
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Calculate totals for the period
  const [periodTotals, setPeriodTotals] = useState({
    revenue: 0,
    refunds: 0,
    fees: 0,
    netAmount: 0
  });

  // NEW: Transaction details modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Load transactions from backend
  const loadTransactions = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      
      const result = await merchantWalletService.getTransactionHistory(1, 50);
      
      if (result.success) {
        const formattedTransactions = result.transactions.map(transaction => 
          merchantWalletService.formatTransactionForDisplay(transaction)
        );
        
        // Group transactions
        const groupedTransactions = groupTransactionsByMonth(formattedTransactions);
        setStatements(groupedTransactions);
        setFilteredStatements(groupedTransactions);
        
        // Calculate totals
        calculatePeriodTotals(result.transactions);
        
      } else {
        console.error('Failed to load transactions:', result.message);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Group transactions by month (same as your original logic)
  const groupTransactionsByMonth = (transactions) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.rawTransaction?.createdAt || transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          id: monthKey,
          month: monthLabel,
          transactions: []
        };
      }
      
      // Add fee calculation for display
      const transactionWithFee = {
        ...transaction,
        fee: transaction.type === 'receive' ? transaction.amount * 0.005 : 0 // 0.5% fee
      };
      
      grouped[monthKey].transactions.push(transactionWithFee);
    });
    
    return Object.values(grouped)
      .sort((a, b) => b.id.localeCompare(a.id))
      .map(group => ({
        ...group,
        transactions: group.transactions.sort((a, b) => 
          new Date(b.rawTransaction?.createdAt || b.date) - new Date(a.rawTransaction?.createdAt || a.date)
        )
      }));
  };

  // Calculate period totals
  const calculatePeriodTotals = (transactions) => {
    let revenue = 0;
    let refunds = 0;
    let fees = 0;
    
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      
      if (transaction.type === 'CREDIT' || transaction.amount > 0) {
        revenue += amount;
        fees += amount * 0.005; // 0.5% fee
      } else if (transaction.amount < 0) {
        refunds += amount;
      }
    });
    
    const netAmount = revenue - refunds - fees;
    
    setPeriodTotals({
      revenue,
      refunds,
      fees,
      netAmount
    });
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions(false);
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadTransactions(false);
  };
  
  useEffect(() => {
    // Filter statements based on date range
    filterStatementsByDateRange();
  }, [dateRange]);

  useEffect(() => {
    let totalItems = 0;
    filteredStatements.forEach(group => {
      totalItems += group.transactions.length;
    });
    
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [filteredStatements, itemsPerPage]);

  // Navigate to profile/settings screen
  const navigateToProfile = () => {
    navigation.navigate('Settings');
  };

  // Navigate back to dashboard
  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const filterStatementsByDateRange = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Filter transactions based on date range
    const filtered = statements.map(group => {
      const filteredTransactions = group.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.rawTransaction?.createdAt || transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      return {
        ...group,
        transactions: filteredTransactions
      };
    }).filter(group => group.transactions.length > 0);
    
    setFilteredStatements(filtered);
  };

  const handleDateChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const applyDateFilter = () => {
    filterStatementsByDateRange();
    setShowFilterModal(false);
  };

  const resetFilter = () => {
    setDateRange({ 
      startDate: new Date('2025-02-01'), 
      endDate: new Date() 
    });
    filterStatementsByDateRange();
    setShowFilterModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleExport = () => {
    setIsDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      setShowExportModal(false);
      Alert.alert('Export Successful', 'Your transaction statement has been downloaded.');
    }, 2000);
  };

  // NEW: Handle transaction selection for details modal
  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleRefund = async (transaction) => {
    try {
      setIsRefunding(true);
      
      console.log('Starting refund for transaction:', transaction);
      
      // Get the original transaction ID from metadata
      let transactionId = null;
      
      // First try to get from rawTransaction
      if (transaction.rawTransaction && transaction.rawTransaction._id) {
        transactionId = transaction.rawTransaction._id;
      } 
      // Then try reference field
      else if (transaction.reference) {
        transactionId = transaction.reference;
      } 
      // Finally try the transaction id itself
      else if (transaction.id) {
        transactionId = transaction.id;
      }
      
      console.log('Extracted transaction ID:', transactionId);
      
      if (!transactionId) {
        Alert.alert('Error', 'Cannot find transaction ID for refund');
        return;
      }

      // Validate that this is a payment that can be refunded
      if (transaction.type !== 'receive') {
        Alert.alert('Error', 'Only received payments can be refunded');
        return;
      }

      const result = await paymentService.refundTransaction(transactionId, refundReason || 'Customer refund request');
      
      console.log('Refund result:', result);
      
      if (result.success) {
        Alert.alert(
          'Refund Successful', 
          `Refund of Rs. ${result.data.refundAmount ? result.data.refundAmount.toFixed(2) : transaction.amount.toFixed(2)} has been processed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowTransactionModal(false);
                setShowRefundModal(false);
                setRefundReason('');
                // Refresh the transactions list
                loadTransactions(false);
              }
            }
          ]
        );
      } else {
        Alert.alert('Refund Failed', result.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      Alert.alert('Error', 'An unexpected error occurred while processing the refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const showRefundConfirmation = (transaction) => {
    console.log('Showing refund confirmation for:', transaction);
    
    // Additional validation
    if (!transaction || transaction.type !== 'receive') {
      Alert.alert('Error', 'This transaction cannot be refunded');
      return;
    }

    // Check if transaction is from today or recent (optional business rule)
    const transactionDate = new Date(transaction.rawTransaction?.createdAt || transaction.date);
    const daysDiff = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      Alert.alert(
        'Old Transaction',
        'This transaction is more than 30 days old. Are you sure you want to proceed with the refund?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => proceedWithRefund(transaction) }
        ]
      );
      return;
    }
    
    proceedWithRefund(transaction);
  };
  const proceedWithRefund = (transaction) => {
    Alert.alert(
      'Confirm Refund',
      `Are you sure you want to refund Rs. ${transaction.amount.toFixed(2)} to ${transaction.customerName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Refund Now',
          style: 'destructive',
          onPress: () => handleRefund(transaction)
        }
      ]
    );
  };

  const renderTransaction = ({ item }) => {
    const isPositive = item.type === 'receive';
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionSelect(item)} // NEW: Make touchable
      >
        <View style={[styles.transactionIcon, 
          item.type === 'receive' ? styles.receiveIcon : 
          item.type === 'refund' ? styles.refundIcon : styles.withdrawIcon]}>
          {item.type === 'receive' && <Ionicons name="arrow-down-outline" size={24} color="#FFFFFF" />}
          {item.type === 'refund' && <Ionicons name="arrow-up-outline" size={24} color="#FFFFFF" />}
          {item.type === 'withdraw' && <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.customerName} • {formatDate(item.rawTransaction?.createdAt || item.date)}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, isPositive ? styles.positiveAmount : styles.negativeAmount]}>
            {isPositive ? '+' : ''}{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionMethod}>{item.method}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMonthSection = ({ item }) => {
    return (
      <View style={styles.monthSection}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{item.month}</Text>
        </View>
        
        {item.transactions.map((transaction) => (
          <View key={transaction.id}>
            {renderTransaction({item: transaction})}
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed7b0e" />
        <Text style={styles.loadingText}>Loading statements...</Text>
      </SafeAreaView>
    );
  }

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
          onPress={navigateToProfile}
        >
          <Ionicons name="person-circle-outline" size={40} color="#ed7b0e" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Transaction History</Text>
        <Text style={styles.screenSubtitle}>View and manage your transaction records</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>Filter by Date</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => setShowExportModal(true)}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Transaction Summary</Text>
        <Text style={styles.summaryDateRange}>
          {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
        </Text>
        
        <View style={styles.summaryBoxes}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryBoxTitle}>Revenue</Text>
            <Text style={styles.summaryBoxValue}>Rs. {periodTotals.revenue.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryBox}>
            <Text style={styles.summaryBoxTitle}>Refunds</Text>
            <Text style={styles.summaryBoxValue}>Rs. {periodTotals.refunds.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryBox, styles.netAmountBox]}>
            <Text style={styles.summaryBoxTitle}>Net Amount</Text>
            <Text style={styles.netAmountValue}>Rs. {periodTotals.netAmount.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.feesContainer}>
          <Text style={styles.feesLabel}>Transaction Fees (0.5%)</Text>
          <Text style={styles.feesValue}>Rs. {periodTotals.fees.toFixed(2)}</Text>
        </View>
      </View>

      {/* Transaction History */}
      <ScrollView 
        style={styles.statementsContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#ed7b0e']}
            tintColor="#ed7b0e"
          />
        }
      >
        {filteredStatements.length > 0 ? (
          filteredStatements.map((monthGroup) => (
            <View key={monthGroup.id}>
              {renderMonthSection({item: monthGroup})}
            </View>
          ))
        ) : (
          <View style={styles.noTransactionsContainer}>
            <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
            <Text style={styles.noTransactionsText}>No transactions found for the selected period</Text>
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          disabled={currentPage === 1}
          onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? "#CCCCCC" : "#333333"} />
        </TouchableOpacity>
        
        <Text style={styles.paginationText}>Page {currentPage} of {totalPages}</Text>
        
        <TouchableOpacity 
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        >
          <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? "#CCCCCC" : "#333333"} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date Range</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
              >
                <Text style={styles.dateInputText}>
                  {formatDate(dateRange.startDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
              >
                <Text style={styles.dateInputText}>
                  {formatDate(dateRange.endDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.predefinedFilters}>
                <Text style={styles.inputLabel}>Quick Filters</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity 
                    style={styles.filterChip}
                    onPress={() => {
                      const today = new Date();
                      const lastMonth = new Date();
                      lastMonth.setMonth(today.getMonth() - 1);
                      handleDateChange('startDate', lastMonth);
                      handleDateChange('endDate', today);
                    }}
                  >
                    <Text style={styles.filterChipText}>Last 30 Days</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.filterChip}
                    onPress={() => {
                      const today = new Date();
                      const lastThreeMonths = new Date();
                      lastThreeMonths.setMonth(today.getMonth() - 3);
                      handleDateChange('startDate', lastThreeMonths);
                      handleDateChange('endDate', today);
                    }}
                  >
                    <Text style={styles.filterChipText}>Last 3 Months</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.filterChip}
                    onPress={() => {
                      const today = new Date();
                      const yearStart = new Date(today.getFullYear(), 0, 1);
                      handleDateChange('startDate', yearStart);
                      handleDateChange('endDate', today);
                    }}
                  >
                    <Text style={styles.filterChipText}>This Year</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={resetFilter}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={applyDateFilter}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExportModal}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Transactions</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Date Range</Text>
              <Text style={styles.exportDateRange}>
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </Text>
              
              <Text style={styles.inputLabel}>Export Format</Text>
              <View style={styles.formatOptions}>
                <TouchableOpacity 
                  style={[styles.formatOption, selectedExportFormat === 'pdf' && styles.selectedFormat]}
                  onPress={() => setSelectedExportFormat('pdf')}
                >
                  <Ionicons 
                    name="document-text-outline" 
                    size={24} 
                    color={selectedExportFormat === 'pdf' ? "#ed7b0e" : "#777"} 
                  />
                  <Text style={selectedExportFormat === 'pdf' ? styles.selectedFormatText : styles.formatText}>
                    PDF
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.formatOption, selectedExportFormat === 'csv' && styles.selectedFormat]}
                  onPress={() => setSelectedExportFormat('csv')}
                >
                  <Ionicons 
                    name="grid-outline" 
                    size={24} 
                    color={selectedExportFormat === 'csv' ? "#ed7b0e" : "#777"} 
                  />
                  <Text style={selectedExportFormat === 'csv' ? styles.selectedFormatText : styles.formatText}>
                    CSV
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.formatOption, selectedExportFormat === 'xlsx' && styles.selectedFormat]}
                  onPress={() => setSelectedExportFormat('xlsx')}
                >
                  <Ionicons 
                    name="calculator-outline" 
                    size={24} 
                    color={selectedExportFormat === 'xlsx' ? "#ed7b0e" : "#777"} 
                  />
                  <Text style={selectedExportFormat === 'xlsx' ? styles.selectedFormatText : styles.formatText}>
                    Excel
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Email Statement</Text>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleExport}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Export Transactions
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW: Transaction Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTransactionModal}
        onRequestClose={() => setShowTransactionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedTransaction && (
              <View style={styles.modalContent}>
                <View style={[styles.transactionIcon, 
                  selectedTransaction.type === 'receive' ? styles.receiveIcon : 
                  selectedTransaction.type === 'refund' ? styles.refundIcon : styles.withdrawIcon,
                  {alignSelf: 'center', width: 60, height: 60, marginBottom: 20}
                ]}>
                  {selectedTransaction.type === 'receive' && <Ionicons name="arrow-down-outline" size={30} color="#FFFFFF" />}
                  {selectedTransaction.type === 'refund' && <Ionicons name="arrow-up-outline" size={30} color="#FFFFFF" />}
                  {selectedTransaction.type === 'withdraw' && <Ionicons name="wallet-outline" size={30} color="#FFFFFF" />}
                </View>
                
                <Text style={[styles.transactionAmount, 
                  selectedTransaction.type === 'receive' ? styles.positiveAmount : styles.negativeAmount,
                  {fontSize: 30, textAlign: 'center', marginBottom: 20}
                ]}>
                  {selectedTransaction.type === 'receive' ? '+' : ''}{selectedTransaction.amount.toFixed(2)} Rs.
                </Text>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Transaction Type</Text>
                  <Text style={styles.detailsValue}>
                    {selectedTransaction.type === 'receive' ? 'Payment Received' : 
                     selectedTransaction.type === 'refund' ? 'Refund Issued' : 'Withdrawal'}
                  </Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Customer</Text>
                  <Text style={styles.detailsValue}>{selectedTransaction.customerName}</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Date & Time</Text>
                  <Text style={styles.detailsValue}>
                    {new Date(selectedTransaction.rawTransaction?.createdAt || selectedTransaction.date).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Payment Method</Text>
                  <Text style={styles.detailsValue}>{selectedTransaction.method}</Text>
                </View>
                
                {selectedTransaction.reference && (
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Transaction ID</Text>
                    <Text style={styles.detailsValue}>{selectedTransaction.reference}</Text>
                  </View>
                )}
                
                {selectedTransaction.fee && selectedTransaction.fee > 0 && (
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Transaction Fee</Text>
                    <Text style={styles.detailsValue}>Rs. {selectedTransaction.fee.toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Status</Text>
                  <Text style={styles.detailsValue}>{selectedTransaction.status || 'Completed'}</Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryButton]}
                  >
                    <Ionicons name="receipt-outline" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Send Receipt</Text>
                  </TouchableOpacity>
                  
                  {selectedTransaction.type === 'receive' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, {backgroundColor: '#FF3B30'}]}
                      onPress={() => showRefundConfirmation(selectedTransaction)}
                      disabled={isRefunding}
                    >
                      {isRefunding ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Ionicons name="return-down-back-outline" size={20} color="#FFF" />
                      )}
                      <Text style={styles.actionButtonText}>
                        {isRefunding ? 'Processing...' : 'Refund'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRefundModal}
        onRequestClose={() => setShowRefundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refund Reason</Text>
              <TouchableOpacity onPress={() => {
                setShowRefundModal(false);
                setRefundReason('');
              }}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Reason for Refund (Optional)</Text>
              <TextInput
                style={[styles.emailInput, {height: 80, textAlignVertical: 'top'}]}
                placeholder="Enter reason for refund..."
                multiline={true}
                numberOfLines={3}
                value={refundReason}
                onChangeText={setRefundReason}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                  }}
                >
                  <Text style={styles.resetButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => {
                    setShowRefundModal(false);
                    handleRefund(selectedTransaction);
                  }}
                  disabled={isRefunding}
                >
                  {isRefunding ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyButtonText}>Process Refund</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StatementsScreen;