import { StyleSheet } from "react-native";

// Styles for the Dashboard Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollViewContent: {
    paddingBottom: 20,
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
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 7,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  statsCurrency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 5,
  },
  eyeButton: {
    marginLeft: 10,
    padding: 5,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 3,
  },
  timeframeOption: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  timeframeActive: {
    backgroundColor: '#ed7b0e',
  },
  timeframeText: {
    color: '#666',
    fontWeight: '500',
  },
  timeframeActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#ed7b0e',
  },
  secondaryButton: {
    backgroundColor: '#000000',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#ed7b0e',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  quickActionItem: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  cardContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  terminalCard: {
    height: 180,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
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
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardId: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
  },
  cardType: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 123, 14, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  promotionsList: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  promotionBanner: {
    width: 280,
    borderRadius: 14,
    padding: 16,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  promotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promotionIcon: {
    marginRight: 12,
  },
  promotionTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  promotionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    width: 170,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#ed7b0e',
  },
  tabText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 15,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  receiveIcon: {
    backgroundColor: '#ed7b0e',
  },
  refundIcon: {
    backgroundColor: '#555555',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#666',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#ed7b0e',
  },
  negativeAmount: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalContent: {
    paddingBottom: 20,
  },
  detailsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailsLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  centered: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},

loadingText: {
  marginTop: 15,
  fontSize: 16,
  color: '#666666',
  fontWeight: '500',
},

errorText: {
  fontSize: 18,
  color: '#FF3B30',
  textAlign: 'center',
  marginTop: 15,
  marginBottom: 20,
  fontWeight: '600',
},

retryButton: {
  backgroundColor: '#ed7b0e',
  paddingHorizontal: 30,
  paddingVertical: 12,
  borderRadius: 8,
},

retryButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},

// Empty State (when no transactions found)
emptyStateContainer: {
  alignItems: 'center',
  paddingVertical: 40,
  paddingHorizontal: 20,
},

emptyStateText: {
  fontSize: 18,
  color: '#666666',
  fontWeight: '600',
  marginTop: 15,
  textAlign: 'center',
},

emptyStateSubtext: {
  fontSize: 14,
  color: '#999999',
  marginTop: 8,
  textAlign: 'center',
  lineHeight: 20,
},
});

export default styles;