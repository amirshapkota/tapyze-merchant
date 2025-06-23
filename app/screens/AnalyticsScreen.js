import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import styles from '../styles/AnalyticsScreenStyles';
import paymentService from '../services/merchantPaymentService';
import merchantWalletService from '../services/merchantWalletService';
import merchantDeviceService from '../services/merchantDeviceService';

// Simple bar chart component using View elements
const SimpleBarChart = ({ data, height = 150, color = "#ed7b0e", showValues = true }) => {
  if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data.length) {
    return (
      <View style={{ height, padding: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 14 }}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <View style={{ height, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.datasets[0].data.map((value, index) => (
          <View key={index} style={{ alignItems: 'center', flex: 1 }}>
            {showValues && (
              <Text style={{ fontSize: 10, marginBottom: 5, fontWeight: 'bold' }}>
                {value < 1000 ? Math.round(value) : `${(value/1000).toFixed(1)}k`}
              </Text>
            )}
            <View
              style={{
                width: 20,
                height: maxValue > 0 ? (value / maxValue) * (height - 60) : 5,
                backgroundColor: color,
                borderRadius: 2,
                minHeight: 2,
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 5, color: '#666' }}>
              {data.labels[index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Clean area chart using stacked bars for smoother appearance
const SimpleLineChart = ({ data, height = 220, color = "#ed7b0e" }) => {
  if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data.length) {
    return (
      <View style={{ height, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 14 }}>No data available</Text>
      </View>
    );
  }

  const chartData = data.datasets[0].data;
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue || 1;
  
  return (
    <View style={{ height, backgroundColor: '#fff', borderRadius: 12 }}>
      {/* Values display at top */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingHorizontal: 10,
        paddingBottom: 5
      }}>
        {chartData.map((value, index) => (
          <Text key={index} style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: '#333',
            textAlign: 'center',
            flex: 1
          }}>
            {value < 1000 ? Math.round(value) : `${(value/1000).toFixed(1)}k`}
          </Text>
        ))}
      </View>
      
      {/* Chart area with area fill effect */}
      <View style={{ 
        height: height - 80,
        width: '100%',
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        backgroundColor: '#f8f9fa',
        marginHorizontal: 10,
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 5
      }}>
        {chartData.map((value, index) => {
          const heightPercentage = range > 0 ? ((value - minValue) / range) * 85 + 15 : 50;
          const isHighest = value === maxValue;
          
          return (
            <View key={index} style={{ 
              flex: 1, 
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              marginHorizontal: 1
            }}>
              {/* Area fill bars with gradient effect */}
              <View style={{
                width: '95%',
                height: `${heightPercentage}%`,
                backgroundColor: color,
                opacity: 0.15,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                marginBottom: 3
              }} />
              
              {/* Top line indicator */}
              <View style={{
                width: '95%',
                height: 4,
                backgroundColor: color,
                borderRadius: 2,
                marginBottom: 3
              }} />
              
              {/* Data point dot */}
              <View style={{
                width: isHighest ? 10 : 8,
                height: isHighest ? 10 : 8,
                borderRadius: isHighest ? 5 : 4,
                backgroundColor: isHighest ? color : '#fff',
                borderWidth: 2,
                borderColor: color,
                marginBottom: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }} />
            </View>
          );
        })}
      </View>
      
      {/* X-axis labels */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 5
      }}>
        {data.labels.map((label, index) => (
          <Text key={index} style={{ 
            fontSize: 12, 
            color: '#666',
            fontWeight: '500',
            textAlign: 'center',
            flex: 1
          }}>
            {label}
          </Text>
        ))}
      </View>
      
      {/* Trend indicators */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 15
      }}>
        {chartData.map((value, index) => {
          if (index === 0) return <View key={index} style={{ flex: 1 }} />;
          
          const prevValue = chartData[index - 1];
          const isUp = value > prevValue;
          const isFlat = value === prevValue;
          
          return (
            <View key={index} style={{ 
              alignItems: 'center',
              flex: 1
            }}>
              <Ionicons 
                name={isFlat ? 'remove' : (isUp ? 'trending-up' : 'trending-down')} 
                size={14} 
                color={isFlat ? '#999' : (isUp ? '#28a745' : '#dc3545')} 
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Simple pie chart using View elements
const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 220, padding: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 14 }}>No payment method data</Text>
      </View>
    );
  }

  return (
    <View style={{ height: 220, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, overflow: 'hidden', flexDirection: 'row' }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                width: `${item.population}%`,
                backgroundColor: item.color,
                height: '100%',
              }}
            />
          ))}
        </View>
        <View style={{ marginLeft: 30 }}>
          {data.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: '#666' }}>
                {item.name} ({item.population}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState({
    balance: 0,
    currency: 'Rs.',
    transactions: [],
    scannerCount: 0,
    revenueData: {
      daily: { labels: [], datasets: [{ data: [] }] },
      weekly: { labels: [], datasets: [{ data: [] }] },
      monthly: { labels: [], datasets: [{ data: [] }] }
    },
    stats: {
      totalTransactions: 0,
      averageTransaction: 0,
      todayRevenue: 0,
      weekRevenue: 0
    },
    paymentMethods: [],
    hourlyData: { labels: [], datasets: [{ data: [] }] }
  });
  const [error, setError] = useState(null);

  // Load analytics data from your existing services
  const loadAnalyticsData = async () => {
    try {
      console.log('Loading analytics data...');
      setError(null);

      // Get wallet balance
      const walletResult = await merchantWalletService.getWalletBalance();
      if (!walletResult.success) {
        throw new Error(walletResult.message || 'Failed to load wallet data');
      }

      // Get transaction history
      const transactionResult = await merchantWalletService.getTransactionHistory(1, 100);
      const transactions = transactionResult.success ? transactionResult.transactions || [] : [];

      // Get scanner count (no cards)
      let scannerCount = 0;
      try {
        const scannerResult = await merchantDeviceService.getMerchantScanners();
        if (scannerResult.success) {
          scannerCount = scannerResult.count || 0;
        }
      } catch (scannerError) {
        console.log('Could not fetch scanner data:', scannerError.message);
      }

      // Process the data for analytics
      const processedData = processTransactionData(transactions);

      setAnalyticsData({
        balance: walletResult.balance || 0,
        currency: walletResult.currency || 'Rs.',
        transactions,
        scannerCount,
        ...processedData
      });

    } catch (error) {
      console.error('Analytics loading error:', error);
      setError(error.message || 'Failed to load analytics data');
    }
  };

  // Process transaction data for charts and stats
  const processTransactionData = (transactions) => {
    // Filter successful incoming transactions
    const successfulTransactions = transactions.filter(t => 
      t.status === 'COMPLETED' && (t.type === 'CREDIT' || t.amount > 0)
    );

    // Calculate basic stats
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const averageTransaction = successfulTransactions.length > 0 ? totalRevenue / successfulTransactions.length : 0;

    // Calculate daily data (last 7 days)
    const dailyData = calculateTimeFrameData(successfulTransactions, 'daily', 7);
    
    // Calculate weekly data (last 4 weeks)
    const weeklyData = calculateTimeFrameData(successfulTransactions, 'weekly', 4);
    
    // Calculate monthly data (last 5 months)
    const monthlyData = calculateTimeFrameData(successfulTransactions, 'monthly', 5);

    // Analyze payment methods
    const paymentMethods = analyzePaymentMethods(successfulTransactions);

    // Analyze hourly patterns
    const hourlyData = analyzeHourlyPatterns(successfulTransactions);

    return {
      revenueData: {
        daily: { labels: getDayLabels(), datasets: [{ data: dailyData }] },
        weekly: { labels: getWeekLabels(), datasets: [{ data: weeklyData }] },
        monthly: { labels: getMonthLabels(), datasets: [{ data: monthlyData }] }
      },
      stats: {
        totalTransactions: successfulTransactions.length,
        averageTransaction,
        todayRevenue: dailyData[dailyData.length - 1] || 0,
        weekRevenue: weeklyData[weeklyData.length - 1] || 0
      },
      paymentMethods,
      hourlyData
    };
  };

  // Calculate data for different time frames
  const calculateTimeFrameData = (transactions, timeframe, periods) => {
    const data = Array(periods).fill(0);
    const now = new Date();

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      let periodIndex = -1;

      if (timeframe === 'daily') {
        const daysDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < periods) {
          periodIndex = periods - 1 - daysDiff;
        }
      } else if (timeframe === 'weekly') {
        const weeksDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24 * 7));
        if (weeksDiff >= 0 && weeksDiff < periods) {
          periodIndex = periods - 1 - weeksDiff;
        }
      } else if (timeframe === 'monthly') {
        const monthsDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 + 
                          (now.getMonth() - transactionDate.getMonth());
        if (monthsDiff >= 0 && monthsDiff < periods) {
          periodIndex = periods - 1 - monthsDiff;
        }
      }

      if (periodIndex >= 0 && periodIndex < periods) {
        data[periodIndex] += Math.abs(transaction.amount);
      }
    });

    return data;
  };

  // Analyze payment methods
  const analyzePaymentMethods = (transactions) => {
    if (transactions.length === 0) {
      return [
        { name: 'TAPYZE Card', population: 75, color: '#ed7b0e' },
        { name: 'TAPYZE App', population: 25, color: '#000000' }
      ];
    }

    const methodCounts = {};
    transactions.forEach(transaction => {
      let method = 'TAPYZE App'; // default
      
      // Check for RFID/Card payments
      if (transaction.description?.toLowerCase().includes('rfid') ||
          transaction.description?.toLowerCase().includes('card') ||
          transaction.description?.toLowerCase().includes('tap') ||
          transaction.metadata?.cardUid ||
          transaction.metadata?.transferType === 'RFID_PAYMENT' ||
          transaction.type === 'RFID_PAYMENT') {
        method = 'TAPYZE Card';
      }
      // Check for QR payments
      else if (transaction.description?.toLowerCase().includes('qr') ||
               transaction.metadata?.transferType === 'QR_PAYMENT') {
        method = 'QR Payment';
      }
      // Check for wallet transfers
      else if (transaction.description?.toLowerCase().includes('transfer') ||
               transaction.metadata?.transferType === 'WALLET_TRANSFER') {
        method = 'Wallet Transfer';
      }
      // Check for top-ups (exclude from payment methods)
      else if (transaction.description?.toLowerCase().includes('topup') ||
               transaction.description?.toLowerCase().includes('top-up') ||
               transaction.description?.toLowerCase().includes('deposit')) {
        return; // Skip top-ups as they're not payment methods
      }

      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const total = Object.values(methodCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return [
        { name: 'TAPYZE Card', population: 75, color: '#ed7b0e' },
        { name: 'TAPYZE App', population: 25, color: '#000000' }
      ];
    }

    const colors = ['#ed7b0e', '#000000', '#28a745', '#dc3545'];
    return Object.keys(methodCounts).map((method, index) => ({
      name: method,
      population: Math.round((methodCounts[method] / total) * 100),
      color: colors[index % colors.length]
    }));
  };

  // Analyze hourly patterns
  const analyzeHourlyPatterns = (transactions) => {
    const hourCounts = Array(6).fill(0);
    const hourRanges = [6, 9, 12, 15, 18, 21];

    transactions.forEach(transaction => {
      const hour = new Date(transaction.createdAt).getHours();
      let closestIndex = 0;
      let minDiff = Math.abs(hour - hourRanges[0]);
      
      hourRanges.forEach((rangeHour, index) => {
        const diff = Math.abs(hour - rangeHour);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      if (minDiff <= 2) {
        hourCounts[closestIndex]++;
      }
    });

    return {
      labels: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
      datasets: [{ data: hourCounts }]
    };
  };

  // Helper functions for labels
  const getDayLabels = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en', { weekday: 'short' }));
    }
    return days;
  };

  const getWeekLabels = () => ['W1', 'W2', 'W3', 'W4'];

  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en', { month: 'short' }));
    }
    return months;
  };

  // Get chart data based on selection
  const getChartData = () => {
    const baseData = analyticsData.revenueData[selectedTimeframe];
    
    if (selectedChart === 'transactions') {
      return {
        ...baseData,
        datasets: [{
          data: baseData.datasets[0].data.map(revenue => Math.max(1, Math.floor(revenue / 50)))
        }]
      };
    } else if (selectedChart === 'customers') {
      return {
        ...baseData,
        datasets: [{
          data: baseData.datasets[0].data.map(revenue => Math.max(0, Math.floor(revenue / 100)))
        }]
      };
    }
    
    return baseData;
  };

  // Calculate totals and changes
  const calculateTotal = (data) => {
    if (!data || !data.datasets || !data.datasets[0]) return '0';
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    
    if (selectedChart === 'revenue') {
      return total.toFixed(2);
    }
    return Math.round(total).toString();
  };

  const calculateChange = () => {
    const data = getChartData();
    if (!data || !data.datasets || !data.datasets[0] || data.datasets[0].data.length < 2) {
      return '0.0';
    }
    
    const currentData = data.datasets[0].data;
    const lastValue = currentData[currentData.length - 1];
    const prevValue = currentData[currentData.length - 2];
    
    if (prevValue === 0) return lastValue > 0 ? '100.0' : '0.0';
    
    const percentChange = ((lastValue - prevValue) / prevValue) * 100;
    return percentChange.toFixed(1);
  };

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [])
  );

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadAnalyticsData();
      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, []);

  // Handle navigation
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Export functionality
  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('PDF Export', 'PDF export will be available soon') },
        { text: 'CSV', onPress: () => Alert.alert('CSV Export', 'CSV export will be available soon') }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed7b0e" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
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
              <Text style={styles.merchantLabel}>ANALYTICS</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
            Failed to Load Analytics
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#ed7b0e',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              marginTop: 20
            }}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              loadAnalyticsData().finally(() => setIsLoading(false));
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>TAPYZE</Text>
            <Text style={styles.merchantLabel}>ANALYTICS</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
      
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Business Analytics</Text>
        <Text style={styles.greetingSubtext}>
          Current Balance: {analyticsData.currency} {analyticsData.balance.toFixed(2)}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ed7b0e']}
            tintColor="#ed7b0e"
          />
        }
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          <Text style={styles.sectionTitle}>Transaction Analytics</Text>
          <View style={styles.timeframeSelector}>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'daily' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('daily')}
            >
              <Text style={selectedTimeframe === 'daily' ? styles.timeframeActiveText : styles.timeframeText}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'weekly' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('weekly')}
            >
              <Text style={selectedTimeframe === 'weekly' ? styles.timeframeActiveText : styles.timeframeText}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeOption, selectedTimeframe === 'monthly' && styles.timeframeActive]}
              onPress={() => setSelectedTimeframe('monthly')}
            >
              <Text style={selectedTimeframe === 'monthly' ? styles.timeframeActiveText : styles.timeframeText}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'revenue' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('revenue')}
          >
            <Ionicons 
              name="trending-up" 
              size={18} 
              color={selectedChart === 'revenue' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'revenue' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Revenue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'transactions' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('transactions')}
          >
            <Ionicons 
              name="card" 
              size={18} 
              color={selectedChart === 'transactions' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'transactions' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chartTypeOption, selectedChart === 'customers' && styles.chartTypeActive]}
            onPress={() => setSelectedChart('customers')}
          >
            <Ionicons 
              name="people" 
              size={18} 
              color={selectedChart === 'customers' ? "#FFFFFF" : "#666666"} 
            />
            <Text style={selectedChart === 'customers' ? styles.chartTypeActiveText : styles.chartTypeText}>
              Customers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>
                {selectedChart === 'revenue' && 'Revenue Trend'}
                {selectedChart === 'transactions' && 'Transaction Count'}
                {selectedChart === 'customers' && 'Customer Activity'}
              </Text>
              <Text style={styles.chartSubtitle}>
                {selectedTimeframe === 'daily' && 'Last 7 days'}
                {selectedTimeframe === 'weekly' && 'Last 4 weeks'}
                {selectedTimeframe === 'monthly' && 'Last 5 months'}
              </Text>
            </View>
            <View style={styles.chartMetrics}>
              <Text style={styles.totalValue}>
                {selectedChart === 'revenue' && `${analyticsData.currency} ${calculateTotal(getChartData())}`}
                {selectedChart === 'transactions' && `${calculateTotal(getChartData())} transactions`}
                {selectedChart === 'customers' && `${calculateTotal(getChartData())} customers`}
              </Text>
              <View style={[
                styles.changeBadge, 
                parseFloat(calculateChange()) >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                <Ionicons 
                  name={parseFloat(calculateChange()) >= 0 ? "arrow-up" : "arrow-down"} 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.changeText}>{Math.abs(parseFloat(calculateChange()))}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <SimpleLineChart
              data={getChartData()}
              height={220}
              color="#ed7b0e"
            />
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.transactionsIcon]}>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Transactions</Text>
              <Text style={styles.summaryValue}>{analyticsData.stats.totalTransactions}</Text>
              <View style={styles.summaryChange}>
                <Ionicons name="arrow-up" size={12} color="#28A745" />
                <Text style={[styles.summaryChangeText, styles.positiveChangeText]}>
                {analyticsData.stats.totalTransactions > 0 ? '12%' : '0%'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, styles.averageIcon]}>
            <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Avg. Transaction</Text>
            <Text style={styles.summaryValue}>
              {analyticsData.currency} {analyticsData.stats.averageTransaction.toFixed(2)}
            </Text>
            <View style={styles.summaryChange}>
              <Ionicons name="arrow-up" size={12} color="#28A745" />
              <Text style={[styles.summaryChangeText, styles.positiveChangeText]}>5.3%</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, styles.customersIcon]}>
            <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Scanners</Text>
            <Text style={styles.summaryValue}>{analyticsData.scannerCount}</Text>
            <View style={styles.summaryChange}>
              <Text style={[styles.summaryChangeText, styles.positiveChangeText]}>Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.pieChartCard}>
          <SimplePieChart data={analyticsData.paymentMethods} />
        </View>
      </View>

      {/* Transactions by Hour */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Transactions by Time of Day</Text>
        <View style={styles.barChartCard}>
          <SimpleBarChart
            data={analyticsData.hourlyData}
            height={220}
            color="#000000"
          />
        </View>
      </View>

      {/* Customer Insights */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Customer Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Today's Revenue</Text>
            <View style={styles.insightValue}>
              <Text style={styles.insightNumber}>
                {analyticsData.currency} {analyticsData.stats.todayRevenue.toFixed(2)}
              </Text>
              <View style={styles.insightChange}>
                <Ionicons name="arrow-up" size={12} color="#28A745" />
                <Text style={styles.insightChangePositive}>8%</Text>
              </View>
            </View>
            <Text style={styles.insightDescription}>Revenue earned today</Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>This Week</Text>
            <View style={styles.insightValue}>
              <Text style={styles.insightNumber}>
                {analyticsData.currency} {analyticsData.stats.weekRevenue.toFixed(2)}
              </Text>
              <View style={styles.insightChange}>
                <Ionicons name="arrow-up" size={12} color="#28A745" />
                <Text style={styles.insightChangePositive}>15%</Text>
              </View>
            </View>
            <Text style={styles.insightDescription}>Weekly performance</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.productsCard}>
          {analyticsData.transactions.slice(0, 5).map((transaction, index) => (
            <View key={transaction._id || index} style={styles.productRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.productName}>
                  {transaction.amount > 0 ? 'Payment Received' : 'Payment Sent'}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[
                styles.productRevenue,
                { color: transaction.amount > 0 ? "#28A745" : "#DC3545" }
              ]}>
                {transaction.amount > 0 ? '+' : ''}{analyticsData.currency} {Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
          
          {analyticsData.transactions.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={32} color="#ccc" />
              <Text style={{ color: '#999', fontSize: 14, marginTop: 10 }}>No recent transactions</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 5, textAlign: 'center' }}>
                Your recent payment activity will appear here
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Export Section */}
      <View style={styles.exportSection}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Export Analytics Report</Text>
        </TouchableOpacity>
        <Text style={styles.exportNote}>Export detailed analytics in PDF or CSV format</Text>
      </View>

      {/* Performance Tips */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Performance Tips</Text>
        <View style={styles.productsCard}>
          {analyticsData.stats.totalTransactions === 0 ? (
            <View style={[styles.productRow, { width: '100%' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 5 }}>
                <Ionicons name="bulb-outline" size={20} color="#ed7b0e" style={{ marginRight: 12, marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 14, color: '#333', lineHeight: 20 }}>
                  Start accepting payments to see detailed analytics and insights about your business performance.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.productRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 5 }}>
                  <Ionicons name="trending-up-outline" size={20} color="#28A745" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: '#ed7b0e', fontWeight: '600' }}>Revenue Tip</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: '#333', lineHeight: 20 }}>
                  Your average transaction is {analyticsData.currency} {analyticsData.stats.averageTransaction.toFixed(2)}. 
                  Consider promoting higher-value items to increase revenue.
                </Text>
              </View>

              <View style={styles.productRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 5 }}>
                  <Ionicons name="time-outline" size={20} color="#007bff" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: '#ed7b0e', fontWeight: '600' }}>Operations Tip</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: '#333', lineHeight: 20 }}>
                  Peak transaction times can help you optimize staffing and inventory management.
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
};

export default AnalyticsScreen;