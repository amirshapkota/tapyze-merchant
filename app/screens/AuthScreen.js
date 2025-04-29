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
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation effects
  useEffect(() => {
    validateForm();
  }, [email, password, confirmPassword, businessName, isLoginMode]);
  
  // Email validation
  const validateEmail = (text) => {
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
    if (!isLoginMode && !text) {
      setBusinessNameError('Business name is required');
      return false;
    } else {
      setBusinessNameError('');
      return true;
    }
  };

  // Confirm password validation
  const validateConfirmPassword = (text) => {
    if (!isLoginMode) {
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
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
      setIsFormValid(isEmailValid && isPasswordValid && isBusinessNameValid && isConfirmPasswordValid);
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
    setConfirmPassword('');
    setConfirmPasswordError('');
  };

  const handleSubmit = () => {
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
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
      
      if (isEmailValid && isPasswordValid && isBusinessNameValid && isConfirmPasswordValid) {
        // Handle signup logic
        console.log('Signup with:', businessName, email, password);
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
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Business Name</Text>
                  <TextInput
                    style={[styles.input, businessNameError ? styles.inputError : null]}
                    placeholder="Your business name"
                    value={businessName}
                    onChangeText={(text) => {
                      setBusinessName(text);
                      validateBusinessName(text);
                    }}
                    autoCapitalize="words"
                  />
                  {businessNameError ? (
                    <Text style={styles.errorText}>{businessNameError}</Text>
                  ) : null}
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateEmail(text);
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
                      validatePassword(text);
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
                        validateConfirmPassword(text);
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
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isFormValid && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid}
              >
                <Text style={styles.submitButtonText}>
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <Image 
                  source={require('../assets/google-icon.png')} 
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>
                  {isLoginMode ? 'Sign in with Google' : 'Sign up with Google'}
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