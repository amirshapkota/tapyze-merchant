// services/AnalyticsService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import merchantWalletService from './MerchantWalletService';
import paymentService from './PaymentService';
import merchantDeviceService from './MerchantDeviceService';

const BASE_URL = 'https://tapyze.onrender.com/api';

class AnalyticsService {
  constructor() {
    this.token = null;
    this.currentUserId = null;
    this.cachedAnalytics = null;
    this.lastCacheTime = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Get auth token with user validation
  async getToken() {
    try {
      const token = await AsyncStorage.getItem('merchantToken');
      const userData = await AsyncStorage.getItem('merchantData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // If user changed, clear cached data
        if (this.currentUserId && this.currentUserId !== user._id) {
          console.log('AnalyticsService: User changed, clearing cached data');
          this.clearCache();
        }
        
        this.token = token;
        this.currentUserId = user._id;
        return token;
      }
      
      // Clear if no token
      this.clearCache();
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearCache();
      return null;
    }
  }

  // Clear service cache
  clearCache() {
    console.log('AnalyticsService: Clearing cache');
    this.token = null;
    this.currentUserId = null;
    this.cachedAnalytics = null;
    this.lastCacheTime = null;
  }

  // Check if cached data is still valid
  isCacheValid() {
    if (!this.cachedAnalytics || !this.lastCacheTime) {
      return false;
    }
    return (Date.now() - this.lastCacheTime) < this.CACHE_DURATION;
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('AnalyticsService API Call:', endpoint, 'for user:', this.currentUserId);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('AnalyticsService API Call Error:', error);
      throw error;
    }
  }

  // Get comprehensive analytics data
  async getComprehensiveAnalytics(forceRefresh = false) {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid()) {
        console.log('AnalyticsService: Returning cached analytics data');
        return {
          success: true,
          data: this.cachedAnalytics,
          cached: true
        };
      }

      console.log('AnalyticsService: Fetching fresh analytics data for user:', this.currentUserId);

      // Fetch data from multiple sources
      const [
        walletBalance,
        transactionHistory,
        merchantTransactions,
        deviceScanners,
        deviceCards,
        paymentStats
      ] = await Promise.allSettled([
        merchantWalletService.getWalletBalance(),
        merchantWalletService.getTransactionHistory(1, 200), // Get more transactions
        paymentService.getMerchantTransactions(1, 100),
        merchantDeviceService.getMerchantScanners(),
        merchantDeviceService.getMerchantCards(),
        this.getPaymentStatistics()
      ]);

      // Process results safely
      const walletData = walletBalance.status === 'fulfilled' ? walletBalance.value : { success: false };
      const transactionData = transactionHistory.status === 'fulfilled' ? transactionHistory.value : { success: false };
      const merchantTxData = merchantTransactions.status === 'fulfilled' ? merchantTransactions.value : { success: false };
      const scannersData = deviceScanners.status === 'fulfilled' ? deviceScanners.value : { success: false };
      const cardsData = deviceCards.status === 'fulfilled' ? deviceCards.value : { success: false };
      const statsData = paymentStats.status === 'fulfilled' ? paymentStats.value : { success: false };

      // Combine transaction data from different sources
      const allTransactions = [
        ...(transactionData.success ? transactionData.transactions || [] : []),
        ...(merchantTxData.success ? merchantTxData.transactions || [] : [])
      ];

      // Remove duplicates based on transaction ID
      const uniqueTransactions = allTransactions.filter((tx, index, self) => 
        index === self.findIndex(t => t._id === tx._id)
      );

      // Process analytics
      const analyticsData = this.processAnalyticsData({
        balance: walletData.success ? walletData.balance || 0 : 0,
        currency: walletData.success ? walletData.currency || 'Rs.' : 'Rs.',
        transactions: uniqueTransactions,
        scanners: scannersData.success ? scannersData.scanners || [] : [],
        cards: cardsData.success ? cardsData.cards || [] : [],
        paymentStats: statsData.success ? statsData.data : null
      });

      // Cache the results
      this.cachedAnalytics = analyticsData;
      this.lastCacheTime = Date.now();

      console.log('AnalyticsService: Analytics data processed and cached for user:', this.currentUserId);

      return {
        success: true,
        data: analyticsData,
        cached: false
      };

    } catch (error) {
      console.error('AnalyticsService: Error getting comprehensive analytics:', error);
      return {
        success: false,
        message: error.message || 'Failed to load analytics data',
        data: this.getDefaultAnalyticsData()
      };
    }
  }

  // Get payment statistics (if API supports it)
  async getPaymentStatistics() {
    try {
      // Try to get backend payment statistics
      const response = await this.apiCall('/analytics/merchant/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.log('AnalyticsService: Backend analytics not available, using local calculation');
      return { success: false };
    }
  }

  // Process raw data into analytics format
  processAnalyticsData(rawData) {
    const { balance, currency, transactions, scanners, cards, paymentStats } = rawData;

    // Filter successful credit transactions
    const successfulTransactions = transactions.filter(t => 
      t.status === 'COMPLETED' && (t.type === 'CREDIT' || t.amount > 0)
    );

    // Calculate time-based data
    const timeBasedAnalytics = this.calculateTimeBasedAnalytics(successfulTransactions);
    
    // Calculate summary statistics
    const summaryStats = this.calculateSummaryStats(successfulTransactions);
    
    // Analyze payment methods
    const paymentMethods = this.analyzePaymentMethods(successfulTransactions);
    
    // Analyze transactions by hour
    const hourlyData = this.analyzeHourlyTransactions(successfulTransactions);
    
    // Device statistics
    const deviceStats = {
      scanners: scanners.length,
      cards: cards.length,
      activeScanners: scanners.filter(s => s.status === 'ACTIVE').length,
      activeCards: cards.filter(c => c.status === 'ACTIVE').length
    };

    // Generate insights
    const insights = this.generateBusinessInsights(successfulTransactions, summaryStats);

    return {
      balance,
      currency,
      transactions: successfulTransactions,
      deviceStats,
      summaryStats,
      timeBasedAnalytics,
      paymentMethods,
      hourlyData,
      insights,
      lastUpdated: new Date().toISOString(),
      totalDataPoints: successfulTransactions.length
    };
  }

  // Calculate time-based analytics (daily, weekly, monthly)
  calculateTimeBasedAnalytics(transactions) {
    const now = new Date();
    
    // Daily data (last 7 days)
    const dailyData = this.getTimeSeriesData(transactions, 'daily', 7);
    
    // Weekly data (last 4 weeks)
    const weeklyData = this.getTimeSeriesData(transactions, 'weekly', 4);
    
    // Monthly data (last 6 months)
    const monthlyData = this.getTimeSeriesData(transactions, 'monthly', 6);

    return {
      daily: {
        labels: this.getDailyLabels(7),
        revenue: dailyData.revenue,
        transactions: dailyData.transactions,
        customers: dailyData.customers
      },
      weekly: {
        labels: this.getWeeklyLabels(4),
        revenue: weeklyData.revenue,
        transactions: weeklyData.transactions,
        customers: weeklyData.customers
      },
      monthly: {
        labels: this.getMonthlyLabels(6),
        revenue: monthlyData.revenue,
        transactions: monthlyData.transactions,
        customers: monthlyData.customers
      }
    };
  }

  // Get time series data for a specific period
  getTimeSeriesData(transactions, period, count) {
    const revenue = Array(count).fill(0);
    const transactionCounts = Array(count).fill(0);
    const customerSets = Array(count).fill(null).map(() => new Set());
    const now = new Date();

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      let periodIndex = -1;

      if (period === 'daily') {
        const daysDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < count) {
          periodIndex = count - 1 - daysDiff;
        }
      } else if (period === 'weekly') {
        const weeksDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24 * 7));
        if (weeksDiff >= 0 && weeksDiff < count) {
          periodIndex = count - 1 - weeksDiff;
        }
      } else if (period === 'monthly') {
        const monthsDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 + 
                          (now.getMonth() - transactionDate.getMonth());
        if (monthsDiff >= 0 && monthsDiff < count) {
          periodIndex = count - 1 - monthsDiff;
        }
      }

      if (periodIndex >= 0 && periodIndex < count) {
        revenue[periodIndex] += Math.abs(transaction.amount);
        transactionCounts[periodIndex]++;
        
        // Track unique customers
        const customerId = transaction.metadata?.customer?.id || 
                          transaction.metadata?.sender?.id || 
                          transaction.metadata?.cardUid ||
                          'anonymous';
        customerSets[periodIndex].add(customerId);
      }
    });

    return {
      revenue,
      transactions: transactionCounts,
      customers: customerSets.map(set => set.size)
    };
  }

  // Calculate summary statistics
  calculateSummaryStats(transactions) {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalRevenue: 0,
        averageTransaction: 0,
        uniqueCustomers: 0,
        returningCustomers: 0,
        customerRetention: 0,
        topTransactionDay: null,
        peakHour: null
      };
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const averageTransaction = totalRevenue / transactions.length;

    // Analyze customers
    const customerTransactions = {};
    transactions.forEach(transaction => {
      const customerId = transaction.metadata?.customer?.id || 
                        transaction.metadata?.sender?.id || 
                        transaction.metadata?.cardUid ||
                        'anonymous';
      
      if (!customerTransactions[customerId]) {
        customerTransactions[customerId] = [];
      }
      customerTransactions[customerId].push(transaction);
    });

    const uniqueCustomers = Object.keys(customerTransactions).length;
    const returningCustomers = Object.values(customerTransactions).filter(txs => txs.length > 1).length;
    const customerRetention = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;

    // Find peak day and hour
    const dayRevenue = {};
    const hourCounts = Array(24).fill(0);

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const dayKey = date.toDateString();
      const hour = date.getHours();

      dayRevenue[dayKey] = (dayRevenue[dayKey] || 0) + Math.abs(transaction.amount);
      hourCounts[hour]++;
    });

    const topTransactionDay = Object.keys(dayRevenue).reduce((a, b) => 
      dayRevenue[a] > dayRevenue[b] ? a : b, Object.keys(dayRevenue)[0]);
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      totalTransactions: transactions.length,
      totalRevenue,
      averageTransaction,
      uniqueCustomers,
      returningCustomers,
      customerRetention,
      topTransactionDay,
      peakHour
    };
  }

  // Analyze payment methods
  analyzePaymentMethods(transactions) {
    if (transactions.length === 0) {
      return [
        { name: 'TAPYZE Card', population: 75, color: '#ed7b0e', count: 0 },
        { name: 'TAPYZE App', population: 25, color: '#000000', count: 0 }
      ];
    }

    const methodCounts = {};
    
    transactions.forEach(transaction => {
      let method = 'TAPYZE App'; // default
      
      if (transaction.description?.toLowerCase().includes('card') || 
          transaction.description?.toLowerCase().includes('rfid') ||
          transaction.description?.toLowerCase().includes('tap')) {
        method = 'TAPYZE Card';
      } else if (transaction.description?.toLowerCase().includes('qr')) {
        method = 'QR Payment';
      } else if (transaction.metadata?.transferType) {
        method = 'Wallet Transfer';
      } else if (transaction.description?.toLowerCase().includes('topup') ||
                transaction.description?.toLowerCase().includes('top-up')) {
        method = 'Top-up';
      }

      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const total = transactions.length;
    const colors = ['#ed7b0e', '#000000', '#28a745', '#dc3545', '#6f42c1'];
    
    return Object.keys(methodCounts).map((method, index) => ({
      name: method,
      population: Math.round((methodCounts[method] / total) * 100),
      color: colors[index % colors.length],
      count: methodCounts[method]
    }));
  }

  // Analyze hourly transaction patterns
  analyzeHourlyTransactions(transactions) {
    const hourLabels = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
    const hourRanges = [6, 9, 12, 15, 18, 21];
    const hourCounts = Array(6).fill(0);

    transactions.forEach(transaction => {
      const hour = new Date(transaction.createdAt).getHours();
      
      // Find the closest hour range
      let closestIndex = 0;
      let minDiff = Math.abs(hour - hourRanges[0]);
      
      hourRanges.forEach((rangeHour, index) => {
        const diff = Math.abs(hour - rangeHour);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      if (minDiff <= 2) { // Within 2 hours of the range
        hourCounts[closestIndex]++;
      }
    });

    return {
      labels: hourLabels,
      datasets: [{ data: hourCounts }]
    };
  }

  // Generate business insights
  generateBusinessInsights(transactions, summaryStats) {
    const insights = [];

    if (transactions.length === 0) {
      insights.push({
        type: 'getting_started',
        title: 'Welcome to TAPYZE Analytics',
        message: 'Start accepting payments to see detailed business insights and analytics.',
        priority: 'high',
        actionable: true
      });
      return insights;
    }

    // Revenue insights
    if (summaryStats.averageTransaction > 0) {
      if (summaryStats.averageTransaction < 50) {
        insights.push({
          type: 'revenue_optimization',
          title: 'Increase Average Transaction Value',
          message: `Your average transaction is Rs. ${summaryStats.averageTransaction.toFixed(2)}. Consider bundling products or upselling to increase revenue.`,
          priority: 'medium',
          actionable: true
        });
      } else {
        insights.push({
          type: 'revenue_success',
          title: 'Strong Average Transaction Value',
          message: `Great! Your average transaction of Rs. ${summaryStats.averageTransaction.toFixed(2)} is above average.`,
          priority: 'low',
          actionable: false
        });
      }
    }

    // Customer retention insights
    if (summaryStats.customerRetention < 30) {
      insights.push({
        type: 'customer_retention',
        title: 'Improve Customer Retention',
        message: `Only ${summaryStats.customerRetention.toFixed(1)}% of customers return. Consider loyalty programs or follow-up marketing.`,
        priority: 'high',
        actionable: true
      });
    } else if (summaryStats.customerRetention > 60) {
      insights.push({
        type: 'customer_success',
        title: 'Excellent Customer Retention',
        message: `${summaryStats.customerRetention.toFixed(1)}% customer retention rate is excellent!`,
        priority: 'low',
        actionable: false
      });
    }

    // Peak time insights
    if (summaryStats.peakHour !== null) {
      const peakHourDisplay = summaryStats.peakHour === 0 ? '12am' : 
                             summaryStats.peakHour <= 12 ? `${summaryStats.peakHour}am` : 
                             `${summaryStats.peakHour - 12}pm`;
      
      insights.push({
        type: 'operational',
        title: 'Peak Business Hour',
        message: `Your busiest hour is ${peakHourDisplay}. Ensure adequate staffing during peak times.`,
        priority: 'medium',
        actionable: true
      });
    }

    // Transaction volume insights
    const recentTransactions = transactions.filter(t => {
      const daysDiff = (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    if (recentTransactions.length === 0 && transactions.length > 0) {
      insights.push({
        type: 'activity_warning',
        title: 'No Recent Activity',
        message: 'No transactions in the past 7 days. Consider promotional activities to boost sales.',
        priority: 'high',
        actionable: true
      });
    }

    return insights;
  }

  // Helper methods for labels
  getDailyLabels(days) {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
    }
    return labels;
  }

  getWeeklyLabels(weeks) {
    const labels = [];
    for (let i = weeks; i >= 1; i--) {
      labels.push(`W${i}`);
    }
    return labels.reverse();
  }

  getMonthlyLabels(months) {
    const labels = [];
    const today = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleDateString('en', { month: 'short' }));
    }
    return labels;
  }

  // Get default analytics data for error cases
  getDefaultAnalyticsData() {
    return {
      balance: 0,
      currency: 'Rs.',
      transactions: [],
      deviceStats: {
        scanners: 0,
        cards: 0,
        activeScanners: 0,
        activeCards: 0
      },
      summaryStats: {
        totalTransactions: 0,
        totalRevenue: 0,
        averageTransaction: 0,
        uniqueCustomers: 0,
        returningCustomers: 0,
        customerRetention: 0,
        topTransactionDay: null,
        peakHour: null
      },
      timeBasedAnalytics: {
        daily: { labels: this.getDailyLabels(7), revenue: Array(7).fill(0), transactions: Array(7).fill(0), customers: Array(7).fill(0) },
        weekly: { labels: this.getWeeklyLabels(4), revenue: Array(4).fill(0), transactions: Array(4).fill(0), customers: Array(4).fill(0) },
        monthly: { labels: this.getMonthlyLabels(6), revenue: Array(6).fill(0), transactions: Array(6).fill(0), customers: Array(6).fill(0) }
      },
      paymentMethods: [
        { name: 'TAPYZE Card', population: 75, color: '#ed7b0e', count: 0 },
        { name: 'TAPYZE App', population: 25, color: '#000000', count: 0 }
      ],
      hourlyData: {
        labels: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
        datasets: [{ data: Array(6).fill(0) }]
      },
      insights: [{
        type: 'getting_started',
        title: 'Welcome to Analytics',
        message: 'Start processing payments to see detailed business insights.',
        priority: 'high',
        actionable: true
      }],
      lastUpdated: new Date().toISOString(),
      totalDataPoints: 0
    };
  }

  // Export analytics data
  async exportAnalyticsData(format = 'json', dateRange = null) {
    try {
      const analyticsResult = await this.getComprehensiveAnalytics();
      
      if (!analyticsResult.success) {
        throw new Error(analyticsResult.message);
      }

      const data = analyticsResult.data;
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      } else if (format === 'json') {
        return {
          success: true,
          data: JSON.stringify(data, null, 2),
          filename: `tapyze-analytics-${new Date().toISOString().split('T')[0]}.json`
        };
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Export failed'
      };
    }
  }

  // Convert analytics data to CSV format
  convertToCSV(data) {
    const csvData = [];
    
    // Summary statistics
    csvData.push(['Summary Statistics']);
    csvData.push(['Total Transactions', data.summaryStats.totalTransactions]);
    csvData.push(['Total Revenue', `${data.currency} ${data.summaryStats.totalRevenue.toFixed(2)}`]);
    csvData.push(['Average Transaction', `${data.currency} ${data.summaryStats.averageTransaction.toFixed(2)}`]);
    csvData.push(['Unique Customers', data.summaryStats.uniqueCustomers]);
    csvData.push(['Customer Retention', `${data.summaryStats.customerRetention.toFixed(1)}%`]);
    csvData.push([]);

    // Daily revenue data
    csvData.push(['Daily Revenue (Last 7 Days)']);
    csvData.push(['Day', 'Revenue', 'Transactions', 'Customers']);
    data.timeBasedAnalytics.daily.labels.forEach((label, index) => {
      csvData.push([
        label,
        `${data.currency} ${data.timeBasedAnalytics.daily.revenue[index].toFixed(2)}`,
        data.timeBasedAnalytics.daily.transactions[index],
        data.timeBasedAnalytics.daily.customers[index]
      ]);
    });
    csvData.push([]);

    // Payment methods
    csvData.push(['Payment Methods']);
    csvData.push(['Method', 'Percentage', 'Count']);
    data.paymentMethods.forEach(method => {
      csvData.push([method.name, `${method.population}%`, method.count]);
    });

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return {
      success: true,
      data: csvString,
      filename: `tapyze-analytics-${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  // Get real-time stats (for dashboard widgets)
  async getRealTimeStats() {
    try {
      const today = new Date().toDateString();
      const analyticsResult = await this.getComprehensiveAnalytics();
      
      if (!analyticsResult.success) {
        return {
          success: false,
          message: analyticsResult.message
        };
      }

      const data = analyticsResult.data;
      const todayTransactions = data.transactions.filter(t => 
        new Date(t.createdAt).toDateString() === today
      );

      const todayRevenue = todayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        success: true,
        data: {
          todayTransactions: todayTransactions.length,
          todayRevenue,
          currentBalance: data.balance,
          activeDevices: data.deviceStats.activeScanners + data.deviceStats.activeCards,
          currency: data.currency
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get real-time stats'
      };
    }
  }

  // Force refresh analytics data
  async refreshAnalytics() {
    this.clearCache();
    return await this.getComprehensiveAnalytics(true);
  }
}

// Create and export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;