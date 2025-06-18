import React, { createContext, useContext, useEffect, useReducer } from 'react';
import merchantAuthService from '../services/merchantAuthService';
import merchantWalletService from '../services/merchantWalletService';
import paymentService from '../services/merchantPaymentService';
import merchantDeviceService from '../services/merchantDeviceService';

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

// Action types
const AUTH_ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const MerchantAuthContext = createContext();

// Provider component
export const MerchantAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to clear all service caches
  const clearAllServiceCaches = () => {
    console.log('Clearing all service caches...');
    try {
      merchantWalletService.clearCache?.();
      paymentService.clearCache?.();
      merchantDeviceService.clearCache?.();
    } catch (error) {
      console.error('Error clearing service caches:', error);
    }
  };

  // Check if merchant is already authenticated on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const isAuthenticated = await merchantAuthService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await merchantAuthService.getCurrentUser();
        const token = await merchantAuthService.getToken();
        
        console.log('Auth check: Found authenticated user:', user?._id);
        
        dispatch({
          type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
          payload: { user, token }
        });
      } else {
        console.log('Auth check: No authenticated user found');
        clearAllServiceCaches();
        dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      clearAllServiceCaches();
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });

      const result = await merchantAuthService.merchantLogin(credentials);

      if (result.success) {
        console.log('Login successful for user:', result.user._id);
        
        // Clear all service caches before setting new user
        clearAllServiceCaches();
        
        dispatch({
          type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: result.token
          }
        });
        return result;
      } else {
        dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: result.message });
        return result;
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });

      const result = await merchantAuthService.merchantSignup(userData);

      if (result.success) {
        console.log('Signup successful for user:', result.user._id);
        
        // Clear all service caches before setting new user
        clearAllServiceCaches();
        
        dispatch({
          type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: result.token
          }
        });
        return result;
      } else {
        dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: result.message });
        return result;
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user:', state.user?._id);
      
      // Clear all service caches first
      clearAllServiceCaches();
      
      await merchantAuthService.logout();
      dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
      
      console.log('Logout completed');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear everything even if logout fails
      clearAllServiceCaches();
      dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
      return { success: false, message: error.message };
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const result = await merchantAuthService.updateUserData(userData);
      if (result.success) {
        console.log('User updated:', userData._id);
        dispatch({ type: AUTH_ACTION_TYPES.UPDATE_USER, payload: userData });
      }
      return result;
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: error.message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });

      const result = await merchantAuthService.forgotPassword(email);
      
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: false });
      
      if (!result.success) {
        dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: result.message });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });
  };

  const value = {
    // State
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    token: state.token,
    error: state.error,
    
    // Actions
    login,
    signup,
    logout,
    updateUser,
    forgotPassword,
    clearError,
    checkAuthState,
  };

  return (
    <MerchantAuthContext.Provider value={value}>
      {children}
    </MerchantAuthContext.Provider>
  );
};

// Hook to use auth context
export const useMerchantAuth = () => {
  const context = useContext(MerchantAuthContext);
  
  if (!context) {
    throw new Error('useMerchantAuth must be used within a MerchantAuthProvider');
  }
  
  return context;
};

export default MerchantAuthContext;