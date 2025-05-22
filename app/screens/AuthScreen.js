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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/AuthScreenStyles';

const AuthScreen = ({ navigation }) => {
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

  // Phone validation
  const validatePhone = (text) => {
    if (!isLoginMode && isInputTouched.phone) {
      if (!text) {
        setPhoneError('Phone number is required');
        return false;
      } else if (!/^\d{10}$/.test(text.replace(/\D/g, ''))) {
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
  };

  const handleSubmit = () => {
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
        // Handle login logic
        console.log('Login with:', email, password);
        // Navigate to main app after successful login
        // navigation.navigate('Dashboard');
        Alert.alert('Success', 'Login successful');
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
        // Handle signup logic
        console.log('Signup with:', {
          businessName,
          ownerName,
          email,
          phone,
          businessAddress,
          businessType,
          password
        });
        // Navigate to main app or verification screen after successful signup
        // navigation.navigate('Dashboard');
        Alert.alert('Success', 'Account created successfully');
      } else {
        Alert.alert('Error', 'Please check your signup information');
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Format phone number as user types
  const formatPhoneNumber = (text) => {
    // Strip all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format: (XXX) XXX-XXXX
    let formatted = limited;
    if (limited.length > 0) {
      formatted = limited.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3) => {
        let result = '';
        if (p1) result += `(${p1}`;
        if (p2) result += `) ${p2}`;
        if (p3) result += `-${p3}`;
        return result;
      });
    }
    
    return formatted;
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
                    />
                    {ownerNameError ? (
                      <Text style={styles.errorText}>{ownerNameError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={[styles.input, phoneError ? styles.inputError : null]}
                      placeholder="(123) 456-7890"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(formatPhoneNumber(text));
                      }}
                      onBlur={() => {
                        setIsInputTouched({...isInputTouched, phone: true});
                        validatePhone(phone);
                      }}
                      keyboardType="phone-pad"
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
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
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
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  Object.values(isInputTouched).some(field => field) && !isFormValid && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={Object.values(isInputTouched).some(field => field) && !isFormValid}
              >
                <Text style={styles.submitButtonText}>
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
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