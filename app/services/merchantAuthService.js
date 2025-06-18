import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tapyze.onrender.com/api';

class MerchantAuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.isInitialized = false;
  }

  // Initialize token on service creation
  async initializeToken() {
    if (this.isInitialized) return;
    
    try {
      const token = await AsyncStorage.getItem('merchantToken');
      if (token) {
        this.token = token;
        console.log('Token initialized from storage');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing token:', error);
      this.isInitialized = true;
    }
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Ensure we have the latest token for authenticated requests
    if (!this.isInitialized) {
      await this.initializeToken();
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available (like customer auth service)
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
      console.log('Making authenticated API call to:', endpoint);
    }

    try {
      console.log('API Call:', url, config.method || 'GET');
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', response.status, data);
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
      console.log('Service: Starting signup...');
      const response = await this.apiCall('/auth/merchant/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.status === 'success') {
        console.log('Service: Signup successful, storing credentials...');
        
        // Store token and user data
        this.token = response.token;
        this.user = response.data.user;
        
        // Persist to AsyncStorage
        await AsyncStorage.setItem('merchantToken', response.token);
        await AsyncStorage.setItem('merchantData', JSON.stringify(response.data.user));
        
        console.log('Service: Credentials stored successfully');
        
        return {
          success: true,
          user: response.data.user,
          token: response.token,
          message: response.message
        };
      } else {
        console.log('Service: Signup failed - invalid response status');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('Service: Signup error:', error);
      return {
        success: false,
        message: error.message || 'Signup failed'
      };
    }
  }

  // Merchant Login
  async merchantLogin(credentials) {
    try {
      console.log('Service: Starting login...');
      const response = await this.apiCall('/auth/merchant/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.status === 'success') {
        console.log('Service: Login successful, storing credentials...');
        
        // Store token and user data
        this.token = response.token;
        this.user = response.data.user;
        
        // Persist to AsyncStorage
        await AsyncStorage.setItem('merchantToken', response.token);
        await AsyncStorage.setItem('merchantData', JSON.stringify(response.data.user));
        
        // Verify storage
        const storedToken = await AsyncStorage.getItem('merchantToken');
        console.log('Service: Token stored and verified:', !!storedToken);
        
        return {
          success: true,
          user: response.data.user,
          token: response.token,
          message: response.message
        };
      } else {
        console.log('Service: Login failed - invalid response status');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('Service: Login error:', error);
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
      
      console.log('Service: Checking authentication - token exists:', !!token);
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.isInitialized = true;
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
      if (!this.isInitialized) {
        await this.initializeToken();
      }
      
      if (!this.token) {
        const token = await AsyncStorage.getItem('merchantToken');
        if (token) {
          this.token = token;
        }
      }
      
      return this.token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Logout
  async logout() {
    try {
      console.log('Service: Logging out...');
      
      // Clear local state
      this.token = null;
      this.user = null;
      this.isInitialized = false;
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('merchantToken');
      await AsyncStorage.removeItem('merchantData');
      
      console.log('Service: Logout completed');
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

  // Forgot password
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

  // Reset password
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