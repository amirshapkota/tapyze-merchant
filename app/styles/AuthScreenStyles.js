import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.06,
    marginBottom: height * 0.02, 
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 15, 
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8, 
  },
  subtitleText: {
    fontSize: 15, 
    color: '#333333',
    textAlign: 'center',
    marginHorizontal: 30,
  },
  formContainer: {
    width: width * 0.85,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 16, 
  },
  inputLabel: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15, 
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 3,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15, 
  },
  eyeIcon: {
    padding: 8, 
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#ed7b0e',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ed7b0e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#f8c094',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16, 
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666666',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25, 
  },
  toggleText: {
    color: '#333333',
    fontSize: 14,
  },
  toggleButtonText: {
    color: '#ed7b0e',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default styles;