import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tapyze.onrender.com/api';

class MerchantDeviceService {
  constructor() {
    this.token = null;
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

  // Get merchant's assigned scanners
  async getMerchantScanners() {
    try {
      const response = await this.apiCall('/devices/scanners');
      
      if (response.status === 'success') {
        return {
          success: true,
          scanners: response.data.scanners,
          count: response.results
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get scanners'
      };
    }
  }

  // Assign scanner to merchant
  async assignScanner(scannerData) {
    try {
      const response = await this.apiCall('/devices/scanners/assign', {
        method: 'POST',
        body: JSON.stringify(scannerData),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          scanner: response.data.scanner,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to assign scanner'
      };
    }
  }

  // Update scanner status
  async updateScannerStatus(scannerId, statusData) {
    try {
      const response = await this.apiCall(`/devices/scanners/${scannerId}`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          scanner: response.data.scanner,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update scanner status'
      };
    }
  }

  // Get merchant's RFID cards
  async getMerchantCards() {
    try {
      const response = await this.apiCall('/devices/cards');
      
      if (response.status === 'success') {
        return {
          success: true,
          cards: response.data.cards,
          count: response.results
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get cards'
      };
    }
  }

  // Assign card to customer
  async assignCardToCustomer(customerId, cardData) {
    try {
      const endpoint = customerId ? `/devices/admin/cards/assign/${customerId}` : '/devices/cards/assign';
      const response = await this.apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(cardData),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          card: response.data.card,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to assign card'
      };
    }
  }

  // Verify card PIN
  async verifyCardPin(cardUid, pin) {
    try {
      const response = await this.apiCall('/devices/cards/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ cardUid, pin }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'PIN verification failed',
        data: error.data // This might contain remaining attempts info
      };
    }
  }

  // Change card PIN
  async changeCardPin(cardId, currentPin, newPin) {
    try {
      const response = await this.apiCall(`/devices/cards/${cardId}/change-pin`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPin, newPin }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change PIN'
      };
    }
  }

  // Deactivate card
  async deactivateCard(cardId, reason = null) {
    try {
      const response = await this.apiCall(`/devices/cards/${cardId}/deactivate`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          card: response.data.card,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to deactivate card'
      };
    }
  }

  // Admin functions (if the merchant has admin privileges)
  
  // Reset card PIN (admin only)
  async resetCardPin(cardId, newPin) {
    try {
      const response = await this.apiCall(`/devices/admin/cards/${cardId}/reset-pin`, {
        method: 'PATCH',
        body: JSON.stringify({ newPin }),
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reset PIN'
      };
    }
  }

  // Unlock card PIN (admin only)
  async unlockCardPin(cardId) {
    try {
      const response = await this.apiCall(`/devices/admin/cards/${cardId}/unlock-pin`, {
        method: 'PATCH',
      });
      
      if (response.status === 'success') {
        return {
          success: true,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to unlock PIN'
      };
    }
  }

  // Get all cards (admin only)
  async getAllCards(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.apiCall(`/devices/admin/cards?${queryParams}`);
      
      if (response.status === 'success') {
        return {
          success: true,
          cards: response.data.cards,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get all cards'
      };
    }
  }

  // Get all scanners (admin only)
  async getAllScanners(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.apiCall(`/devices/admin/scanners?${queryParams}`);
      
      if (response.status === 'success') {
        return {
          success: true,
          scanners: response.data.scanners,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get all scanners'
      };
    }
  }
}

// Create and export a singleton instance
const merchantDeviceService = new MerchantDeviceService();
export default merchantDeviceService;