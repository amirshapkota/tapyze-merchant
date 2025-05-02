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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles/StatementsScreenStyles';

// Sample data for statements
const monthlyStatements = [
  { 
    id: '1', 
    month: 'April 2025',
    transactionCount: 98,
    totalRevenue: 4287.50,
    totalFees: 21.44,
    netAmount: 4266.06,
    dateGenerated: '2025-04-30',
    status: 'available'
  },
  { 
    id: '2', 
    month: 'March 2025',
    transactionCount: 112,
    totalRevenue: 5124.75,
    totalFees: 25.62,
    netAmount: 5099.13,
    dateGenerated: '2025-03-31',
    status: 'available'
  },
  { 
    id: '3', 
    month: 'February 2025',
    transactionCount: 86,
    totalRevenue: 3875.25,
    totalFees: 19.38,
    netAmount: 3855.87,
    dateGenerated: '2025-02-28',
    status: 'available'
  },
  { 
    id: '4', 
    month: 'January 2025',
    transactionCount: 92,
    totalRevenue: 4215.80,
    totalFees: 21.08,
    netAmount: 4194.72,
    dateGenerated: '2025-01-31',
    status: 'available'
  },
  { 
    id: '5', 
    month: 'December 2024',
    transactionCount: 128,
    totalRevenue: 6542.35,
    totalFees: 32.71,
    netAmount: 6509.64,
    dateGenerated: '2024-12-31',
    status: 'available'
  },
  { 
    id: '6', 
    month: 'November 2024',
    transactionCount: 102,
    totalRevenue: 4875.45,
    totalFees: 24.38,
    netAmount: 4851.07,
    dateGenerated: '2024-11-30',
    status: 'available'
  },
];

// Sample data for recent payouts
const recentPayouts = [
  {
    id: '1',
    amount: 4266.06,
    date: '2025-04-30',
    account: '•••• 5874',
    status: 'completed'
  },
  {
    id: '2',
    amount: 5099.13,
    date: '2025-03-31',
    account: '•••• 5874',
    status: 'completed'
  },
  {
    id: '3',
    amount: 3855.87,
    date: '2025-02-28',
    account: '•••• 5874',
    status: 'completed'
  }
];

const StatementsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [activeTab, setActiveTab] = useState('statements');
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
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

  // Handle statement selection
  const handleStatementSelect = (statement) => {
    setSelectedStatement(statement);
    setShowStatementModal(true);
  };

  // Render statement item
  const renderStatementItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.statementItem}
      onPress={() => handleStatementSelect(item)}
    >
      <View style={styles.statementIconContainer}>
        <Ionicons name="document-text-outline" size={24} color="#ed7b0e" />
      </View>
      <View style={styles.statementInfo}>
        <Text style={styles.statementMonth}>{item.month} Statement</Text>
        <Text style={styles.statementDate}>Generated on {item.dateGenerated}</Text>
      </View>
      <View style={styles.statementDetails}>
        <Text style={styles.statementAmount}>Rs. {item.netAmount.toFixed(2)}</Text>
        <View style={styles.downloadButton}>
          <Ionicons name="download-outline" size={18} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render payout item
  const renderPayoutItem = ({ item }) => (
    <View style={styles.payoutItem}>
      <View style={styles.payoutIconContainer}>
        <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.payoutInfo}>
        <Text style={styles.payoutAmount}>Rs. {item.amount.toFixed(2)}</Text>
        <Text style={styles.payoutDate}>Transferred on {item.date}</Text>
      </View>
      <View style={styles.payoutDetails}>
        <Text style={styles.payoutAccount}>{item.account}</Text>
        <View style={[
          styles.payoutStatus,
          item.status === 'completed' ? styles.statusCompleted : styles.statusPending
        ]}>
          <Text style={styles.payoutStatusText}>
            {item.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <Text style={styles.merchantLabel}>STATEMENTS</Text>
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
        <Text style={styles.greeting}>Financial Statements</Text>
        <Text style={styles.greetingSubtext}>View and download your statements</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'statements' && styles.activeTabButton]}
          onPress={() => setActiveTab('statements')}
        >
          <Text style={[styles.tabText, activeTab === 'statements' && styles.activeTabText]}>
            Statements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'payouts' && styles.activeTabButton]}
          onPress={() => setActiveTab('payouts')}
        >
          <Text style={[styles.tabText, activeTab === 'payouts' && styles.activeTabText]}>
            Payouts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statements Tab Content */}
      {activeTab === 'statements' && (
        <View style={styles.contentContainer}>
          {/* Monthly Statement Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>April 2025 Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
                <Text style={styles.summaryValue}>Rs. 4,287.50</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Transaction Count</Text>
                <Text style={styles.summaryValue}>98</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Transaction Fees</Text>
                <Text style={styles.summaryValue}>Rs. 21.44</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Amount</Text>
                <Text style={styles.summaryValue}>Rs. 4,266.06</Text>
              </View>
            </View>
          </View>

          {/* Statement List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Statements</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={monthlyStatements}
            renderItem={renderStatementItem}
            keyExtractor={item => item.id}
            style={styles.statementsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Payouts Tab Content */}
      {activeTab === 'payouts' && (
        <ScrollView style={styles.contentContainer}>
          {/* Payout Summary */}
          <View style={styles.payoutSummaryCard}>
            <View style={styles.payoutSummaryHeader}>
              <Text style={styles.payoutSummaryTitle}>Payout Account</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bankAccountInfo}>
              <View style={styles.bankLogoContainer}>
                <Text style={styles.bankLogoText}>NB</Text>
              </View>
              <View style={styles.bankDetails}>
                <Text style={styles.bankName}>Nepal Bank Ltd</Text>
                <Text style={styles.accountNumber}>•••• •••• •••• 5874</Text>
              </View>
            </View>
            <View style={styles.payoutSettingsRow}>
              <Text style={styles.payoutSettingsLabel}>Payout Schedule</Text>
              <Text style={styles.payoutSettingsValue}>Monthly</Text>
            </View>
            <View style={styles.payoutSettingsRow}>
              <Text style={styles.payoutSettingsLabel}>Next Payout Date</Text>
              <Text style={styles.payoutSettingsValue}>May 31, 2025</Text>
            </View>
          </View>

          {/* Recent Payouts */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payouts</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.payoutsList}>
            {recentPayouts.map(payout => (
              <View key={payout.id}>
                {renderPayoutItem({item: payout})}
              </View>
            ))}
          </View>

          {/* Request Manual Payout Button */}
          <TouchableOpacity style={styles.requestPayoutButton}>
            <Ionicons name="cash-outline" size={22} color="#FFFFFF" />
            <Text style={styles.requestPayoutText}>Request Manual Payout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Back to Dashboard Button */}
      <TouchableOpacity 
        style={styles.dashboardButton} 
        onPress={navigateToDashboard}
      >
        <Ionicons name="home-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Statement Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStatementModal}
        onRequestClose={() => setShowStatementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Statement Details</Text>
              <TouchableOpacity onPress={() => setShowStatementModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedStatement && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.statementTitleContainer}>
                  <Ionicons name="document-text" size={40} color="#ed7b0e" />
                  <View style={styles.statementTitleInfo}>
                    <Text style={styles.statementTitleText}>{selectedStatement.month} Statement</Text>
                    <Text style={styles.statementSubtitle}>Generated on {selectedStatement.dateGenerated}</Text>
                  </View>
                </View>
                
                <View style={styles.statementSummaryCard}>
                  <View style={styles.statementSummaryItem}>
                    <Text style={styles.statementSummaryLabel}>Total Revenue</Text>
                    <Text style={styles.statementSummaryValue}>
                      Rs. {selectedStatement.totalRevenue.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.statementSummaryItem}>
                    <Text style={styles.statementSummaryLabel}>Transaction Count</Text>
                    <Text style={styles.statementSummaryValue}>
                      {selectedStatement.transactionCount}
                    </Text>
                  </View>
                  
                  <View style={styles.statementSummaryItem}>
                    <Text style={styles.statementSummaryLabel}>Transaction Fees (0.5%)</Text>
                    <Text style={styles.statementSummaryValue}>
                      Rs. {selectedStatement.totalFees.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.statementSummaryItem, styles.netAmountItem]}>
                    <Text style={styles.netAmountLabel}>Net Amount</Text>
                    <Text style={styles.netAmountValue}>
                      Rs. {selectedStatement.netAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.paymentInfoCard}>
                  <Text style={styles.paymentInfoTitle}>Payment Information</Text>
                  
                  <View style={styles.paymentInfoItem}>
                    <Text style={styles.paymentInfoLabel}>Payment Method</Text>
                    <Text style={styles.paymentInfoValue}>Bank Transfer</Text>
                  </View>
                  
                  <View style={styles.paymentInfoItem}>
                    <Text style={styles.paymentInfoLabel}>Bank Account</Text>
                    <Text style={styles.paymentInfoValue}>Nepal Bank Ltd (•••• 5874)</Text>
                  </View>
                  
                  <View style={styles.paymentInfoItem}>
                    <Text style={styles.paymentInfoLabel}>Payment Date</Text>
                    <Text style={styles.paymentInfoValue}>{selectedStatement.dateGenerated}</Text>
                  </View>
                  
                  <View style={styles.paymentInfoItem}>
                    <Text style={styles.paymentInfoLabel}>Payment Status</Text>
                    <View style={styles.paymentStatusBadge}>
                      <Text style={styles.paymentStatusText}>Completed</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalActionButton}>
                    <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.modalActionText}>Email Statement</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.modalActionButton, styles.downloadActionButton]}>
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.modalActionText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StatementsScreen;