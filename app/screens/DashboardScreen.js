import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  FlatList, 
  Modal, 
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useMerchantAuth } from '../context/MerchantAuthContext';
import merchantWalletService from '../services/merchantWalletService';
import styles from '../styles/DashboardScreenStyles';

// Sample data for promotions
const merchantPromotions = [
  {
    id: '1',
    title: 'Lower Transaction Fees',
    description: 'Enjoy reduced 0.5% transaction fees until May 15th',
    backgroundColor: '#ed7b0e',
    icon: 'cash-outline'
  },
  {
    id: '2',
    title: 'New Terminal Offer',
    description: 'Get a second terminal at 50% off',
    backgroundColor: '#000000',
    icon: 'card-outline'
  },
  {
    id: '3',
    title: 'Analytics Pro',
    description: 'Free 2-month trial of advanced analytics',
    backgroundColor: '#333333',
    icon: 'stats-chart-outline'
  }
];

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useMerchantAuth();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  const [selectedTab, setSelectedTab] = useState('all');
  const [showRevenue, setShowRevenue] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Load dashboard data
  const loadDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);
      
      const result = await merchantWalletService.getDashboardStats();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      loadDashboardData(false);
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData(false);
  };

  // Get stats based on selected timeframe
  const getCurrentStats = () => {
    if (!dashboardData) return { transactions: 0, revenue: 0 };
    
    switch (selectedTimeframe) {
      case 'today':
        return dashboardData.stats.today;
      case 'week':
        return dashboardData.stats.week;
      case 'month':
        return dashboardData.stats.month;
      default:
        return dashboardData.stats.today;
    }
  };

  // Filter transactions based on selected tab
  const getFilteredTransactions = () => {
    if (!dashboardData) return [];
    
    const transactions = dashboardData.recentTransactions;
    
    if (selectedTab === 'all') {
      return transactions;
    } else {
      return transactions.filter(transaction => transaction.type === selectedTab);
    }
  };

  // Navigation functions
  const navigateToProfile = () => {
    navigation.navigate('Settings');
  };

  const navigateToTransactionHistory = () => {
    navigation.navigate('Statements');
  };

  const navigateToCreatePayment = () => {
    navigation.navigate('Payments');
  };

  const navigateToWithdraw = () => {
    navigation.navigate('Withdraw');
  };

  const navigateToScanner = () => {
    navigation.navigate('Scanner');
  };

  const navigateToAnalytics = () => {
    navigation.navigate('Analytics');
  };

  // Handle transaction selection for details modal
  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  // Get merchant business name
  const getBusinessName = () => {
    return user?.businessName || 'Merchant';
  };

  const renderPromotion = ({ item }) => (
    <TouchableOpacity style={[styles.promotionBanner, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.promotionContent}>
        <Ionicons name={item.icon} size={28} color="#FFFFFF" style={styles.promotionIcon} />
        <View>
          <Text style={styles.promotionTitle}>{item.title}</Text>
          <Text style={styles.promotionDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }) => {
    const isPositive = item.type === 'receive';
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionSelect(item)}
      >
        <View style={[styles.transactionIcon, 
          item.type === 'receive' ? styles.receiveIcon : styles.refundIcon]}>
          {item.type === 'receive' && <Ionicons name="arrow-down-outline" size={24} color="#FFFFFF" />}
          {item.type === 'refund' && <Ionicons name="arrow-up-outline" size={24} color="#FFFFFF" />}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.customerName} • {item.date}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, isPositive ? styles.positiveAmount : styles.negativeAmount]}>
            {isPositive ? '+' : '-'}{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionCategory}>{item.method}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ed7b0e" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  // Show error screen
  if (error && !dashboardData) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => loadDashboardData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentStats = getCurrentStats();
  const filteredTransactions = getFilteredTransactions();
  const totalStats = dashboardData?.stats.total || { transactions: 0, revenue: 0, average: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#ed7b0e']}
            tintColor="#ed7b0e"
          />
        }
      >
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

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hello, {getBusinessName()}</Text>
          <Text style={styles.greetingSubtext}>Welcome to your merchant dashboard</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <View>
              <Text style={styles.statsLabel}>Total Balance</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsAmount}>
                  {showRevenue ? (dashboardData?.balance || 0).toFixed(2) : '••••••'}
                </Text>
                <Text style={styles.statsCurrency}>Rs.</Text>
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowRevenue(!showRevenue)}
                >
                  <Ionicons 
                    name={showRevenue ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeSelector}>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'today' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('today')}
            >
              <Text style={selectedTimeframe === 'today' ? styles.timeframeActiveText : styles.timeframeText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'week' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('week')}
            >
              <Text style={selectedTimeframe === 'week' ? styles.timeframeActiveText : styles.timeframeText}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'month' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('month')}
            >
              <Text style={selectedTimeframe === 'month' ? styles.timeframeActiveText : styles.timeframeText}>This Month</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{currentStats.transactions}</Text>
              <Text style={styles.statTitle}>Transactions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{currentStats.revenue.toFixed(2)}</Text>
              <Text style={styles.statTitle}>Revenue (Rs.)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalStats.average.toFixed(2)}</Text>
              <Text style={styles.statTitle}>Avg. Transaction (Rs.)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0.5%</Text>
              <Text style={styles.statTitle}>Transaction Fee</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={navigateToCreatePayment}
            >
              <Ionicons name="cash-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>New Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={navigateToWithdraw}
            >
              <Ionicons name="wallet-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Generate QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem} onPress={navigateToAnalytics}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="stats-chart-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem} onPress={navigateToProfile}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* NFC Terminal Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NFC Scanner</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.terminalCard} onPress={navigateToScanner}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>TAPYZE</Text>
              </View>
              <Text style={styles.cardType}>NFC SCANNER</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>Main Counter Scanner</Text>
              <Text style={styles.cardId}>Scanner ID: TPZ-{user?._id?.slice(-4)?.toUpperCase() || '7842'}-NFC</Text>
              <View style={styles.cardBadge}>
                <Ionicons name="radio-outline" size={16} color="#FFFFFF" />
                <Text style={styles.cardBadgeText}>Ready for Payments</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Merchant Offers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Merchant Offers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={merchantPromotions}
          renderItem={renderPromotion}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promotionsList}
        />

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={navigateToTransactionHistory}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={selectedTab === 'all' ? styles.activeTabText : styles.tabText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'receive' && styles.activeTab]}
            onPress={() => setSelectedTab('receive')}
          >
            <Text style={selectedTab === 'receive' ? styles.activeTabText : styles.tabText}>Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'refund' && styles.activeTab]}
            onPress={() => setSelectedTab('refund')}
          >
            <Text style={selectedTab === 'refund' ? styles.activeTabText : styles.tabText}>Refunds</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <View key={transaction.id}>
                {renderTransaction({item: transaction})}
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>No transactions found</Text>
              <Text style={styles.emptyStateSubtext}>Your recent transactions will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
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
                  selectedTransaction.type === 'receive' ? styles.receiveIcon : styles.refundIcon,
                  {alignSelf: 'center', width: 60, height: 60, marginBottom: 20}
                ]}>
                  {selectedTransaction.type === 'receive' && <Ionicons name="arrow-down-outline" size={30} color="#FFFFFF" />}
                  {selectedTransaction.type === 'refund' && <Ionicons name="arrow-up-outline" size={30} color="#FFFFFF" />}
                </View>
                
                <Text style={[styles.transactionAmount, 
                  selectedTransaction.type === 'receive' ? styles.positiveAmount : styles.negativeAmount,
                  {fontSize: 30, textAlign: 'center', marginBottom: 20}
                ]}>
                  {selectedTransaction.type === 'receive' ? '+' : '-'}{selectedTransaction.amount.toFixed(2)} Rs.
                </Text>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Transaction Type</Text>
                  <Text style={styles.detailsValue}>
                    {selectedTransaction.type === 'receive' ? 'Payment Received' : 'Refund Issued'}
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
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Transaction ID</Text>
                  <Text style={styles.detailsValue}>{selectedTransaction.reference}</Text>
                </View>
                
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
                    >
                      <Ionicons name="return-down-back-outline" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Refund</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;