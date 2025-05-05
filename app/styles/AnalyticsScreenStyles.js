import { StyleSheet } from "react-native";

// Styles for the Analytics Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
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
  scrollViewContent: {
    paddingBottom: 30,
  },
  timeframeContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 3,
    alignSelf: 'flex-start',
  },
  timeframeOption: {
    paddingVertical: 8,
    paddingHorizontal: 20,
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
  chartTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  chartTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  chartTypeActive: {
    backgroundColor: '#000000',
  },
  chartTypeText: {
    color: '#666',
    fontWeight: '500',
    marginLeft: 5,
  },
  chartTypeActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 7,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartMetrics: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  positiveChange: {
    backgroundColor: '#28A745',
  },
  negativeChange: {
    backgroundColor: '#DC3545',
  },
  changeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 3,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -15,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '31%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionsIcon: {
    backgroundColor: '#ed7b0e',
  },
  averageIcon: {
    backgroundColor: '#000000',
  },
  customersIcon: {
    backgroundColor: '#666666',
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  summaryChangeText: {
    fontSize: 12,
    marginLeft: 3,
  },
  positiveChangeText: {
    color: '#28A745',
  },
  negativeChangeText: {
    color: '#DC3545',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  pieChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  barChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 5,
  },
  productHeaderText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productName: {
    flex: 2,
    fontWeight: '500',
    color: '#000000',
  },
  productQuantity: {
    flex: 1,
    textAlign: 'center',
    color: '#000000',
  },
  productRevenue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
    color: '#000000',
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  insightTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  insightValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  insightNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  insightChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 4,
  },
  insightChangePositive: {
    color: '#28A745',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 3,
  },
  insightChangeNegative: {
    color: '#DC3545',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 3,
  },
  insightDescription: {
    fontSize: 12,
    color: '#666',
  },
  exportSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ed7b0e',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 10,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  exportNote: {
    fontSize: 12,
    color: '#666',
  },
});

export default styles;