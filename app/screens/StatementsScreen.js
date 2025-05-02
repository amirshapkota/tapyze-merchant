import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/StatementsScreenStyles';

// Sample data for statements (grouped by month)
const initialStatements = [
  {
    id: 'apr2025',
    month: 'April 2025',
    transactions: [
      { id: 's1', type: 'receive', title: 'Tap Payment', customerName: 'Sarah Johnson', amount: 45.99, date: '2025-04-18', method: 'TAPYZE Card', fee: 0.23 },
      { id: 's2', type: 'receive', title: 'QR Code Payment', customerName: 'Michael Chen', amount: 120.25, date: '2025-04-15', method: 'TAPYZE App', fee: 0.60 },
      { id: 's3', type: 'refund', title: 'Refund', customerName: 'Emma Thompson', amount: -18.75, date: '2025-04-14', method: 'Original Method', fee: 0.09 }
    ]
  },
  {
    id: 'mar2025',
    month: 'March 2025',
    transactions: [
      { id: 's4', type: 'receive', title: 'Tap Payment', customerName: 'David Wilson', amount: 35.50, date: '2025-03-28', method: 'TAPYZE Card', fee: 0.18 },
      { id: 's5', type: 'receive', title: 'Online Payment', customerName: 'James Brown', amount: 85.00, date: '2025-03-22', method: 'TAPYZE App', fee: 0.43 },
      { id: 's6', type: 'receive', title: 'QR Code Payment', customerName: 'Jennifer Lee', amount: 78.25, date: '2025-03-15', method: 'TAPYZE App', fee: 0.39 },
      { id: 's7', type: 'withdraw', title: 'Withdrawal', amount: -1250.00, date: '2025-03-01', method: 'Bank Transfer', fee: 0.00 }
    ]
  },
  {
    id: 'feb2025',
    month: 'February 2025',
    transactions: [
      { id: 's8', type: 'receive', title: 'Tap Payment', customerName: 'Robert Garcia', amount: 55.37, date: '2025-02-25', method: 'TAPYZE Card', fee: 0.28 },
      { id: 's9', type: 'receive', title: 'Online Payment', customerName: 'Maria Rodriguez', amount: 45.00, date: '2025-02-18', method: 'TAPYZE App', fee: 0.23 },
      { id: 's10', type: 'refund', title: 'Refund', customerName: 'Daniel Martinez', amount: -29.50, date: '2025-02-10', method: 'Original Method', fee: 0.15 },
      { id: 's11', type: 'receive', title: 'QR Code Payment', customerName: 'Laura Wilson', amount: 60.00, date: '2025-02-05', method: 'TAPYZE App', fee: 0.30 },
      { id: 's12', type: 'withdraw', title: 'Withdrawal', amount: -1250.00, date: '2025-02-01', method: 'Bank Transfer', fee: 0.00 }
    ]
  }
];

const StatementsScreen = () => {
  const navigation = useNavigation();
  const [statements, setStatements] = useState(initialStatements);
  const [filteredStatements, setFilteredStatements] = useState(initialStatements);
  const [isLoading, setIsLoading] = useState(true);
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
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Navigate to profile/settings screen
  const navigateToProfile = () => {
    navigation.navigate('Settings');
  };

  // Navigate back to dashboard
  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
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

  // Calculate totals whenever filtered statements change
  useEffect(() => {
    let revenue = 0;
    let refunds = 0;
    let fees = 0;
    
    filteredStatements.forEach(group => {
      group.transactions.forEach(transaction => {
        if (transaction.type === 'receive') {
          revenue += transaction.amount;
        } else if (transaction.type === 'refund') {
          refunds += Math.abs(transaction.amount);
        }
        
        if (transaction.fee) {
          fees += transaction.fee;
        }
      });
    });
    
    const netAmount = revenue - refunds - fees;
    
    setPeriodTotals({
      revenue,
      refunds,
      fees,
      netAmount
    });
  }, [filteredStatements]);

  const filterStatementsByDateRange = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Filter transactions based on date range
    const filtered = initialStatements.map(group => {
      const filteredTransactions = group.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
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
    }, 2000);
  };

  const renderTransaction = ({ item }) => {
    const isPositive = item.type === 'receive';
    
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIcon, 
          item.type === 'receive' ? styles.receiveIcon : 
          item.type === 'refund' ? styles.refundIcon : styles.withdrawIcon]}>
          {item.type === 'receive' && <Ionicons name="arrow-down-outline" size={24} color="#FFFFFF" />}
          {item.type === 'refund' && <Ionicons name="arrow-up-outline" size={24} color="#FFFFFF" />}
          {item.type === 'withdraw' && <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.customerName} • {formatDate(item.date)}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, isPositive ? styles.positiveAmount : styles.negativeAmount]}>
            {isPositive ? '+' : ''}{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionMethod}>{item.method}</Text>
        </View>
      </View>
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
      <ScrollView style={styles.statementsContainer}>
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
    </SafeAreaView>
  );
};

export default StatementsScreen;