import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tapyze.onrender.com/api';

class MerchantWalletService {
  constructor() {
    this.token = null;
    this.currentUserId = null; // Track current user ID
  }

  // Get auth token with user validation
  async getToken() {
    try {
      const token = await AsyncStorage.getItem('merchantToken');
      const userData = await AsyncStorage.getItem('merchantData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // If user changed, clear cached token
        if (this.currentUserId && this.currentUserId !== user._id) {
          console.log('WalletService: User changed, clearing cached token');
          this.token = null;
          this.currentUserId = null;
        }
        
        this.token = token;
        this.currentUserId = user._id;
        return token;
      }
      
      // Clear if no token
      this.token = null;
      this.currentUserId = null;
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      this.token = null;
      this.currentUserId = null;
      return null;
    }
  }

  // Clear service cache (call this on logout)
  clearCache() {
    console.log('WalletService: Clearing cache');
    this.token = null;
    this.currentUserId = null;
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = await this.getToken(); // Always get fresh token
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('WalletService API Call:', endpoint, 'for user:', this.currentUserId);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      const response = await this.apiCall('/wallet/balance');
      
      if (response.status === 'success') {
        return {
          success: true,
          balance: response.data.balance,
          currency: response.data.currency
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get wallet balance'
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(page = 1, limit = 10) {
    try {
      const response = await this.apiCall(`/wallet/transactions?page=${page}&limit=${limit}`);
      
      if (response.status === 'success') {
        return {
          success: true,
          transactions: response.data.transactions,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get transaction history'
      };
    }
  }

  // Top up wallet
  async topUpWallet(amount) {
    try {
      const response = await this.apiCall('/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          balance: response.data.balance,
          transaction: response.data.transaction,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to top up wallet'
      };
    }
  }

  // Transfer funds
  async transferFunds(recipientId, recipientType, amount, description = '') {
    try {
      const response = await this.apiCall('/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify({
          recipientId,
          recipientType,
          amount,
          description
        }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          balance: response.data.senderBalance,
          transaction: response.data.transaction,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to transfer funds'
      };
    }
  }

  // Helper method to format transaction for display
  formatTransactionForDisplay(transaction) {
    const isCredit = transaction.type === 'CREDIT' || transaction.amount > 0;
    
    let title = 'Transaction';
    let customerName = 'Unknown';
    let method = 'TAPYZE';
    
    // Determine transaction type and details
    if (transaction.metadata?.transferType === 'INCOMING') {
      title = 'Payment Received';
      customerName = transaction.metadata.sender?.name || 'Customer';
      method = 'TAPYZE Transfer';
    } else if (transaction.metadata?.transferType === 'OUTGOING') {
      title = 'Payment Sent';
      customerName = transaction.metadata.recipient?.name || 'Recipient';
      method = 'TAPYZE Transfer';
    } else if (transaction.description?.includes('top-up')) {
      title = 'Wallet Top-up';
      customerName = 'Self';
      method = 'Direct Deposit';
    } else if (transaction.description?.includes('tap')) {
      title = 'Tap Payment';
      method = 'TAPYZE Card';
    } else if (transaction.description?.includes('qr')) {
      title = 'QR Code Payment';
      method = 'TAPYZE App';
    }

    return {
      id: transaction._id,
      type: isCredit ? 'receive' : 'refund',
      title,
      customerName,
      amount: Math.abs(transaction.amount),
      date: new Date(transaction.createdAt).toISOString().split('T')[0],
      method,
      status: transaction.status,
      reference: transaction.reference,
      description: transaction.description,
      rawTransaction: transaction
    };
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      console.log('WalletService: Loading dashboard stats for user:', this.currentUserId);
      
      const [balanceResult, transactionsResult] = await Promise.all([
        this.getWalletBalance(),
        this.getTransactionHistory(1, 50) // Get more transactions for stats
      ]);

      if (!balanceResult.success || !transactionsResult.success) {
        return {
          success: false,
          message: 'Failed to load dashboard data'
        };
      }

      const transactions = transactionsResult.transactions;
      const balance = balanceResult.balance;

      // Calculate stats
      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const todayTransactions = transactions.filter(t => 
        new Date(t.createdAt).toDateString() === today && t.amount > 0
      );
      
      const weekTransactions = transactions.filter(t => 
        new Date(t.createdAt) >= thisWeek && t.amount > 0
      );
      
      const monthTransactions = transactions.filter(t => 
        new Date(t.createdAt) >= thisMonth && t.amount > 0
      );

      const creditTransactions = transactions.filter(t => t.amount > 0);
      const totalRevenue = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageTransaction = creditTransactions.length > 0 ? totalRevenue / creditTransactions.length : 0;

      // Format transactions for display
      const formattedTransactions = transactions
        .slice(0, 10) // Show latest 10
        .map(t => this.formatTransactionForDisplay(t));

      console.log('WalletService: Dashboard stats loaded successfully for user:', this.currentUserId);

      return {
        success: true,
        data: {
          balance,
          currency: balanceResult.currency,
          stats: {
            today: {
              transactions: todayTransactions.length,
              revenue: todayTransactions.reduce((sum, t) => sum + t.amount, 0)
            },
            week: {
              transactions: weekTransactions.length,
              revenue: weekTransactions.reduce((sum, t) => sum + t.amount, 0)
            },
            month: {
              transactions: monthTransactions.length,
              revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0)
            },
            total: {
              transactions: creditTransactions.length,
              revenue: totalRevenue,
              average: averageTransaction
            }
          },
          recentTransactions: formattedTransactions
        }
      };
    } catch (error) {
      console.error('WalletService: Dashboard stats error for user:', this.currentUserId, error);
      return {
        success: false,
        message: error.message || 'Failed to load dashboard data'
      };
    }
  }
}

// Create and export a singleton instance
const merchantWalletService = new MerchantWalletService();
export default merchantWalletService;