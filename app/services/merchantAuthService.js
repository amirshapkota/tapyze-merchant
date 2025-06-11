import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to match your backend URL
const BASE_URL = 'http://192.168.1.78:5000/api'; // Update as needed

class MerchantAuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
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

  // Merchant Signup
  async merchantSignup(userData) {
    try {
      const response = await this.apiCall('/auth/merchant/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.status === 'success') {
        // Store token and user data
        this.token = response.token;
        this.user = response.data.user;
        
        // Persist to AsyncStorage
        await AsyncStorage.setItem('merchantToken', response.token);
        await AsyncStorage.setItem('merchantData', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.token,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed'
      };
    }
  }

  // Merchant Login
  async merchantLogin(credentials) {
    try {
      const response = await this.apiCall('/auth/merchant/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.status === 'success') {
        // Store token and user data
        this.token = response.token;
        this.user = response.data.user;
        
        // Persist to AsyncStorage
        await AsyncStorage.setItem('merchantToken', response.token);
        await AsyncStorage.setItem('merchantData', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.token,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Check if merchant is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('merchantToken');
      const userData = await AsyncStorage.getItem('merchantData');
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current merchant
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('merchantData');
      if (userData) {
        this.user = JSON.parse(userData);
        return this.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get stored token
  async getToken() {
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

  // Logout
  async logout() {
    try {
      // Clear local state
      this.token = null;
      this.user = null;
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('merchantToken');
      await AsyncStorage.removeItem('merchantData');
      
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

  // Update merchant data in storage
  async updateUserData(userData) {
    try {
      this.user = userData;
      await AsyncStorage.setItem('merchantData', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Error updating user data:', error);
      return { success: false };
    }
  }

  // Forgot password (if you want to implement this)
  async forgotPassword(email) {
    try {
      const response = await this.apiCall('/auth/merchant/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send reset email'
      };
    }
  }

  // Reset password (if you want to implement this)
  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await this.apiCall(`/auth/merchant/reset-password/${token}`, {
        method: 'PATCH',
        body: JSON.stringify({ password, confirmPassword }),
      });

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reset password'
      };
    }
  }
}

// Create and export a singleton instance
const merchantAuthService = new MerchantAuthService();
export default merchantAuthService;