// services/PaymentService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tapyze.onrender.com/api';

class PaymentService {
  constructor() {
    this.token = null;
    this.CURRENCY = 'Rs.';
    this.MIN_AMOUNT = 0;
    this.PIN_LENGTH = 4;
    this.MAX_TRANSACTION_TIMEOUT = 30000;
  }

  // Get auth token
  async getToken() {
    if (this.token) return this.token;
    
    try {
      const token = await AsyncStorage.getItem('merchantToken');
      if (token) {
        this.token = token;
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
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

  /**
   * Verify RFID card without PIN
   * @param {string} cardUid - Card UID from scanner
   * @returns {Promise<Object>} Verification result
   */
  async verifyCard(cardUid) {
    try {
      console.log('Verifying card:', cardUid);
      
      if (!cardUid || typeof cardUid !== 'string' || cardUid.trim().length === 0) {
        return {
          success: false,
          message: 'Invalid card UID provided'
        };
      }

      const cleanCardUid = cardUid.trim().toUpperCase();
      
      const response = await this.apiCall(`/payments/rfid/verify/${cleanCardUid}`, {
        method: 'GET'
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            uid: cleanCardUid,
            status: response.data.cardStatus,
            cardStatus: response.data.status,
            expiryDate: response.data.expiryDate,
            lastUsed: response.data.lastUsed,
            balance: response.data.balance,
            requiresPinChange: response.data.requiresPinChange
          }
        };
      } else {
        return {
          success: false,
          message: response.message || 'Card verification failed'
        };
      }
    } catch (error) {
      console.error('Card verification error:', error);
      
      if (error.message.includes('404')) {
        return {
          success: false,
          message: 'Card not found in system'
        };
      } else if (error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Network error during card verification'
        };
      } else {
        return {
          success: false,
          message: error.message || 'Card verification failed'
        };
      }
    }
  }

  /**
   * Process RFID payment with PIN
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      const { cardUid, pin, amount, description } = paymentData;
      
      console.log('=== PAYMENT PROCESSING ===');
      console.log('Card UID:', cardUid);
      console.log('Amount:', amount);
      console.log('PIN length:', pin?.length);

      // Validate payment data
      const validation = this.validatePaymentData(paymentData);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Check authentication
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in again.'
        };
      }

      // Prepare request payload
      const payload = {
        cardUid: cardUid.trim(),
        pin: pin.toString(),
        amount: parseFloat(amount),
        description: description || `Payment at merchant - ${new Date().toLocaleString()}`
      };

      console.log('Payment payload:', JSON.stringify(payload, null, 2));

      const response = await this.apiCall('/payments/rfid/process', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            amount: response.data.amount,
            customerBalance: response.data.customerBalance,
            merchantBalance: response.data.merchantBalance,
            transactionReference: response.data.transactionReference,
            customerTransaction: response.data.customerTransaction,
            merchantTransaction: response.data.merchantTransaction
          },
          message: response.message
        };
      } else {
        return this.handlePaymentFailure(response);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return this.handlePaymentError(error);
    }
  }

  /**
   * Check card balance with PIN verification
   * @param {string} cardUid - Card UID
   * @param {string} pin - Card PIN
   * @returns {Promise<Object>} Balance check result
   */
  async checkCardBalance(cardUid, pin) {
    try {
      const response = await this.apiCall('/payments/rfid/balance', {
        method: 'POST',
        body: JSON.stringify({ cardUid, pin })
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            balance: response.data.balance,
            cardStatus: response.data.cardStatus,
            expiryDate: response.data.expiryDate,
            lastUsed: response.data.lastUsed
          },
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to check balance'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Balance check failed'
      };
    }
  }

  /**
   * Get card transaction history
   * @param {string} cardUid - Card UID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Transaction history result
   */
  async getCardTransactionHistory(cardUid, page = 1, limit = 20) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await this.apiCall(`/payments/rfid/${cardUid}/transactions?${queryParams}`);

      if (response.status === 'success') {
        return {
          success: true,
          transactions: response.data.transactions,
          pagination: response.data.pagination,
          count: response.results
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get transaction history'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Transaction history fetch failed'
      };
    }
  }

  /**
   * Refund a payment transaction
   * @param {string} transactionId - Transaction ID to refund
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(transactionId, reason = null) {
    try {
      const response = await this.apiCall(`/payments/rfid/refund/${transactionId}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            refundTransaction: response.data.refundTransaction,
            refundAmount: response.data.refundAmount,
            customerNewBalance: response.data.customerNewBalance,
            merchantNewBalance: response.data.merchantNewBalance
          },
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message || 'Refund failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Refund processing failed'
      };
    }
  }

  /**
   * Get merchant's payment statistics
   * @param {Object} filters - Date and other filters
   * @returns {Promise<Object>} Statistics result
   */
  async getPaymentStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await this.apiCall(`/payments/merchant/statistics?${queryParams}`);

      if (response.status === 'success') {
        return {
          success: true,
          statistics: response.data.statistics,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get statistics'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Statistics fetch failed'
      };
    }
  }

  /**
   * Get merchant's recent transactions
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Transaction filters
   * @returns {Promise<Object>} Transactions result
   */
  async getMerchantTransactions(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.apiCall(`/payments/merchant/transactions?${queryParams}`);

      if (response.status === 'success') {
        return {
          success: true,
          transactions: response.data.transactions,
          pagination: response.data.pagination,
          count: response.results
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get transactions'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Transactions fetch failed'
      };
    }
  }

  /**
   * Validate payment data
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const { cardUid, pin, amount } = paymentData;

    if (!cardUid || typeof cardUid !== 'string' || cardUid.trim().length === 0) {
      return {
        valid: false,
        message: 'Invalid card UID'
      };
    }

    if (!pin || pin.length !== this.PIN_LENGTH) {
      return {
        valid: false,
        message: `PIN must be exactly ${this.PIN_LENGTH} digits`
      };
    }

    if (!/^\d+$/.test(pin)) {
      return {
        valid: false,
        message: 'PIN must contain only numbers'
      };
    }

    if (!amount || parseFloat(amount) <= this.MIN_AMOUNT) {
      return {
        valid: false,
        message: 'Invalid payment amount'
      };
    }

    return { valid: true };
  }

  /**
   * Handle payment failure responses from backend
   * @param {Object} response - Backend response
   * @returns {Object} Formatted error response
   */
  handlePaymentFailure(response) {
    const message = response.message || 'Payment processing failed';

    // Handle PIN-related errors
    if (message.toLowerCase().includes('pin')) {
      if (response.data && typeof response.data.remainingAttempts === 'number') {
        if (response.data.isLocked) {
          return {
            success: false,
            message: 'Card is locked due to too many failed PIN attempts',
            type: 'CARD_LOCKED'
          };
        } else {
          return {
            success: false,
            message: `Invalid PIN. ${response.data.remainingAttempts} attempts remaining.`,
            type: 'INVALID_PIN',
            data: {
              remainingAttempts: response.data.remainingAttempts
            }
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid PIN. Please try again.',
          type: 'INVALID_PIN'
        };
      }
    }
    // Handle insufficient funds
    else if (message.toLowerCase().includes('insufficient')) {
      return {
        success: false,
        message: 'Insufficient funds in customer wallet',
        type: 'INSUFFICIENT_FUNDS'
      };
    }
    // Handle card-related errors
    else if (message.toLowerCase().includes('card')) {
      return {
        success: false,
        message: message,
        type: 'CARD_ERROR'
      };
    }
    // Handle validation errors
    else if (message.toLowerCase().includes('required') || message.toLowerCase().includes('invalid')) {
      return {
        success: false,
        message: `Validation Error: ${message}`,
        type: 'VALIDATION_ERROR'
      };
    }
    // Generic error
    else {
      return {
        success: false,
        message: message,
        type: 'PAYMENT_ERROR'
      };
    }
  }

  /**
   * Handle payment network/system errors
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  handlePaymentError(error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. Please try again.',
        type: 'TIMEOUT'
      };
    } else if (error.message.includes('Network request failed') || error.message.includes('timeout')) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        type: 'NETWORK_ERROR'
      };
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return {
        success: false,
        message: 'Session expired. Please log in again.',
        type: 'AUTH_ERROR'
      };
    } else if (error.message.includes('400')) {
      return {
        success: false,
        message: `Validation error: ${error.message}`,
        type: 'VALIDATION_ERROR'
      };
    } else if (error.message.includes('500')) {
      return {
        success: false,
        message: 'Server error. Please try again later.',
        type: 'SERVER_ERROR'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred. Please try again.',
        type: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Format amount for display
   * @param {string|number} value - Amount value
   * @returns {string} Formatted amount
   */
  formatAmount(value) {
    if (!value || value === '') return '0.00';
    const numValue = parseFloat(value);
    return numValue.toFixed(2);
  }

  /**
   * Get currency symbol
   * @returns {string} Currency symbol
   */
  getCurrency() {
    return this.CURRENCY;
  }

  /**
   * Get PIN length requirement
   * @returns {number} PIN length
   */
  getPinLength() {
    return this.PIN_LENGTH;
  }

  /**
   * Get minimum amount
   * @returns {number} Minimum amount
   */
  getMinAmount() {
    return this.MIN_AMOUNT;
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;