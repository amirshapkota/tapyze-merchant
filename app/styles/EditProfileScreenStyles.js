import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollViewContent: {
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
  backButton: {
    padding: 5,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  screenTitle: {
    fontSize: 28,
    color: '#000000',
    fontWeight: 'bold',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ed7b0e',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formSection: {
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
  disabledInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F0F0F0',
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
  disabledText: {
    flex: 1,
    color: '#666',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#ed7b0e',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 15,
    marginTop: 20,
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
  saveButtonDisabled: {
    backgroundColor: '#f5a55e',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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