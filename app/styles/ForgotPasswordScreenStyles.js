import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  iconCircle: {
    width: 90,
    height: 90,
    backgroundColor: '#ed7b0e',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ed7b0e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  titleSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 25,
  },
  screenTitle: {
    fontSize: 28,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    height: 50,
  },
  eyeIcon: {
    padding: 5,
  },
  actionButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 15,
    marginTop: 25,
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
    height: 55,
  },
  actionButtonDisabled: {
    backgroundColor: '#f5a55e',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 12,
  },
  secondaryActionButtonText: {
    color: '#ed7b0e',
    fontSize: 15,
    fontWeight: '500',
  },
  tertiaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingVertical: 10,
  },
  tertiaryActionButtonText: {
    color: '#666',
    fontSize: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  strengthBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginLeft: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
    marginLeft: 2,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    marginLeft: 2,
  },
  disabledLink: {
    opacity: 0.7,
  },
  disabledText: {
    color: '#999',
  },
  requiredNote: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default styles;