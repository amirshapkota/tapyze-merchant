import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import merchantAuthService from '../services/merchantAuthService';
import styles from '../styles/ForgotPasswordScreenStyles';

const MerchantForgotPasswordScreen = () => {
  const navigation = useNavigation();
  
  // State variables
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: '#E0E0E0' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: '#FF3B30' };
    if (score <= 4) return { score, label: 'Medium', color: '#FFCC00' };
    return { score, label: 'Strong', color: '#34C759' };
  };
  
  const passwordStrength = checkPasswordStrength(newPassword);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      // Cleanup any running timers
    };
  }, []);

  // Handle submit email for password reset
  const handleSubmitEmail = async () => {
    // Basic email validation
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await merchantAuthService.apiCall('/auth/merchant/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.status === 'success') {
        Alert.alert(
          "Code Sent",
          response.message || "A verification code has been sent to your email",
          [{ text: "OK", onPress: () => {
            setStep('verification');
            startResendTimer();
          }}]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error", 
        error.message || "Failed to send reset code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start timer for resend code
  const startResendTimer = () => {
    setResendDisabled(true);
    setTimer(60);
    
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (resendDisabled) return;
    
    setIsLoading(true);
    
    try {
      const response = await merchantAuthService.apiCall('/auth/merchant/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.status === 'success') {
        Alert.alert("Code Resent", "A new verification code has been sent to your email");
        startResendTimer();
      }
    } catch (error) {
      Alert.alert(
        "Error", 
        error.message || "Failed to resend code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submit
  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify the code with the backend using the dedicated endpoint
      const response = await merchantAuthService.apiCall('/auth/merchant/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ 
          code: verificationCode.trim()
        }),
      });

      if (response.status === 'success') {
        // Code is valid, move to password reset step
        setStep('newPassword');
      }
    } catch (error) {
      // Handle verification errors
      if (error.message.includes('invalid') || 
          error.message.includes('expired')) {
        Alert.alert(
          "Invalid Code",
          "The verification code is invalid or has expired. Please check your email and try again, or request a new code.",
          [
            { text: "Try Again", style: "default" }
          ]
        );
      } else {
        Alert.alert(
          "Verification Failed", 
          error.message || "Failed to verify code. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
      // Handle verification errors
      if (error.message.includes('invalid') || 
          error.message.includes('expired')) {
        Alert.alert(
          "Invalid Code",
          "The verification code is invalid or has expired. Please check your email and try again, or request a new code.",
          [
            { text: "Try Again", style: "default" }
          ]
        );
      } else {
        Alert.alert(
          "Verification Failed", 
          error.message || "Failed to verify code. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle set new password
  const handleSetNewPassword = async () => {
    // Validation
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    
    if (passwordStrength.score < 2) {
      Alert.alert(
        "Weak Password", 
        "Please create a stronger password with a mix of uppercase, lowercase, numbers, and special characters"
      );
      return;
    }
    
    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Please confirm your new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const resetData = {
        code: verificationCode.trim(),
        password: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      };

      const response = await merchantAuthService.apiCall('/auth/merchant/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData),
      });

      if (response.status === 'success') {
        Alert.alert(
          "Success",
          response.message || "Your password has been reset successfully",
          [{ 
            text: "Login", 
            onPress: () => {
              navigation.navigate('Auth');
            }
          }]
        );
      }
    } catch (error) {
      if (error.message.includes('invalid') || 
          error.message.includes('expired') || 
          error.message.toLowerCase().includes('code')) {
        Alert.alert(
          "Session Expired",
          "Your verification session has expired. Please start the password reset process again.",
          [
            {
              text: "Start Over",
              onPress: () => setStep('email')
            }
          ]
        );
      } else if (error.message.includes('password')) {
        Alert.alert(
          "Password Error", 
          error.message || "Please check your password requirements and try again."
        );
      } else {
        Alert.alert(
          "Error", 
          error.message || "Failed to reset password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validate form for current step
  const isFormValid = () => {
    switch (step) {
      case 'email':
        return email.trim() && /\S+@\S+\.\S+/.test(email);
      case 'verification':
        return verificationCode.trim().length === 6;
      case 'newPassword':
        return (
          newPassword.trim() &&
          confirmPassword.trim() &&
          newPassword === confirmPassword &&
          newPassword.length >= 6 &&
          passwordStrength.score >= 2
        );
      default:
        return false;
    }
  };

  // Render the email input step
  const renderEmailStep = () => (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={40} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Forgot Password</Text>
        <Text style={styles.screenSubtitle}>
          Enter your email address to receive a verification code
        </Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your registered email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          <Text style={styles.helperText}>
            Enter the email address associated with your merchant account
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          (!isFormValid() || isLoading) && styles.actionButtonDisabled
        ]}
        onPress={handleSubmitEmail}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryActionButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryActionButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </>
  );
  
  // Render the verification code step
  const renderVerificationStep = () => (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Verification</Text>
        <Text style={styles.screenSubtitle}>
          Enter the 6-digit code sent to {email}
        </Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Verification Code *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter the 6-digit code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <Text style={styles.helperText}>
            Check your email for the verification code
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          (!isFormValid() || isLoading) && styles.actionButtonDisabled
        ]}
        onPress={handleVerifyCode}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.secondaryActionButton, resendDisabled && styles.disabledLink]}
        onPress={handleResendCode}
        disabled={resendDisabled || isLoading}
      >
        <Text style={[styles.secondaryActionButtonText, resendDisabled && styles.disabledText]}>
          {resendDisabled ? `Resend code in ${timer}s` : "Resend code"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tertiaryActionButton]}
        onPress={() => setStep('email')}
      >
        <Text style={styles.tertiaryActionButtonText}>
          Use different email address
        </Text>
      </TouchableOpacity>
    </>
  );
  
  // Render the new password step
  const renderNewPasswordStep = () => (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-open" size={40} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Reset Password</Text>
        <Text style={styles.screenSubtitle}>
          Create a new strong password for your merchant account
        </Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              placeholderTextColor="#999"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Password strength indicator */}
          {newPassword ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarContainer}>
                <View 
                  style={[
                    styles.strengthBar, 
                    { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          ) : null}
          
          <Text style={styles.helperText}>
            Use at least 6 characters with a mix of uppercase, lowercase, numbers, and special characters
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Password *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {confirmPassword && newPassword && confirmPassword !== newPassword && (
            <Text style={styles.errorText}>Passwords don't match</Text>
          )}
          {confirmPassword && newPassword && confirmPassword === newPassword && (
            <Text style={styles.successText}>✓ Passwords match</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          (!isFormValid() || isLoading) && styles.actionButtonDisabled
        ]}
        onPress={handleSetNewPassword}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      {/* Required fields note */}
      <Text style={styles.requiredNote}>* Required fields</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.brandName}>TAPYZE</Text>
                <Text style={styles.merchantLabel}>MERCHANT</Text>
              </View>
            </View>
            {step !== 'email' && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (step === 'verification') setStep('email');
                  if (step === 'newPassword') setStep('verification');
                }}
              >
                <Ionicons name="chevron-back" size={28} color="#000000" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Conditional Rendering based on step */}
          {step === 'email' && renderEmailStep()}
          {step === 'verification' && renderVerificationStep()}
          {step === 'newPassword' && renderNewPasswordStep()}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MerchantForgotPasswordScreen;