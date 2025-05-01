import React, { useState } from 'react';
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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/DashboardScreenStyles';

// Sample data for transactions
const initialTransactions = [
  { id: '1', type: 'receive', title: 'Tap Payment', customerName: 'Sarah Johnson', amount: 45.99, date: '2025-04-18', method: 'TAPYZE Card' },
  { id: '2', type: 'receive', title: 'QR Code Payment', customerName: 'Michael Chen', amount: 120.25, date: '2025-04-18', method: 'TAPYZE App' },
  { id: '3', type: 'receive', title: 'Tap Payment', customerName: 'David Wilson', amount: 35.50, date: '2025-04-17', method: 'TAPYZE Card' },
  { id: '4', type: 'refund', title: 'Refund', customerName: 'Emma Thompson', amount: -18.75, date: '2025-04-17', method: 'Original Method' },
  { id: '5', type: 'receive', title: 'Online Payment', customerName: 'James Brown', amount: 85.00, date: '2025-04-16', method: 'TAPYZE App' },
];

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

// Sample data for merchant terminals
const merchantTerminals = [
  {
    id: '1',
    name: 'Main Counter',
    status: 'online',
    lastSynced: '2 mins ago',
    batteryLevel: 85,
    transactionCount: 42
  },
  {
    id: '2',
    name: 'Register 2',
    status: 'online',
    lastSynced: '5 mins ago',
    batteryLevel: 67,
    transactionCount: 28
  },
  {
    id: '3',
    name: 'Mobile Terminal',
    status: 'offline',
    lastSynced: '2 hours ago',
    batteryLevel: 12,
    transactionCount: 15
  },
  {
    id: '4',
    name: 'Checkout 3',
    status: 'online',
    lastSynced: '1 min ago',
    batteryLevel: 92,
    transactionCount: 31
  }
];

const DashboardScreen = () => {
  // Get the navigation object
  const navigation = useNavigation();
  
  const [totalRevenue, setTotalRevenue] = useState(4287.50);
  const [transactionCount, setTransactionCount] = useState(98);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showRevenue, setShowRevenue] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  
  // Add state for modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTerminalSettingsModal, setShowTerminalSettingsModal] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState(null);

  // Calculate average transaction value
  const averageTransaction = totalRevenue / transactionCount;
  
  // Filter transactions based on selected tab
  const filteredTransactions = selectedTab === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.type === selectedTab);

  // Navigate to profile/settings screen
  const navigateToProfile = () => {
    navigation.navigate('Settings');
  };

  // Navigate to transaction history screen
  const navigateToTransactionHistory = () => {
    navigation.navigate('TransactionHistory');
  };

  // Navigate to terminal management screen
  const navigateToTerminalManagement = () => {
    navigation.navigate('TerminalManagement');
  };

  // Navigate to create new payment screen
  const navigateToCreatePayment = () => {
    navigation.navigate('CreatePayment');
  };

  // Navigate to refund screen
  const navigateToRefund = () => {
    navigation.navigate('Refund');
  };

  // Handle transaction selection for details modal
  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  // Handle terminal selection for settings modal
  const handleTerminalSelect = (terminal) => {
    setSelectedTerminal(terminal);
    setShowTerminalSettingsModal(true);
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
    const isPositive = item.amount > 0;
    
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
            {isPositive ? '+' : ''}{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionCategory}>{item.method}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
          <Text style={styles.greeting}>Hello, Coffee Shop</Text>
          <Text style={styles.greetingSubtext}>Welcome to your merchant dashboard</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <View>
              <Text style={styles.statsLabel}>Total Revenue</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsAmount}>
                  {showRevenue ? totalRevenue.toFixed(2) : '••••••'}
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
              <Text style={styles.statValue}>{transactionCount}</Text>
              <Text style={styles.statTitle}>Transactions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{averageTransaction.toFixed(2)}</Text>
              <Text style={styles.statTitle}>Avg. Transaction (Rs.)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0.5%</Text>
              <Text style={styles.statTitle}>Transaction Fee</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statTitle}>New Customers</Text>
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
              onPress={navigateToRefund}
            >
              <Ionicons name="return-down-back-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Refund</Text>
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
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="receipt-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Invoice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="time-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Instant Payout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="stats-chart-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="people-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Customers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings-outline" size={24} color="#ed7b0e" />
            </View>
            <Text style={styles.quickActionTitle}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Terminal Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Primary Terminal</Text>
          <TouchableOpacity onPress={navigateToTerminalManagement}>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.terminalCard} onPress={navigateToTerminalManagement}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>TAPYZE</Text>
              </View>
              <Text style={styles.cardType}>POS TERMINAL</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>Main Counter Terminal</Text>
              <Text style={styles.cardId}>Terminal ID: TPZ-7842-MCT</Text>
              <View style={styles.cardBadge}>
                <Ionicons name="radio-outline" size={16} color="#FFFFFF" />
                <Text style={styles.cardBadgeText}>NFC Enabled</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* All Terminals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Terminals</Text>
          <TouchableOpacity onPress={navigateToTerminalManagement}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.terminalGrid}>
          {merchantTerminals.map((terminal) => (
            <TouchableOpacity 
              key={terminal.id}
              style={styles.terminalItem}
              onPress={() => handleTerminalSelect(terminal)}
            >
              <View style={styles.terminalIcon}>
                <Ionicons name="card-outline" size={24} color="#ed7b0e" />
              </View>
              <Text style={styles.terminalTitle}>{terminal.name}</Text>
              <View style={styles.terminalStatus}>
                <View style={[
                  styles.statusDot, 
                  terminal.status === 'online' ? styles.onlineStatusDot : styles.offlineStatusDot
                ]} />
                <Text style={styles.terminalStatusText}>
                  {terminal.status === 'online' ? 'Online' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
          {filteredTransactions.map(transaction => (
            <View key={transaction.id}>
              {renderTransaction({item: transaction})}
            </View>
          ))}
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
                  selectedTransaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount,
                  {fontSize: 30, textAlign: 'center', marginBottom: 20}
                ]}>
                  {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount.toFixed(2)} Rs.
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
                  <Text style={styles.detailsValue}>{selectedTransaction.date}, 14:32</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Payment Method</Text>
                  <Text style={styles.detailsValue}>{selectedTransaction.method}</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Terminal</Text>
                  <Text style={styles.detailsValue}>Main Counter</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Transaction ID</Text>
                  <Text style={styles.detailsValue}>TRX-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Status</Text>
                  <Text style={styles.detailsValue}>Completed</Text>
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

      {/* Terminal Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTerminalSettingsModal}
        onRequestClose={() => setShowTerminalSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terminal Settings</Text>
              <TouchableOpacity onPress={() => setShowTerminalSettingsModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedTerminal && (
              <View style={styles.modalContent}>
                <View style={styles.terminalIcon}>
                  <Ionicons name="card-outline" size={35} color="#ed7b0e" />
                </View>
                
                <Text style={{fontSize: 26, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: 5}}>
                  {selectedTerminal.name}
                </Text>
                
                <View style={styles.terminalStatus}>
                  <View style={[
                    styles.statusDot, 
                    selectedTerminal.status === 'online' ? styles.onlineStatusDot : styles.offlineStatusDot,
                    {width: 10, height: 10}
                  ]} />
                  <Text style={{fontSize: 16, color: selectedTerminal.status === 'online' ? '#4CD964' : '#FF3B30', fontWeight: '600', marginLeft: 5}}>
                    {selectedTerminal.status === 'online' ? 'Online' : 'Offline'}
                  </Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Last Synced</Text>
                  <Text style={styles.detailsValue}>{selectedTerminal.lastSynced}</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Battery Level</Text>
                  <Text style={styles.detailsValue}>{selectedTerminal.batteryLevel}%</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Today's Transactions</Text>
                  <Text style={styles.detailsValue}>{selectedTerminal.transactionCount}</Text>
                </View>
                
                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Terminal ID</Text>
                  <Text style={styles.detailsValue}>TPZ-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</Text>
                </View>
                
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#000000', marginTop: 20, marginBottom: 10}}>
                  Settings
                </Text>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Auto-sync transactions</Text>
                  <Switch 
                    value={true}
                    trackColor={{ false: "#dedede", true: "#ed7b0e" }}
                    thumbColor={"#FFFFFF"}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Allow contactless payments</Text>
                  <Switch 
                    value={true}
                    trackColor={{ false: "#dedede", true: "#ed7b0e" }}
                    thumbColor={"#FFFFFF"}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Allow QR code payments</Text>
                  <Switch 
                    value={true}
                    trackColor={{ false: "#dedede", true: "#ed7b0e" }}
                    thumbColor={"#FFFFFF"}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Print customer receipts</Text>
                  <Switch 
                    value={false}
                    trackColor={{ false: "#dedede", true: "#ed7b0e" }}
                    thumbColor={"#FFFFFF"}
                  />
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryButton]}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Sync Now</Text>
                  </TouchableOpacity>
                  
                  {selectedTerminal.status === 'offline' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.secondaryButton]}
                    >
                      <Ionicons name="power-outline" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Restart</Text>
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