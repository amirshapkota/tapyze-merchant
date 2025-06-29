import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useMerchantAuth } from '../context/MerchantAuthContext';
import styles from '../styles/AuthScreenStyles';

const AuthScreen = ({ navigation }) => {
  const { login, signup, isLoading, error, clearError } = useMerchantAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerNameError, setOwnerNameError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessAddressError, setBusinessAddressError] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessTypeError, setBusinessTypeError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isInputTouched, setIsInputTouched] = useState({
    email: false,
    password: false,
    businessName: false,
    ownerName: false,
    phone: false,
    businessAddress: false,
    businessType: false,
    confirmPassword: false
  });

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Validation effects - only run if fields have been touched
  useEffect(() => {
    if (Object.values(isInputTouched).some(field => field)) {
      validateForm();
    }
  }, [email, password, confirmPassword, businessName, ownerName, phone, businessAddress, businessType, isLoginMode, isInputTouched]);
  
  // Email validation
  const validateEmail = (text) => {
    if (!isInputTouched.email) return true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // Password validation
  const validatePassword = (text) => {
    if (!isInputTouched.password) return true;
    
    if (!text) {
      setPasswordError('Password is required');
      return false;
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Business name validation
  const validateBusinessName = (text) => {
    if (!isLoginMode && isInputTouched.businessName) {
      if (!text) {
        setBusinessNameError('Business name is required');
        return false;
      } else {
        setBusinessNameError('');
        return true;
      }
    }
    return true;
  };

  // Owner name validation
  const validateOwnerName = (text) => {
    if (!isLoginMode && isInputTouched.ownerName) {
      if (!text) {
        setOwnerNameError('Owner name is required');
        return false;
      } else {
        setOwnerNameError('');
        return true;
      }
    }
    return true;
  };

  // Phone validation - Updated to match backend expectation (10 digits)
  const validatePhone = (text) => {
    if (!isLoginMode && isInputTouched.phone) {
      if (!text) {
        setPhoneError('Phone number is required');
        return false;
      } else if (!/^\d{10}$/.test(text)) {
        setPhoneError('Please enter a valid 10-digit phone number');
        return false;
      } else {
        setPhoneError('');
        return true;
      }
    }
    return true;
  };

  // Business address validation
  const validateBusinessAddress = (text) => {
    if (!isLoginMode && isInputTouched.businessAddress) {
      if (!text) {
        setBusinessAddressError('Business address is required');
        return false;
      } else {
        setBusinessAddressError('');
        return true;
      }
    }
    return true;
  };

  // Business type validation
  const validateBusinessType = (text) => {
    if (!isLoginMode && isInputTouched.businessType) {
      if (!text) {
        setBusinessTypeError('Business type is required');
        return false;
      } else {
        setBusinessTypeError('');
        return true;
      }
    }
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (text) => {
    if (!isLoginMode && isInputTouched.confirmPassword) {
      if (!text) {
        setConfirmPasswordError('Please confirm your password');
        return false;
      } else if (text !== password) {
        setConfirmPasswordError('Passwords do not match');
        return false;
      } else {
        setConfirmPasswordError('');
        return true;
      }
    }
    return true;
  };

  // Validate entire form
  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isLoginMode) {
      setIsFormValid(isEmailValid && isPasswordValid);
    } else {
      const isBusinessNameValid = validateBusinessName(businessName);
      const isOwnerNameValid = validateOwnerName(ownerName);
      const isPhoneValid = validatePhone(phone);
      const isBusinessAddressValid = validateBusinessAddress(businessAddress);
      const isBusinessTypeValid = validateBusinessType(businessType);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
      
      setIsFormValid(
        isEmailValid && 
        isPasswordValid && 
        isBusinessNameValid && 
        isOwnerNameValid && 
        isPhoneValid && 
        isBusinessAddressValid &&
        isBusinessTypeValid &&
        isConfirmPasswordValid
      );
    }
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form fields and errors when switching modes
    setEmail('');
    setEmailError('');
    setPassword('');
    setPasswordError('');
    setBusinessName('');
    setBusinessNameError('');
    setOwnerName('');
    setOwnerNameError('');
    setPhone('');
    setPhoneError('');
    setBusinessAddress('');
    setBusinessAddressError('');
    setBusinessType('');
    setBusinessTypeError('');
    setConfirmPassword('');
    setConfirmPasswordError('');
    // Reset touched states
    setIsInputTouched({
      email: false,
      password: false,
      businessName: false,
      ownerName: false,
      phone: false,
      businessAddress: false,
      businessType: false,
      confirmPassword: false
    });
    // Clear any context errors
    clearError();
  };

  const handleSubmit = async () => {
    // Mark all fields as touched for validation
    setIsInputTouched({
      email: true,
      password: true,
      businessName: true,
      ownerName: true,
      phone: true,
      businessAddress: true,
      businessType: true,
      confirmPassword: true
    });
    
    // Validate form again before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isLoginMode) {
      if (isEmailValid && isPasswordValid) {
        const credentials = {
          email: email.trim().toLowerCase(),
          password: password
        };

        const result = await login(credentials);

        if (result.success) {
          Alert.alert(
            'Success',
            result.message || 'Login successful!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigation will be handled automatically by AuthContext
                }
              }
            ]
          );
        } else {
          Alert.alert('Login Failed', result.message || 'Login failed. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Please check your login information');
      }
    } else {
      const isBusinessNameValid = validateBusinessName(businessName);
      const isOwnerNameValid = validateOwnerName(ownerName);
      const isPhoneValid = validatePhone(phone);
      const isBusinessAddressValid = validateBusinessAddress(businessAddress);
      const isBusinessTypeValid = validateBusinessType(businessType);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
      
      if (
        isEmailValid && 
        isPasswordValid && 
        isBusinessNameValid && 
        isOwnerNameValid && 
        isPhoneValid && 
        isBusinessAddressValid &&
        isBusinessTypeValid &&
        isConfirmPasswordValid
      ) {
        const signupData = {
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(), // Send phone as entered
          businessAddress: businessAddress.trim(),
          businessType: businessType.trim(),
          password: password,
          confirmPassword: confirmPassword
        };

        console.log('Signup data being sent:', signupData); // Debug log

        const result = await signup(signupData);

        if (result.success) {
          Alert.alert(
            'Success',
            result.message || 'Account created successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigation will be handled automatically by AuthContext
                }
              }
            ]
          );
        } else {
          Alert.alert('Signup Failed', result.message || 'Account creation failed. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Please check your signup information');
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>
                {isLoginMode ? 'Welcome Back!' : 'Create Account'}
              </Text>
              <Text style={styles.subtitleText}>
                {isLoginMode 
                  ? 'Sign in to access your merchant account' 
                  : 'Get started with TAPYZE for Business'}
              </Text>
            </View>

            {/* Show context error if exists */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              {!isLoginMode && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Business Name</Text>
                    <TextInput
                      style={[styles.input, businessNameError ? styles.inputError : null]}
                      placeholder="Your business name"
                      value={businessName}
                      onChangeText={(text) => {
                        setBusinessName(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, businessName: true});
                        validateBusinessName(businessName);
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                    {businessNameError ? (
                      <Text style={styles.errorText}>{businessNameError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Owner Name</Text>
                    <TextInput
                      style={[styles.input, ownerNameError ? styles.inputError : null]}
                      placeholder="Full name of business owner"
                      value={ownerName}
                      onChangeText={(text) => {
                        setOwnerName(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, ownerName: true});
                        validateOwnerName(ownerName);
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                    {ownerNameError ? (
                      <Text style={styles.errorText}>{ownerNameError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={[styles.input, phoneError ? styles.inputError : null]}
                      placeholder="1234567890"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, phone: true});
                        validatePhone(phone);
                      }}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                    {phoneError ? (
                      <Text style={styles.errorText}>{phoneError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Business Address</Text>
                    <TextInput
                      style={[styles.input, businessAddressError ? styles.inputError : null]}
                      placeholder="Full address of your business"
                      value={businessAddress}
                      onChangeText={(text) => {
                        setBusinessAddress(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, businessAddress: true});
                        validateBusinessAddress(businessAddress);
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                    {businessAddressError ? (
                      <Text style={styles.errorText}>{businessAddressError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Business Type</Text>
                    <TextInput
                      style={[styles.input, businessTypeError ? styles.inputError : null]}
                      placeholder="e.g. Restaurant, Retail, Services"
                      value={businessType}
                      onChangeText={(text) => {
                        setBusinessType(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, businessType: true});
                        validateBusinessType(businessType);
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                    {businessTypeError ? (
                      <Text style={styles.errorText}>{businessTypeError}</Text>
                    ) : null}
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                  }}
                  onBlur={() => {
                    setIsInputTouched({...isInputTouched, email: true});
                    validateEmail(email);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                    }}
                    onBlur={() => {
                      setIsInputTouched({...isInputTouched, password: true});
                      validatePassword(password);
                    }}
                    secureTextEntry={!isPasswordVisible}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} 
                      size={22} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {!isLoginMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, confirmPassword: true});
                        validateConfirmPassword(confirmPassword);
                      }}
                      secureTextEntry={!isConfirmPasswordVisible}
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                      disabled={isLoading}
                    >
                      <Ionicons 
                        name={isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'} 
                        size={22} 
                        color="#666666" 
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>
              )}

              {isLoginMode && (
                <TouchableOpacity 
                  style={styles.forgotPasswordContainer} 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isLoading || (Object.values(isInputTouched).some(field => field) && !isFormValid)) && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={isLoading || (Object.values(isInputTouched).some(field => field) && !isFormValid)}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>
                      {isLoginMode ? 'Signing In...' : 'Creating Account...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLoginMode ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
                <Text style={styles.toggleButtonText}>
                  {isLoginMode ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AuthScreen;