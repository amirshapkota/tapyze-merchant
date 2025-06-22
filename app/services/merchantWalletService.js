import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tapyze.onrender.com/api';

class MerchantWalletService {
  constructor() {
    this.token = null;
    this.currentUserId = null;
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
          console.log('MerchantWalletService: User changed, clearing cached token');
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
    console.log('MerchantWalletService: Clearing cache');
    this.token = null;
    this.currentUserId = null;
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

    // Add auth token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('MerchantWalletService API Call:', endpoint, 'for user:', this.currentUserId);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('MerchantWalletService API Call Error:', error);
      throw error;
    }
  }

  // Find user by phone number (for send/receive functionality)
  async findUserByPhone(phone) {
    try {
      if (!phone) {
        return {
          success: false,
          message: 'Phone number is required'
        };
      }

      // Clean the phone number
      const cleanPhone = phone.replace(/^\+977-?/, '').replace(/\s+/g, '');
      
      const response = await this.apiCall(`/wallet/lookup/${cleanPhone}`);
      
      if (response.status === 'success') {
        return {
          success: true,
          user: response.data.user
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'User not found'
      };
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
      if (!amount || amount <= 0) {
        return {
          success: false,
          message: 'Please provide a valid amount'
        };
      }

      if (amount < 10) {
        return {
          success: false,
          message: 'Minimum top-up amount is Rs. 10'
        };
      }

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

  // Transfer funds using phone number (for send/receive functionality)
  async transferFunds(recipientPhone, recipientType, amount, description) {
    try {
      if (!amount || amount <= 0) {
        return {
          success: false,
          message: 'Please provide a valid amount'
        };
      }

      if (amount < 10) {
        return {
          success: false,
          message: 'Minimum transfer amount is Rs. 10'
        };
      }

      if (!recipientPhone) {
        return {
          success: false,
          message: 'Recipient phone number is required'
        };
      }

      // Validate phone format
      const phoneRegex = /^\+977-?9[0-9]{9}$|^9[0-9]{9}$/;
      if (!phoneRegex.test(recipientPhone)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      const response = await this.apiCall('/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify({
          recipientPhone,
          recipientType,
          amount,
          description
        }),
      });

      if (response.status === 'success') {
        return {
          success: true,
          senderBalance: response.data.senderBalance,
          recipient: response.data.recipient,
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

  // Validate phone number format
  validatePhoneNumber(phone) {
    if (!phone) return false;
    
    // Clean the phone number
    const cleanPhone = phone.replace(/^\+977-?/, '').replace(/\s+/g, '');
    
    // Check if it's a valid Nepali mobile number (9XXXXXXXXX)
    const phoneRegex = /^9[0-9]{9}$/;
    return phoneRegex.test(cleanPhone);
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/^\+977-?/, '').replace(/\s+/g, '');
    
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      return `+977-${cleanPhone}`;
    }
    
    return phone;
  }

  // Helper method to format transaction for merchant display
  formatTransactionForDisplay(transaction) {
    const isCredit = transaction.type === 'CREDIT' || transaction.amount > 0;
    
    let title = 'Transaction';
    let customerName = 'Unknown';
    let method = 'TAPYZE';
    
    // Determine transaction type and details for merchant
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

  // Get dashboard statistics (this was missing and causing the error)
  async getDashboardStats() {
    try {
      console.log('MerchantWalletService: Loading dashboard stats for user:', this.currentUserId);
      
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

      // Calculate merchant-specific stats
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

      // Format transactions for merchant display
      const formattedTransactions = transactions
        .slice(0, 10) // Show latest 10
        .map(t => this.formatTransactionForDisplay(t));

      console.log('MerchantWalletService: Dashboard stats loaded successfully for user:', this.currentUserId);

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
      console.error('MerchantWalletService: Dashboard stats error for user:', this.currentUserId, error);
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