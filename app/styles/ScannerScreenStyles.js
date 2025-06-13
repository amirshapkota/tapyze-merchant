import { StyleSheet } from "react-native";

// Styles for the Scanner Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
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
  // Greeting section - Identical to Dashboard
  greetingSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scannerCardContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 5,
  },
  scannerCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLogo: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#ed7b0e',
    borderRadius: 6,
  },
  cardLogoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardType: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    marginBottom: 20,
  },
  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardId: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  connectionIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  connectionActive: {
    backgroundColor: '#4CAF50',
  },
  connectionInactive: {
    backgroundColor: '#FF3B30',
  },
  connectionTextContainer: {
    flex: 1,
  },
  connectionStatus: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  connectionSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  scanningContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
  },
  scanningText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  checkConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ed7b0e',
    borderRadius: 10,
    paddingVertical: 12,
  },
  checkConnectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 5,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  valueConnected: {
    color: '#4CAF50',
  },
  valueDisconnected: {
    color: '#FF3B30',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#FF3B30',
  },
  paymentActionContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  paymentActionButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  paymentActionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 15,
  },
  paymentActionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
manualIpButtonContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  manualIpButton: {
    borderWidth: 1,
    borderColor: '#ed7b0e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  manualIpButtonText: {
    fontSize: 16,
    color: '#ed7b0e',
    fontWeight: '600',
  },

 wifiActionContainer: {
    paddingHorizontal: 15,
  },
 wifiActionButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
  },
 wifiActionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
  },
 wifiActionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpSection: {
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
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  textInput: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    height: 50,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F9F9F9',
  },

  inputContainerFocused: {
    borderColor: '#ed7b0e',
    backgroundColor: '#FFFFFF',
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },

  inputIcon: {
    marginRight: 10,
  },

  // Update these dropdown styles in your stylesheet

dropdownContainer: {
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 12,
  backgroundColor: '#F9F9F9',
  minHeight: 50,
  position: 'relative',
  zIndex: 1000,
},

dropdownContainerFocused: {
  borderColor: '#ed7b0e',
  backgroundColor: '#FFFFFF',
},

dropdownButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  height: 50,
},

dropdownButtonText: {
  fontSize: 16,
  color: '#333',
  flex: 1,
},

dropdownPlaceholder: {
  fontSize: 16,
  color: '#888',
  flex: 1,
},

dropdownIcon: {
  marginLeft: 10,
},

dropdownList: {
  backgroundColor: '#FFFFFF',
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
  position: 'absolute',
  top: 80,
  left: -1,
  right: -1,
  zIndex: 1001,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 5,
},

dropdownItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 15,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},

dropdownItemText: {
  fontSize: 16,
  color: '#333',
  flex: 1,
},

dropdownItemSelected: {
  backgroundColor: '#FFF5F0',
},

dropdownItemSelectedText: {
  color: '#ed7b0e',
  fontWeight: '600',
},

  assignmentButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ed7b0e',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  assignmentButtonDisabled: {
    backgroundColor: '#f5a55e',
  },

  assignmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  assignmentFormSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  requiredIndicator: {
    color: '#ed7b0e',
    fontSize: 14,
    fontWeight: '600',
  },

  viewAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 5,
  },

  viewAllText: {
    fontSize: 14,
    color: '#ed7b0e',
    fontWeight: '600',
  },
});

export default styles;