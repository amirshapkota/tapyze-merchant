import { StyleSheet } from "react-native";

// Styles for the Create Payment Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  // Header styles - Matching Scanner screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 45,
    width: 45,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  merchantLabel: {
    fontSize: 12,
    color: '#ed7b0e',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profileButton: {
    padding: 5,
  },
  // Title section
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  screenTitle: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  
  // Amount entry styles
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  currencySymbol: {
    fontSize: 38,
    fontWeight: '500',
    color: '#000000',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    minWidth: 150,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: '#ed7b0e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  
  // Tap screen styles
  tapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  amountDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  amountDisplayLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 5,
  },
  amountDisplayValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  tapIconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tapCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ed7b0e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ed7b0e',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  tapInstructions: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  tapSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  simulateTapButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  simulateTapText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Processing styles
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  processingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 20,
    marginBottom: 10,
  },
  processingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Result styles (success/failure)
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  successAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  successTransactionId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  failedIcon: {
    marginBottom: 20,
  },
  failedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 15,
  },
  failedSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newPaymentButton: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#ed7b0e',
  },
  newPaymentText: {
    color: '#ed7b0e',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default styles;